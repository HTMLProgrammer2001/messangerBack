import {Document, model, Schema} from 'mongoose';


export interface IMessage extends Document{
	dialog: number,
	type: number,
	message?: string,
	url?: string
}

const MessageSchema = new Schema<IMessage>({
	dialog: {
		type: Schema.Types.ObjectId,
		ref: 'Dialog'
	},
	type: Number,
	message: {
		type: String,
		required: false
	},
	url: {
		type: String,
		required: false
	}
});

export default model<IMessage>('Message', MessageSchema);
