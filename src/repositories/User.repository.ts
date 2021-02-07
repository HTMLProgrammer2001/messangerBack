import {Schema, Types} from 'mongoose';

import User, {IUserData} from '../models/User.model';
import Dialog from '../models/Dialog.model';
import {DialogTypes} from '../constants/DialogTypes';


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

	async getFriendsByFieldFor(userID: string | Types.ObjectId, {field, val, page, pageSize} =
		{field: '', val: '', page: 1, pageSize: 1}){
		
		const friends = await Dialog.aggregate([
			{$match: {type: DialogTypes.PERSONAL, participants: {$elemMatch: {user: userID}}}},
			{$unwind: '$participants'},
			{$match: {'participants.user': {$ne: userID}}},
			{$lookup: {from: 'users', localField: 'participants.user', as: 'user', foreignField: '_id'}},
			{$replaceRoot: {newRoot: {$arrayElemAt: ['$user', 0]}}},
			{$match: {[field]: {$regex: val, $options: 'i'}}}
		]).skip(pageSize * (page - 1)).limit(pageSize);

		return friends;
	}
}

export default new UserRepository();
