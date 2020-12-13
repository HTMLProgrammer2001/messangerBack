import {Schema, model, Document} from 'mongoose';

import {Roles} from '../constants/Roles';


export interface IUser extends Document{
	nickname?: string,
	sessionCode?: string,
	name: string,
	phone: string,
	email?: string,
	avatar: string,
	role: Roles
}

const UserSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: false,
		minlength: 4,
		maxlength: 32
	},
	sessionCode: {
		type: String,
		unique: true
	},
	nickname: {
		type: String,
		unique: true,
		required: true,
		minlength: 4,
		maxlength: 32
	},
	phone: {
		type: String,
		unique: true,
		required: true,
		validate: /^\+?\d{4,}$/
	},
	email: {
		type: String,
		unique: true,
		required: false,
		validate: /^.+@.{3,}\..{2,}$/
	},
	avatar: {
		type: String,
		required: false
	},
	role: {
		type: Number,
		default: Roles.USER
	}
});

export default model<IUser>('User', UserSchema);
