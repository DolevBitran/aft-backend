import express from 'express';
import asyncWrapper from '../middleware/async';
import { createCustomError } from '../errors/custom-error';
import mongoose, { Query } from 'mongoose';
import Category, { ICategory, ICategoryDocument } from '../models/Category';


const getAllCategoriesStatic = asyncWrapper(async (req: express.Request, res: express.Response) => {
    const categories = await Category.find({})
    res.status(200).json({ success: true, categories, count: categories.length });
});

const getCategories = asyncWrapper(async (req: express.Request, res: express.Response) => {
    let result: Query<ICategoryDocument[], ICategoryDocument> = Category.find({})
    let allCategories: ICategory[]
    if (req.query.page || req.query.limit) {
        const page: number = Number(req.query.page) || 1;
        const limit: number = Number(req.query.limit) || 10;
        const skip: number = (page - 1) * limit;

        result = result.skip(skip).limit(limit);
        console.log({ skip, limit })
    }

    const count: number = await Category.count()
    allCategories = await result

    res.status(200).json({ success: true, categories: allCategories, count: count || allCategories.length })
})

const createCategory = asyncWrapper(async (req: express.Request, res: express.Response) => {
    const { title }: ICategory = req.body
    const category: ICategory = await Category.create({ title })
    res.status(201).json({ success: true, category })
})


const getCategory = asyncWrapper(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // const { id }: { id: mongoose.Types.ObjectId } = req.body
    const category: ICategory | null = await Category.findById(req.params.id).exec()

    if (!category) {
        return next(createCustomError('could not find the category id', 404))
    }
    res.status(200).json({ success: true, category })
})

const updateCategory = asyncWrapper(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const updateOptions = { new: true, runValidators: true }
    const category: ICategory | null = await Category.findByIdAndUpdate(req.params.id, req.body, updateOptions).exec()
    if (!category) {
        return next(createCustomError('could not find the category id', 404))
    }
    res.status(200).json({ success: true, category })
})

export {
    getCategories,
    getCategory,
    createCategory
}