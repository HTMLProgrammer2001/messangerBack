import {Schema, Document, model} from 'mongoose';


export interface ITokenData {
	expires?: Date,
	user: Schema.Types.ObjectId,
	token: string
}

export interface IToken extends Document, ITokenData{}

const TokenSchema = new Schema<IToken>({
	expires: {
		type: Date,
		default: Date.now() + (+process.env.TOKEN_TTL || 3600000)
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	token: {
		type: String,
		unique: true,
		required: true
	}
});

export default model<IToken>('Token', TokenSchema);
