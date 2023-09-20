import dotenv from "dotenv"
// initialize configuration
dotenv.config();

import express from 'express';

import products from './routes/products';
import categories from './routes/categories';
import images from './routes/images';
import auth from './routes/auth';
import notFound from './routes/notFound';

// import errorHandlerMiddleware from './middleware/error-handler';

import connectDB from './db/connect';
import cors from 'cors';

import config from "./config/passport";
import passport from "passport";
import session from 'express-session';
import User, { IUser } from "./models/User";
import { VerifyCallback } from "passport-google-oauth2";
import cookieSession from "cookie-session";
import bodyParser from 'body-parser';

const app = express();

const allowedOrigins = ['http://localhost:19006', 'http://localhost:19000', 'http://localhost:8081', '*'];

const options: cors.CorsOptions = {
    origin: '*'
};


// middleware
app.use(cors(options));
app.use(express.json({ limit: '2mb' }))
// parse application/json
app.use(bodyParser.json({ limit: '2mb' }))
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ limit: '2mb', extended: false }))

app.use(
    cookieSession({
        maxAge: 24 * 60 * 60 * 1000,
        keys: [process.env.CLIENT_SECRET],
    })
);

// app.use(session({
//     secret: process.env.CLIENT_SECRET,
//     resave: false,
//     saveUninitialized: true
// }))

// OAuth2 passport init
config(passport)
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/api/', categories, products)
app.use('/auth/', auth)
app.use('/image/', images)
app.use(notFound)

// error-handler
// app.use(errorHandlerMiddleware)

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen((port as number), '0.0.0.0', () => console.log(`App is listening on port ${port}...`))
    } catch (err) {
        console.log(err)
    }
}

start()