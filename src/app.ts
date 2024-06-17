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
import session from 'express-session';
import bodyParser from 'body-parser';
import { ObjectId } from "mongoose";

declare module 'express-session' {
    interface SessionData {
        cart: {
            [productId: string]: {

            }
        }
    }
}

const app = express();

const allowedOrigins = ['http://localhost:19006', 'http://localhost:19000', 'http://localhost:8081', 'http://10.100.102.104:8081', ' http://10.100.102.16:8081'];

const options: cors.CorsOptions = {
    origin: (origin: any, callback: any) => {
        return callback(null, true)
        // console.log({ origin })
        // if (allowedOrigins.indexOf(origin) !== -1) {
        //     callback(null, true)
        // } else {
        //     callback(new Error('Not allowed by CORS'))
        // }
    },
    credentials: true
};

const store = new session.MemoryStore()

app.use(cors(options));
app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
    },
    resave: false,
    saveUninitialized: false,
    store
}))
app.use(express.json({ limit: '2mb' }))
// parse application/json
app.use(bodyParser.json({ limit: '2mb' }))
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ limit: '2mb', extended: false }))

// routes
app.use('/api/', categories, products, cart)
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