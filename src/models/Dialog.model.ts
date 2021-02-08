import {Schema, Document, model, Types} from 'mongoose';

import {DialogTypes} from '../constants/DialogTypes';
import {PartRoles} from '../constants/PartRoles';


export interface IDialogData {
	type: DialogTypes,
	groupOptions?: {
		title: string,
		avatar?: string
	},
	participants: Array<{user: Types.ObjectId, role?: PartRoles}>,
	lastMessage?: Types.ObjectId
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
			avatar: {
				type: String,
				required: true
			}
		},
		required: false
	},
	participants: [{
		role: {
			type: Number,
			default: PartRoles.USER
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
