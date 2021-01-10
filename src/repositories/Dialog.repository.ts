import {Schema, Types} from 'mongoose';

import Dialog, {IDialog, IDialogData} from '../models/Dialog.model';
import Message from '../models/Message.model';
import {DialogTypes} from '../constants/DialogTypes';
import {IPaginateResponse} from '../interfaces/IPaginateData';


type IPaginateFor = IPaginateResponse<IDialog> | undefined;

class DialogRepository {
	async create(data: IDialogData){
		const dialog = new Dialog(data);
		return dialog.save();
	}

	async update(id: Schema.Types.ObjectId, data: Partial<IDialogData>){
		await Dialog.findByIdAndUpdate(id, data);
		return this.getDialogById(id);
	}

	getDialogById(id: Schema.Types.ObjectId){
		return Dialog.findById(id);
	}

	async getDialogByNick(id: string, nickname = '') {
		//find chat with this nick
		const chat = await Dialog.findOne({type: DialogTypes.CHAT, nickname});

		if(chat)
			return chat;

		//find personal chat with nick
		const personal = await Dialog.aggregate([
				{$match: {type: DialogTypes.PERSONAL}},
				{$lookup: {from: 'users', localField: 'participants.user', foreignField: '_id', as: 'users'}},
				{$match: {users: {$elemMatch: {nickname, _id: {$ne: id}}}}},
				{$project: {users: 0}}
			]);

		return personal[0];
	}

	getDialogsBy(field: string, {val, pageSize, page, id}: {val: any, id: any, pageSize: number, page: number}): any{
		//make request
		const filteredDialogsReq = Dialog.aggregate([
			{$limit: 1},
			{$project: {_id: 1}},
			{$project: {_id: 0}},
			{
				$lookup: {
					from: 'dialogs', pipeline: [
						{$match: {type: DialogTypes.PERSONAL, participants: {$elemMatch: {user: id}}}},
						{$addFields: {uParticipants: '$participants'}},
						{$unwind: '$uParticipants'},
						{$match: {'uParticipants.user': {$ne: id}}},
						{$lookup: {localField: 'uParticipants.user', from: 'users', foreignField: '_id', as: 'user'}},
						{$match: {[`user.${field}`]: {$regex: val, $options: 'i'}}},
						{$lookup: {localField: 'lastMessage', from: 'messages', foreignField: '_id', as: 'message'}},
						{$sort: {'message.time': -1}}
					], as: 'personal'
				}
			},

			{
				$replaceRoot: {
					newRoot: {
						data: {$slice: ['$personal', pageSize * (page - 1), pageSize]}, total: {$size: '$personal'}
					}
				}
			},
			{$project: {'data.uParticipants': 0, 'data.user': 0, 'data.message': 0}}
		]);

		return filteredDialogsReq;
	}

	async paginateByNickFor(id: string | Schema.Types.ObjectId, {nickname = '', pageSize = 5, page = 1} = {}):
		Promise<IPaginateFor> {
		//get paginated dialogs
		const filteredDialogsReq = this.getDialogsBy('nickname', {val: nickname, page, pageSize, id});

		//get value from request
		const filteredDialogs = await filteredDialogsReq.exec();
		return filteredDialogs[0];
	}

	async paginateByNameFor(id: string | Schema.Types.ObjectId, {name = '', pageSize = 5, page = 1} = {}): Promise<IPaginateFor> {
		//get paginated dialogs
		const filteredDialogsReq = this.getDialogsBy('name', {val: name, page, pageSize, id});

		const filteredDialogs = await filteredDialogsReq.exec();
		return filteredDialogs[0];
	}

	async clearFor(userID: Schema.Types.ObjectId, dlgId: Schema.Types.ObjectId){
		return await Message.updateMany({dialog: dlgId}, {
			$addToSet: {deletedFor: userID.toString()}
		});
	}

	async getDialogWith(user: Types.ObjectId, wit: Types.ObjectId){
		const dialog = await Dialog.findOne({
			type: DialogTypes.PERSONAL,
			"participants.user": {$all: [user, wit]}
		});

		return dialog;
	}
}

export default new DialogRepository();
