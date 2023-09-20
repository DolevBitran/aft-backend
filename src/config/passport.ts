import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth2'
// import User, { IUser } from '../models/User';
import * as Passport from 'passport';
import { PassportStatic } from 'passport';
import User, { IUser } from '../models/User';


const config = (passport: PassportStatic) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:8001/auth/google/callback",
        passReqToCallback: true
    },
        async (request: Express.Request, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) => {
            // console.log({ profile })
            try {
                const existingUser = await User.findOne({ 'googleId': profile.id });
                if (existingUser) {
                    return done(null, existingUser);
                }
                console.log('Creating new user...');
                const newUser = new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    email: profile.emails?.[0].value,
                });
                await newUser.save();
                return done(null, newUser);
            } catch (error) {
                return done(error, false)
            }
        }
    ));

    passport.serializeUser((user: IUser, done: VerifyCallback) => {
        console.log('serialize', user)
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done: VerifyCallback) => {
        const user = await User.findById(id);
        console.log('deserializeUser', { user, id })
        done(null, user);
    });
}



export default config;