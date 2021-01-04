import {Schema, Document, model} from 'mongoose';

import {DialogTypes} from '../constants/DialogTypes';


export interface IDialogData {
	type: DialogTypes,
	groupOptions?: {
		title: string,
		description?: string,
		avatar?: string,
		nick: string
	},
	participants: Array<{user: Schema.Types.ObjectId, role?: number}>,
	lastMessage?: Schema.Types.ObjectId
}

export interface IDialog extends Document, IDialogData{}

const DialogSchema = new Schema<IDialog>({
	type: Number,
	groupOptions: {
		type: {
			title: {
				type: String,
				required: true,
				minlength: 4,
				maxlength: 32
			},
			description: {
				type: String,
				required: false
			},
			avatar: {
				type: String,
				required: true
			},
			nick: {
				type: String,
				required: false
			}
		},
		required: false
	},
	participants: [{
		role: {
			type: Number,
			default: 1
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		}
	}],
	lastMessage: {
		type: Schema.Types.ObjectId,
		ref: 'Message',
		required: false
	}
});

export default model<IDialog>('Dialog', DialogSchema);
