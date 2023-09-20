// import express from 'express';
// import User, { IUser, IUserDocument } from '../models/User';
// import asyncWrapper from '../middleware/async';
// import { createCustomError } from '../errors/custom-error';
// import { Query } from 'mongoose';

// const getUsers = asyncWrapper(async (req: express.Request, res: express.Response) => {
//     let result: Query<IUserDocument[], IUserDocument> = User.find({})
//     let allUsers: IUser[]

//     if (req.query.page || req.query.limit) {
//         const page: number = Number(req.query.page) || 1;
//         const limit: number = Number(req.query.limit) || 10;
//         const skip: number = (page - 1) * limit;

//         result = result.skip(skip).limit(limit);
//         console.log({ skip, limit })
//     }

//     const count: number = await User.count()
//     allUsers = await result

//     res.status(200).json({ success: true, users: allUsers, count: count || allUsers.length })
// })

// const createUser = asyncWrapper(async (req: express.Request, res: express.Response) => {
//     const { name, level, title }: { name: string, level: number, title: string } = req.body
//     const user: IUser = await User.create({ Nickname: name, level, Title: title })
//     res.status(201).json({ success: true, user })
// })

// const getUser = asyncWrapper(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     const user: IUser | null = await User.findById(req.params.id).exec()

//     if (!user) {
//         return next(createCustomError('could not find the user id', 404))
//     }
//     res.status(200).json({ success: true, user })
// })

// const updateUser = asyncWrapper(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     const updateOptions = { new: true, runValidators: true }
//     const user: IUser | null = await User.findByIdAndUpdate(req.params.id, req.body, updateOptions).exec()

//     if (!user) {
//         return next(createCustomError('could not find the user id', 404))
//     }
//     res.status(200).json({ success: true, user })
// })

// const deleteUser = asyncWrapper(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     const user: IUser | null = await User.findByIdAndRemove(req.params.id).exec()

//     if (!user) {
//         return next(createCustomError('could not find the user id', 404))
//     }
//     res.status(200).json({ success: true, user })
// })

// const getUserCount = asyncWrapper(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     const count: number = await User.count()
//     res.status(200).json({ success: true, count })
// })

// export {
//     getUsers,
//     createUser,
//     getUser,
//     updateUser,
//     deleteUser,
//     getUserCount
// }