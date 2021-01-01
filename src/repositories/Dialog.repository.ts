import {Schema} from 'mongoose';

import Dialog, {IDialog, IDialogData} from '../models/Dialog.model';
import {DialogTypes} from '../constants/DialogTypes';
import {IPaginateResponse} from '../interfaces/IPaginateResponse';


type IPaginateFor = IPaginateResponse<IDialog> | undefined;

class DialogRepository {
	async create(data: IDialogData){
		const dialog = new Dialog(data);
		return dialog.save();
	}

	getDialogById(id: Schema.Types.ObjectId){
		return Dialog.findById(id);
	}

	async getDialogByNick(nickname = '') {
		const chat = await Dialog.findOne({type: DialogTypes.CHAT, nickname}),
			personal = await Dialog.aggregate([
				{$match: {type: DialogTypes.PERSONAL}},
				{$lookup: {from: 'users', localField: 'participants.user', foreignField: '_id', as: 'users'}},
				{$match: {users: {$elemMatch: {nickname}}}},
				{$project: {users: 0}}
			]);

		return personal[0] || chat;
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
						{$match: {[`user.${field}`]: {$regex: val, $options: 'i'}}}
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
			{$project: {'data.uParticipants': 0, 'data.user': 0}}
		]).sort({'user.name': 1});

		return filteredDialogsReq;
	}

	async paginateByNickFor(id: Schema.Types.ObjectId, {nickname = '', pageSize = 5, page = 1} = {}):
		Promise<IPaginateFor> {
		//get paginated dialogs
		const filteredDialogsReq = this.getDialogsBy('nickname', {val: nickname, page, pageSize, id});

		//get value from request
		const filteredDialogs = await filteredDialogsReq.exec();
		return filteredDialogs[0];
	}

	async paginateByNameFor(id: Schema.Types.ObjectId, {name = '', pageSize = 5, page = 1} = {}): Promise<IPaginateFor> {
		//get paginated dialogs
		const filteredDialogsReq = this.getDialogsBy('name', {val: name, page, pageSize, id});

		const filteredDialogs = await filteredDialogsReq.exec();
		return filteredDialogs[0];
	}
}

export default new DialogRepository();
