import mongoose, { Schema, model, Document, ObjectId } from 'mongoose';

interface IUser extends Document {
    name: string
    email: string
    googleId?: string | undefined,
    picture?: string
}

const UserSchema = new Schema<IUser>({
    // id: {
    //     type: mongoose.Types.ObjectId,
    // },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    googleId: {
        type: String || undefined,
    },
    picture: {
        type: String || undefined,
    }
});


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