import {Schema} from 'mongoose';

import User, {IUser} from '../models/User.model';


class UserRepository{
	async create(data: IUser){
		const user = new User(data);
		return user.save();
	}

	async update(id: Schema.Types.ObjectId, data: IUser){
		return await User.updateOne({_id: id}, data);
	}

	async getById(id: Schema.Types.ObjectId){
		return await User.findById(id);
	}
}

export default new UserRepository();
