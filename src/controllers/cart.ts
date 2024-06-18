import express from 'express';
import asyncWrapper from '../middleware/async';
import CartItem, { CartItemRequestProps, ICartItem, ICartItemDocument } from '../models/CartItem';
import Asset from '../models/Asset';

const getCart = asyncWrapper(async (req: express.Request, res: express.Response) => {
    const sessionId = req.session.id
    const result: ICartItem[] = await CartItem.find({ sessionId }).populate({ path: 'product', populate: 'media.images' })
    res.status(200).json({ success: true, cartItems: result })
})

const updateCartItem = asyncWrapper(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { productId, quantity }: CartItemRequestProps = req.body
    const sessionId = req.session.id

    const cartItem: ICartItemDocument | null = await CartItem.findOneAndUpdate({
        productId,
        sessionId // (SessionID still not initialized on dev)
    }, { $inc: { quantity } }, { new: true })

    if (!cartItem) {
        // return next(createCustomError('could not find the product id', 404))
        // createCartItem
        return next()
    }

    console.log(`product ${productId} quantity has been updated to ${cartItem.quantity} for ${sessionId} cart.`)
    req.session.cart[productId] = {
        quantity: cartItem.quantity,
        cartItemId: cartItem._id
    }
    res.status(201).json({ success: true, cartItem })
})

const createCartItem = asyncWrapper(async (req: express.Request, res: express.Response) => {
    const { productId, quantity }: CartItemRequestProps = req.body
    const sessionId = req.session.id
    const cartItem: ICartItemDocument = await (await CartItem.create({ productId, quantity, sessionId })).populate({ path: 'product', populate: 'media.images' })

    console.log(`${cartItem.quantity}x product ${productId} has been added to ${sessionId} cart.`)
    if (!req.session.cart) {
        req.session.cart = {}
    }

    req.session.cart[productId] = {
        quantity,
        cartItemId: cartItem._id
    }

    res.status(201).json({ success: true, cartItem })
})

export {
    createCartItem,
    updateCartItem,
    getCart,
}