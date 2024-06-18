import mongoose, { Schema, model, Document } from 'mongoose';
import { IProduct } from './Product';

interface ICartItem {
    productId: mongoose.Schema.Types.ObjectId
    quantity: number;
    sessionId: string;
}

export type CartItemRequestProps = {
    productId: string
    quantity: number
}


const CartItemSchema = new Schema<ICartItem>({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Must provide product ID'],
        trim: true,
    },
    quantity: {
        type: Number,
        required: [true, 'Must provide quantity'],
    },
    sessionId: {
        type: String,
        required: [true, 'Must provide sessionID'],
        // maxlength: [20, 'title can not be more than 20 characters']
    }
}, {
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
})

CartItemSchema.set('timestamps', true)

CartItemSchema.virtual('product', {
    ref: 'Product',
    localField: 'productId',
    foreignField: '_id',
    justOne: true
})
/**
 * Not directly exported because it is not recommanded to
 * use this interface direct unless necessary since the
 * type of `company` field is not deterministic
 */
interface ICartItemBaseDocument extends ICartItem, Document {
}

// Export this for strong typing
export interface ICartItemDocument extends ICartItemBaseDocument {
    product?: IProduct;
}

export default model<ICartItem>('CartItem', CartItemSchema, 'Cart')
export { ICartItem }