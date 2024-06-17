import express from "express";

import { getCart, createCartItem, updateCartItem } from "../controllers/cart";

const router: express.Router = express.Router()
router.route('/cart').get(getCart).post(updateCartItem, createCartItem)

export default router;