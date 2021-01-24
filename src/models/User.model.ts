import {Schema, model, Document} from 'mongoose';

import {Roles} from '../constants/Roles';


interface IUserOptions {
	currentToken?: string
}

export interface IUserData extends IUserOptions{
	nickname: string,
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
	banned: {
		type: [Schema.Types.ObjectId],
		default: [],
		ref: 'User'
	},
	options: {
		type: Object,
		default: {}
	}
});

export default model<IUser>('User', UserSchema);
