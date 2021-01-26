import {Schema, Document, model} from 'mongoose';


export interface ITokenData {
	expires?: Date,
	user: Schema.Types.ObjectId,
	token: string
}

export interface IToken extends Document, ITokenData{}

const TokenSchema = new Schema<IToken>({
	expires: Date,
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

TokenSchema.pre('save', function(next){
	if(!this.get('expires'))
		this.set('expires', Date.now() + (+process.env.TOKEN_TTL || 3600000));

	next();
});

export default model<IToken>('Token', TokenSchema);
