import express from 'express';
import passport from 'passport';
import User, { IUser, IUserDocument } from '../models/User';
import asyncWrapper from '../middleware/async';
import fetch from 'node-fetch';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import RefreshToken, { IRefreshToken, IRefreshTokenDocument, PopulatedIRefreshTokenDocument } from '../models/RefreshToken';
import { createCustomError } from '../errors/custom-error';
import { Query } from 'mongoose';

interface IGoogleUser {
    id?: string,
    email?: string,
    verified_email?: boolean,
    name?: string,
    given_name?: string,
    family_name?: string,
    picture?: string,
    locale?: string
}

const redirectGoogleOAuth = passport.authenticate("google", {
    scope: ["email", "profile"],
})

const generateAccessToken = (user: IUser) =>
    jwt.sign({
        id: user.id,
        googleId: user.googleId,
        name: user.name,
        email: user.email,
        picture: user.picture
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })

const generateUserTokens = async (user: IUser, ipAddress: string) => {
    const accessToken = generateAccessToken(user)
    const refreshToken = (await RefreshToken.generateRefreshToken(user, ipAddress)).token
    return { accessToken, refreshToken }
}

const googleAuthenticationCallback = asyncWrapper(async (req: express.Request, res: express.Response) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return // @TODO ERROR
    }

    try {
        const response = await fetch("https://www.googleapis.com/userinfo/v2/me",
            {
                headers: { Authorization: authHeader }
            }
        );
        const googleUser: IGoogleUser = await response.json();
        const user: IUser | null = await signUser(googleUser);

        if (!user) {
            return // @TODO ERROR
        }

        const { accessToken, refreshToken } = await generateUserTokens(user, req.ip)
        res.status(201).json({ success: true, user, accessToken, refreshToken })
    } catch (err) {
        console.error(err) // @TODO ERROR
    }
});

const refreshAccessToken = asyncWrapper(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const refreshToken: string = req.body.refreshToken
    if (!refreshToken) {
        return res.sendStatus(403)
    }

    const existingRefreshTokenObj = await RefreshToken.getRefreshToken(refreshToken)

    if (!existingRefreshTokenObj?.isActive) {
        return res.sendStatus(403)
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateUserTokens(existingRefreshTokenObj.user, req.ip)

    res.json({ refreshToken: newRefreshToken, accessToken: newAccessToken, user: existingRefreshTokenObj.user })
})

const authenticateToken = asyncWrapper(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]
    if (token === null) {
        return res.sendStatus(401) // .status(401).json({ success: false, message: 'could not find authenticate user. please try log in again...' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403)
        }
        req.user = user
        next()
    })
})

const signUser = async (user: IGoogleUser) => {
    try {
        const existingUser = await User.findOne({ 'googleId': user.id });
        if (existingUser) {
            console.log('Logged in existing user...', { name: user.name })
            return existingUser
        }
        const newUser = new User({
            googleId: user.id,
            name: user.name,
            email: user.email,
            picture: user.picture
        });
        console.log('Creating new user...', { name: user.name });
        await newUser.save();
        return newUser;
    } catch (error) {
        return null
    }
}

const getUsers = asyncWrapper(async (req: express.Request, res: express.Response) => {
    let result: Query<IUserDocument[], IUserDocument> = User.find({})
    let allUsers: IUser[]

    if (req.query.page || req.query.limit) {
        const page: number = Number(req.query.page) || 1;
        const limit: number = Number(req.query.limit) || 10;
        const skip: number = (page - 1) * limit;

        result = result.skip(skip).limit(limit);
        console.log({ skip, limit })
    }

    const count: number = await User.count()
    allUsers = await result
    res.status(200).json({ success: true, users: allUsers, count: count || allUsers.length })
})

const updateUser = asyncWrapper(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const updateOptions = { new: true, runValidators: true }
    const user: IUser | null = await User.findByIdAndUpdate(req.params.id, req.body, updateOptions).exec()

    if (!user) {
        return next(createCustomError('could not find the user id', 404))
    }
    res.status(200).json({ success: true, user })
})

const deleteUser = asyncWrapper(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user: IUser | null = await User.findByIdAndDelete(req.params.id).exec()
    const userObjectId = req.params.id as string

    if (!user) {
        return next(createCustomError('could not find the user id', 404))
    }

    console.log({ PlayerId: user._id || userObjectId })
    res.status(200).json({ success: true, user })
})

export {
    redirectGoogleOAuth,
    googleAuthenticationCallback,
    authenticateToken,
    refreshAccessToken
}