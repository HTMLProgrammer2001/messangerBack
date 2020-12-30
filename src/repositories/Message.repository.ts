import {Schema} from 'mongoose';

import Message from '../models/Message.model';


class MessageRepository{
	getById(id: Schema.Types.ObjectId){
		return Message.findById(id)
	}

	async paginateMessagesByTextFor(user: any, {text = '', page = 1, pageSize = 5}){
		const messagesReq = Message.aggregate([
			{$limit: 1},
			{$project: {_id: 1}},
			{$project: {_id: 0}},
			{
				$lookup: {
					from: 'messages',
					pipeline: [
						{$match: {message: {$regex: text, $options: 'i'}}},
						{$lookup: {localField: 'dialog', from: 'dialogs', foreignField: '_id', as: 'dialogModel'}},
						{$addFields: {dialogModel: {$arrayElemAt: ['$dialogModel', 0]}}},
						{$match: {'dialogModel.participants': {$elemMatch: {user}}}}
					],
					as: 'messages'
				}
			},
			{
				$replaceRoot: {
					newRoot: {
						data: {$slice: ['$messages', pageSize * (page - 1), pageSize]},
						total: {$size: '$messages'}
					}
				}
			}
		]).sort({'data.dialog': 1});

		const messages = await messagesReq.exec();
		return messages[0];
	}
}

export default new MessageRepository();
