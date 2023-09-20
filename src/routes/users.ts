import express from "express";
import {
    getUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    getUserCount
} from "../controllers/users";
import { getProducts, getProduct, createProduct } from "../controllers/products";

const router: express.Router = express.Router()

// router.route('/').get(getUsers).post(createUser)
// router.route('/count').get(getUserCount)
// router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)
router.route('/product').get(getProducts).post(createProduct)// .patch(updateProduct).delete(deleteUser)
router.route('/product/id').get(getProduct)
export default router;