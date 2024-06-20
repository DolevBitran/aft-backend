import express from 'express';
import asyncWrapper from '../middleware/async';
import { createCustomError } from '../errors/custom-error';
import { Query } from 'mongoose';
import Product, { IProduct, IProductDocument } from '../models/Product';
import Category, { ICategoryDocument } from '../models/Category';


const getAllProductsStatic = asyncWrapper(async (req: express.Request, res: express.Response) => {
    const products = await Product.find({})
    res.status(200).json({ success: true, products, nbHits: products.length });
});

const getProducts = asyncWrapper(async (req: express.Request, res: express.Response) => {
    console.log({ sessionID: req.session.id })
    const filter: { category?: string, title?: { $regex: string, $options: string } } = {}

    if (req.query.category) {
        filter.category = req.query.category as string
    }

    if (req.query.title) {
        filter.title = { $regex: req.query.title as string, $options: "i" }
    }

    console.log({ filter })

    let result: Query<IProductDocument[], IProductDocument> = Product.find(filter, { _id: 1, title: 1, price: 1, category: 1, media: { images: { $slice: 1 } } })
    let allProducts: IProduct[]

    if (req.query.page || req.query.limit) {
        const page: number = Number(req.query.page) || 1;
        const limit: number = Number(req.query.limit) || 10;
        const skip: number = (page - 1) * limit;

        result = result.skip(skip).limit(limit);
        console.log({ skip, limit })
    }

    if (req.query.sort) {
        const sort = String(req.query.sort)
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList);
    }

    const count: number = await Product.count()
    // Only populate first image in images array
    allProducts = await result.populate([{ path: 'media.images' }, 'category'])
    console.log(allProducts)
    res.status(200).json({ success: true, products: allProducts, count: count || allProducts.length })
})

const getLandingPageProductData = asyncWrapper(async (req: express.Request, res: express.Response) => {
    const categories: ICategoryDocument[] = await Category.find({})
    const products: { [categoryId: string]: IProduct[] } = {}
    await Promise.all(categories.map(async (category) => {
        products[category._id] = await Product.find({ category: category._id }, "_id title price category media").limit(10)
    }))
    console.log(products)
    res.status(200).json({ success: true, products, categories })
})

const createProduct = asyncWrapper(async (req: express.Request, res: express.Response) => {
    const { title, price, media, description, category }: IProduct = req.body
    const product: IProduct = await (await Product.create({ title, price, description, media, category })).populate(['media.images', 'category'])
    res.status(201).json({ success: true, product })
})


const getProduct = asyncWrapper(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const product: IProduct | null = await Product.findById(req.params.id).populate(['media.images', 'category']).exec()

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

export {
    getProducts,
    getProduct,
    getLandingPageProductData,
    createProduct
}