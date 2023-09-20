import express from 'express';
import { CustomAPIError } from '../errors/custom-error';

const errorHandlerMiddleware: express.ErrorRequestHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof CustomAPIError) {
        const { statusCode, message } = err
        return res.status(statusCode).json({ msg: message })
    }
    console.log(err)
    return res.status(500).json({ msg: 'Something went wrong, please try again.' })

}

export default errorHandlerMiddleware