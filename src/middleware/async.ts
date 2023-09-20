import express from 'express';

type AsyncRequestHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>;

const asyncWrapper = (fn: AsyncRequestHandler) => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            await fn(req, res, next)
        } catch (err) {
            next(err)
        }
    }
}

export default asyncWrapper