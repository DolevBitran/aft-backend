import { Schema, model, Document, ObjectId } from 'mongoose';

interface IUser extends Document {
    // _id: ObjectId;
    Nickname: string;
    level: number;
    Title: string;
}

const UserSchema = new Schema<IUser>({
    Nickname: {
        type: String,
        required: [true, 'Must provide name'],
        trim: true,
        maxlength: [20, 'Name can not be more than 20 characters']
    },
    level: {
        type: Number,
        default: 1
    },
    Title: {
        type: String,
        required: [true, 'Must provide title'],
        trim: true,
        maxlength: [60, 'Title can not be more than 60 characters']
    }
})


/**
 * Not directly exported because it is not recommanded to
 * use this interface direct unless necessary since the
 * type of `company` field is not deterministic
 */
interface IUserBaseDocument extends IUser, Document {
    // friends: Types.Array<string>;
    // creditCards?: Types.Map<string>;
    // fullName: string;
    // getGender(): string;
}

// Export this for strong typing
export interface IUserDocument extends IUserBaseDocument {
    // company: Company["_id"];
    fullName: string;
}


export default model<IUser>('User', UserSchema, 'Users')
export { IUser }