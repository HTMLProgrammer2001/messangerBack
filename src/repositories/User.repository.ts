import {Schema, Types} from 'mongoose';

import User, {IUserData} from '../models/User.model';


class UserRepository{
	async create(data: IUserData){
		const user = new User(data);
		return user.save();
	}

	async update(id: Schema.Types.ObjectId, data: Partial<IUserData>){
		await User.updateOne({_id: id}, data);
		return this.getById(id);
	}

	async getById(id: Schema.Types.ObjectId){
		return User.findById(id);
	}

	async getByPhone(phone: string){
		return User.findOne({phone});
	}

	async getByNick(nick: string){
		return User.findOne({nickname: nick});
	}
}

export default new UserRepository();
