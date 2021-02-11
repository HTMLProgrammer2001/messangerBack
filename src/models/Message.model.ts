import {Document, model, Schema, Types} from 'mongoose';


export interface IMessageData {
	dialog: Types.ObjectId,
	author: Types.ObjectId,
	type: number,
	message?: string,
	url?: string,
	size?: number,
	time?: Date,
	readBy?: string[],
	deletedFor?: string[],
	resend?: string[]
}

export interface IMessage extends Document, IMessageData {}

const MessageSchema = new Schema<IMessage>({
	dialog: {
		type: Schema.Types.ObjectId,
		ref: 'Dialog'
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	type: Number,
	message: {
		type: String,
		required: false
	},
	url: {
		type: String,
		required: false
	},
	size: {
		type: Number,
		required: false
	},
	time: {
		type: Date,
		default: new Date()
	},
	readBy: {
		type: [String],
		default: [],
		ref: 'User'
	},
	deletedFor: {
		type: [String],
		default: [],
		ref: 'User'
	},
	resend: {
		type: [String],
		ref: 'Message',
		default: []
	},
	options: {
		type: Object,
		default: {}
	}
});

export default model<IMessage>('Message', MessageSchema);
