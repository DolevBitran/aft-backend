import mongoose, { Schema, model, Document } from 'mongoose';

interface IAsset {
    asset_id: string;
    public_id: string;
    original_filename: string;
    source: string;
}


const AssetSchema = new Schema<IAsset>({
    asset_id: {
        type: String,
        required: [true, 'Must provide a Asset ID'],
        trim: true,
    },
    public_id: {
        type: String,
        required: [true, 'Must provide a Public ID'],
        trim: true,
    },
    source: {
        type: String,
        required: [true, 'Must provide a source'],
        trim: true,
    },
    original_filename: {
        type: String,
        required: [true, 'Must provide a file name'],
        trim: true,
    }
})


/**
 * Not directly exported because it is not recommanded to
 * use this interface direct unless necessary since the
 * type of `company` field is not deterministic
 */
interface IAssetBaseDocument extends IAsset, Document {
    // friends: Types.Array<string>;
    // creditCards?: Types.Map<string>;
    // fullName: string;
    // getGender(): string;
}

// Export this for strong typing
export interface IAssetDocument extends IAssetBaseDocument {
    getTitle(): string;
}

export default model<IAsset>('Asset', AssetSchema, 'Asset')
export { IAsset }