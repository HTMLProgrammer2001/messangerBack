import {Schema} from 'mongoose';

import Message, {IMessageData} from '../models/Message.model';
import DialogRepository from './Dialog.repository';


class MessageRepository{
	async create(data: IMessageData){
		//create message
		const message = new Message(data);
		await message.save();

		//add message as last to dialog
		await DialogRepository.update(data.dialog, {lastMessage: message._id});

		return message;
	}

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
						{$match: {'dialogModel.participants': {$elemMatch: {user}}}},
						{$sort: {time: -1}}
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
			},
			{$project: {'data.dialogModel': 0}}
		]);

		const messages = await messagesReq.exec();
		return messages[0];
	}

	async getUnreadMessagesFor(user: Schema.Types.ObjectId, dialog: Schema.Types.ObjectId){
		const messagesReq = Message.aggregate([
			{$match: {dialog, readBy: {$nin: [user]}, deletedFor: {$nin: [user]}}},
			{$sort: {time: -1}}
		]);

		return messagesReq.exec();
	}
}

export default new MessageRepository();
