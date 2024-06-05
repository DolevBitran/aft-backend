import mongoose, { Schema, model, Document, ObjectId } from 'mongoose';

interface IProduct {
    title: string;
    price: number;
    description: string;
    media: { images: mongoose.Schema.Types.ObjectId[] };
    category: { type: Schema.Types.ObjectId, ref: 'User' }[];
}


const ProductSchema = new Schema<IProduct>({
    title: {
        type: String,
        required: [true, 'Must provide a title'],
        trim: true,
        maxlength: [20, 'title can not be more than 20 characters']
    },
    price: {
        type: Number,
        required: [true, 'Must provide a price'],
        // maxlength: [20, 'title can not be more than 20 characters']
    },
    category: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
        required: [true, 'Must provide a category'],
    },
    media: {
        images: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Asset',
            required: [true, 'Must provide a source'],
            trim: true,
            // validator : (num) => {
            //     return /[1-9]{1}\d{4}.test(num);
            //   },
            //   message: props => `${props.value} is not a valid number!`
            // }
        },
    },
    description: {
        type: String,
        required: [true, 'Must provide a description'],
        trim: true,
        maxlength: [300, 'description can not be more than 300 characters']
    }
})

ProductSchema.set('timestamps', true)

/**
 * Not directly exported because it is not recommanded to
 * use this interface direct unless necessary since the
 * type of `company` field is not deterministic
 */
interface IProductBaseDocument extends IProduct, Document {
    // friends: Types.Array<string>;
    // creditCards?: Types.Map<string>;
    // fullName: string;
    // getGender(): string;
}

// Export this for strong typing
export interface IProductDocument extends IProductBaseDocument {
    getTitle(): string;
}

export default model<IProduct>('Product', ProductSchema, 'Product')
export { IProduct }