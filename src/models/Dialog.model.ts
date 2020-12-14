import {Schema, Document, model} from 'mongoose';

import {IUser} from './User.model';
import {DialogTypes} from '../constants/DialogTypes';


export interface IDialog extends Document{
	type: DialogTypes,
	groupOptions?: {
		nickname: string,
		title: string,
		description?: string,
		avatar?: string,
		open: boolean,
	},
	participants: Array<{user: IUser, role?: number}>
}

const DialogSchema = new Schema<IDialog>({
	type: Number,
	groupOptions: {
		open: {
			type: Boolean,
			default: true
		},
		nickname: {
			type: String,
			required: true,
			unique: true
		},
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
			required: false
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
	}]
}, {timestamps: true});

export default model<IDialog>('Dialog', DialogSchema);
