import {Schema} from 'mongoose';

import User, {IUserData} from '../models/User.model';


class UserRepository{
	async create(data: IUserData){
		const user = new User(data);
		return user.save();
	}

	async update(id: Schema.Types.ObjectId, data: Partial<IUserData>){
		return User.updateOne({_id: id}, data);
	}

	async getById(id: Schema.Types.ObjectId){
		return User.findById(id);
	}

	async getByPhone(phone: string){
		return User.findOne({phone});
	}
}

export default new UserRepository();
