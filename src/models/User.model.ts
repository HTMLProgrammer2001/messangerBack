import {Schema, model, Document} from 'mongoose';


export interface IUser extends Document{
	nickname?: string,
	name: string,
	phone: string,
	email?: string,
	avatar: string
}

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
	email: {
		type: String,
		unique: true,
		required: false,
		validate: /^.+@.{3,}\..{2,}$/
	},
	avatar: {
		type: String,
		required: false
	}
});

export default model<IUser>('User', UserSchema);
