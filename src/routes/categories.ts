import express from "express";
import { createCategory, getCategories, getCategory } from "../controllers/categories";
import { getLandingPageProductData } from "../controllers/products";

const router: express.Router = express.Router()


router.route('/category').get(getCategories).post(createCategory)// .patch(updateProduct).delete(deleteUser)
router.route('/category/preview').get(getLandingPageProductData)
router.route('/category/:id').get(getCategory)

export default router;