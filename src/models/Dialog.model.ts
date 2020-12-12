import {Schema, Document, model} from 'mongoose';

import {IUser} from './User.model';


export interface IDialog extends Document{
	type: number,
	participants: Array<{user: IUser, role: number}>,
	createdAt: Date
}

const DialogSchema = new Schema<IDialog>({
	type: Number,
	participants: [{
		role: Number,
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		}
	}]
});

export default model<IDialog>('Dialog', DialogSchema);
