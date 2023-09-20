import express from 'express';
import User, { IUser, IUserDocument } from '../models/User';
import asyncWrapper from '../middleware/async';
import { createCustomError } from '../errors/custom-error';
import mongoose, { Query } from 'mongoose';
import Product, { IProduct, IProductDocument } from '../models/Product';


const getAllProductsStatic = asyncWrapper(async (req: express.Request, res: express.Response) => {
    const products = await Product.find({})
    res.status(200).json({ success: true, products, nbHits: products.length });
});

const getProducts = asyncWrapper(async (req: express.Request, res: express.Response) => {
    let result: Query<IProductDocument[], IProductDocument> = Product.find({})
    let allProducts: IProduct[]

    if (req.query.page || req.query.limit) {
        const page: number = Number(req.query.page) || 1;
        const limit: number = Number(req.query.limit) || 10;
        const skip: number = (page - 1) * limit;
        const sort: string = String(req.query.sort)

        result = result.skip(skip).limit(limit);
        console.log({ skip, limit })
    }

    if (req.query.sort) {
        const sort = String(req.query.sort)
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList);
    } // else {
    // result = result.sort('createdAt');
    // }



    const count: number = await Product.count()
    allProducts = await result

    res.status(200).json({ success: true, products: allProducts, count: count || allProducts.length })
})

const createProduct = asyncWrapper(async (req: express.Request, res: express.Response) => {
    const { title, media, description, categories }: IProduct = req.body
    const product: IProduct = await Product.create({ title, media, description, categories })
    res.status(201).json({ success: true, product })
})


const getProduct = asyncWrapper(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // const { id }: { id: mongoose.Types.ObjectId } = req.body
    const product: IProduct | null = await Product.findById(req.params.id).populate('categories').exec()

    if (!product) {
        return next(createCustomError('could not find the product id', 404))
    }
    res.status(200).json({ success: true, product })
})

const updateProduct = asyncWrapper(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const updateOptions = { new: true, runValidators: true }
    const product: IProduct | null = await Product.findByIdAndUpdate(req.params.id, req.body, updateOptions).exec()
    if (!product) {
        return next(createCustomError('could not find the product id', 404))
    }
    res.status(200).json({ success: true, product })
})

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

export {
    getProducts,
    getProduct,
    createProduct
}