import {Schema, model, Document} from 'mongoose';

import {Roles} from '../constants/Roles';


export interface IUserData {
	nickname: string,
	sessionCode?: string,
	name: string,
	phone: string,
	avatar?: string,
	description?: string,
	role?: Roles,
	verified?: boolean,
	lastSeen?: Date,
	banned?: string[]
	options?: Object
}

export interface IUser extends Document, IUserData{}

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
		unique: true,
		sparse: true
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
	avatar: {
		type: String,
		required: false
	},
	role: {
		type: Number,
		default: Roles.USER
	},
	description: {
		type: String,
		required: false
	},
	verified: {
		type: Boolean,
		default: false
	},
	lastSeen: {
		type: Date,
		default: Date.now()
	},
	options: {
		type: Object,
		default: {}
	}
});

export default model<IUser>('User', UserSchema);
