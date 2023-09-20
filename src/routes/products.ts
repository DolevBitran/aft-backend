import express from "express";

import { getProducts, getProduct, createProduct } from "../controllers/products";

const router: express.Router = express.Router()

router.route('/product').get(getProducts).post(createProduct)// .patch(updateProduct).delete(deleteUser)
router.route('/product/:id').get(getProduct)

export default router;