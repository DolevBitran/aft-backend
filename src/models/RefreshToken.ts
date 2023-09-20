import mongoose, { Schema, model, Document, ObjectId, Model, PopulatedDoc } from 'mongoose';
import { IUser } from './User';
import crypto from 'crypto';

interface IRefreshToken extends Document {
    user: Schema.Types.ObjectId,
    token: string,
    expires: Date,
    created: Date,
    createdByIp: string,
    revoked: Date,
    revokedByIp: string,
    replacedByToken: string
}

export interface IRefreshTokenModel extends Model<IRefreshToken> {
    generateRefreshToken(user: IUser, ipAddress: string): Promise<IRefreshToken>;
    getRefreshToken(token: string): Promise<PopulatedIRefreshTokenDocument>;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    token: String,
    expires: Date,
    created: { type: Date, default: Date.now },
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedByToken: String
});


RefreshTokenSchema.virtual('isExpired').get(function (this: IRefreshTokenDocument) {
    return Date.now() >= this.expires.getTime();
});

RefreshTokenSchema.virtual('isActive').get(function (this: IRefreshTokenDocument) {
    return !this.revoked && !this.isExpired;
});

RefreshTokenSchema.statics.generateRefreshToken = async function (user: IUser, ipAddress: string): Promise<IRefreshToken> {
    const refreshTokenObj = await this.create({
        user: user.id,
        token: crypto.randomBytes(40).toString('hex'),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp: ipAddress
    })
    return refreshTokenObj;
}

RefreshTokenSchema.statics.getRefreshToken = async function (token: string): Promise<PopulatedIRefreshTokenDocument> {
    const refreshToken: PopulatedIRefreshTokenDocument = await this.findOne({ token }).populate('user');
    if (!refreshToken || !refreshToken.isActive) throw new Error('Invalid token');
    return refreshToken;
}

RefreshTokenSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform(doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.id;
        delete ret.user;
    }
});

/**
 * Not directly exported because it is not recommanded to
 * use this interface direct unless necessary since the
 * type of `company` field is not deterministic
 */
interface IRefreshTokenBaseDocument extends IRefreshToken, Document {
    // friends: Types.Array<string>;
    // creditCards?: Types.Map<string>;
    // fullName: string;
    // getGender(): string;

}

// Export this for strong typing
export interface IRefreshTokenDocument extends IRefreshTokenBaseDocument {
    // company: Company["_id"];
    // fullName: string;
    isExpired: boolean;
    isActive: boolean;
}
// Export this for strong typing
export interface PopulatedIRefreshTokenDocument extends PopulatedDoc<IRefreshTokenDocument> {
    user: IUser;
}


export default model<IRefreshToken, IRefreshTokenModel>('RefreshToken', RefreshTokenSchema, 'RefreshToken')
export { IRefreshToken }