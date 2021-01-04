import {Document, model, Schema} from 'mongoose';


export interface IMessageData {
	dialog: Schema.Types.ObjectId,
	author: Schema.Types.ObjectId,
	type: number,
	message?: string,
	url?: string,
	time?: Date,
	readBy?: string[],
	deletedFor?: string[],
	options?: Record<string, any>
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
	options: {
		type: Object,
		default: {}
	}
});

export default model<IMessage>('Message', MessageSchema);
