import {Schema, Document, model} from 'mongoose';

import {CodeTypes} from '../constants/CodeTypes';


export interface ICodeData {
	code: string,
	to: string,
	expires?: Date,
	user: Schema.Types.ObjectId,
	type: CodeTypes
}

export interface ICode extends Document, ICodeData{}

const CodeSchema = new Schema<ICode>({
	code: String,
	to: String,
	expires: {
		type: Date,
		default: Date.now() + process.env.CODE_TTL
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	type: Number
});

export default model<ICode>('Code', CodeSchema);
