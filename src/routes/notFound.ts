import express from 'express';

const notFound = (req: express.Request, res: express.Response) => res.status(404).send('Unknown endpoint.')

export default notFound