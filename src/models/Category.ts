import mongoose, { Schema, model, Document, ObjectId } from 'mongoose';

interface ICategory {
    title: string;
}


const CategorySchema = new Schema<ICategory>({
    title: {
        type: String,
        required: [true, 'Must provide a title'],
        trim: true,
        unique: true,
        maxlength: [20, 'title can not be more than 20 characters']
    },
})


/**
 * Not directly exported because it is not recommanded to
 * use this interface direct unless necessary since the
 * type of `company` field is not deterministic
 */
interface ICategoryBaseDocument extends ICategory, Document {
    // friends: Types.Array<string>;
    // creditCards?: Types.Map<string>;
    // fullName: string;
    // getGender(): string;
}

// Export this for strong typing
export interface ICategoryDocument extends ICategoryBaseDocument {
    getTitle(): string;
}

export default model<ICategory>('Category', CategorySchema, 'Category')
export { ICategory }