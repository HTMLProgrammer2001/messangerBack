import {ClientSession, Schema, Types} from 'mongoose';

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

	getById(id: Schema.Types.ObjectId | string){
		return Message.findById(id)
	}

	delete(id: Types.ObjectId | string){
		return Message.deleteOne({_id: id});
	}

	async update(id: Types.ObjectId, data: Partial<IMessageData>, session?: ClientSession){
		return Message.updateOne({_id: id}, data, {session});
	}

	async paginateMessagesByTextFor(user: string, {text = '', page = 1, pageSize = 5}){
		const messagesReq = Message.aggregate([
			{$limit: 1},
			{$project: {_id: 1}},
			{$project: {_id: 0}},
			{
				$lookup: {
					from: 'messages',
					pipeline: [
						{$match: {message: {$regex: text, $options: 'i'}, deletedFor: {$nin: [user]}}},
						{$lookup: {localField: 'dialog', from: 'dialogs', foreignField: '_id', as: 'dialogModel'}},
						{$addFields: {dialogModel: {$arrayElemAt: ['$dialogModel', 0]}}},
						{$match: {'dialogModel.participants': {$elemMatch: {user: new Types.ObjectId(user)}}}},
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

	async paginateDialogFor(user: string, dialog: string, {page = 1, pageSize = 5}: {page: number, pageSize: number}){
		const messages = await Message.aggregate([
			{$limit: 1},
			{$project: {_id: 1}},
			{$project: {_id: 0}},
			{
				$lookup: {
					from: 'messages',
					pipeline: [
						{$match: {dialog: new Types.ObjectId(dialog), deletedFor: {$nin: [user]}}},
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
			}
		]);

		return messages[0];
	}

	async getUnreadMessagesFor(user: string, dialog: Schema.Types.ObjectId){
		const messagesReq = Message.aggregate([
			{$match: {dialog, readBy: {$nin: [user]}, deletedFor: {$nin: [user]}, author: {$ne: user}}},
			{$sort: {time: -1}}
		]);

		return messagesReq.exec();
	}
}

export default new MessageRepository();
