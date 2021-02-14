import {Schema, Types} from 'mongoose';

import Dialog, {IDialog, IDialogData} from '../models/Dialog.model';
import Message from '../models/Message.model';
import UserRepository from './User.repository';
import {DialogTypes} from '../constants/DialogTypes';
import {IPaginateResponse} from '../interfaces/IPaginateData';
import {IParticipant} from '../interfaces/IParticipant';
import {BanType} from '../constants/BanType';


type IPaginateFor = IPaginateResponse<IDialog> | undefined;

class DialogRepository {
	async create(data: IDialogData) {
		const dialog = new Dialog(data);
		return dialog.save();
	}

	async update(id: Types.ObjectId, data: Partial<IDialogData>) {
		await Dialog.findByIdAndUpdate(id, data);
		return this.getDialogById(id);
	}

	getDialogById(id: Types.ObjectId | string) {
		return Dialog.findById(id);
	}

	async getDialogByNick(id: string, nickname = '') {
		//find personal chat with nick
		const personal = await Dialog.aggregate([
			{$match: {type: DialogTypes.PERSONAL}},
			{$lookup: {from: 'users', localField: 'participants.user', foreignField: '_id', as: 'users'}},
			{$match: {users: {$elemMatch: {nickname, _id: {$ne: id}}}}},
			{$match: {users: {$elemMatch: {_id: id}}}},
			{$project: {users: 0}}
		]);

		return personal[0];
	}

	getDialogsBy(field: string, {val, pageSize, page, id}: { val: any, id: any, pageSize: number, page: number }): any {
		//make request
		const filteredDialogsReq = Dialog.aggregate([
			{$limit: 1}, {$project: {_id: 1}}, {$project: {_id: 0}},
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
				$lookup: {
					from: 'dialogs', pipeline: [
						{$match: {type: DialogTypes.CHAT, participants: {$elemMatch: {user: id}}}},
						{$match: {[`groupOptions.${field == 'name' ? 'title' : ''}`]: {$regex: val, $options: 'i'}}},
						{$lookup: {localField: 'lastMessage', from: 'messages', foreignField: '_id', as: 'message'}},
						{$sort: {'message.time': -1}}
					], as: 'chat'
				}
			},

			{$addFields: {dialogs: {$concatArrays: ['$personal', '$chat']}}},

			{
				$replaceRoot: {
					newRoot: {
						data: {$slice: ['$dialogs', pageSize * (page - 1), pageSize]}, total: {$size: '$dialogs'}
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

	async paginateByNameFor(id: string | Types.ObjectId, {name = '', pageSize = 5, page = 1} = {}): Promise<IPaginateFor> {
		//get paginated dialogs
		const filteredDialogsReq = this.getDialogsBy('name', {val: name, page, pageSize, id});

		const filteredDialogs = await filteredDialogsReq.exec();
		return filteredDialogs[0];
	}

	async clearFor(userID: Types.ObjectId, dlgId: Types.ObjectId) {
		return await Message.updateMany({dialog: dlgId}, {
			$addToSet: {deletedFor: userID.toString()}
		});
	}

	async getDialogWith(user: Types.ObjectId, wit: Types.ObjectId) {
		const dialog = await Dialog.findOne({
			type: DialogTypes.PERSONAL,
			'participants.user': {$all: [user, wit]}
		});

		return dialog;
	}

	async isBanned(dlgID: string, userID: Types.ObjectId) {
		const dlg = await this.getDialogById(dlgID);

		if (!dlg)
			return true;

		if (dlg.type == DialogTypes.PERSONAL) {
			//find another user
			let secondUserID = dlg.participants[0].user;

			if (secondUserID.toString() == userID.toString())
				secondUserID = dlg.participants[1].user;

			//check ban
			const secondUser = await UserRepository.getById(secondUserID.toString());
			return secondUser.banned.includes(userID.toString());
		} else if (dlg.type == DialogTypes.CHAT) {
			//find index of delete in group
			const index = dlg.participants.findIndex(part => {
				return part.user.toString() == userID.toString() && !part.banTime
			});

			return index == -1;
		}
	}

	async getParticipants(dialogID: string){
		return Dialog.aggregate([
			{$match: {_id: new Types.ObjectId(dialogID)}},
			{$unwind: '$participants'},
			{$replaceRoot: {newRoot: '$participants'}},
			{$lookup: {from: 'users', localField: 'user', foreignField: '_id', as: 'user'}},
			{$project: {role: 1, banTime: 1, banType: 1, user: {$arrayElemAt: ['$user', 0]}}}
		]);
	}

	async getParticipant(dialogID: string, userID: string){
		const participants = await this.getParticipants(dialogID);
		return participants.find(part => part.user._id.toString() == userID.toString());
	}

	async updateParticipant(dialogID: string, userID: string, part: Partial<IParticipant>){
		const setter: Record<string, any> = {};

		for(let [key, val] of Object.entries(part))
			setter[`participants.$.${key}`] = val;

		await Dialog.update({
			_id: new Types.ObjectId(dialogID),
			'participants.user': Types.ObjectId(userID),
			type: DialogTypes.CHAT
		}, {$set: setter});
	}

	async addParticipant(dialogID: string, userID: string){
		return Dialog.updateOne({_id: new Types.ObjectId(dialogID)}, {
			$push: {participants: {user: new Types.ObjectId(userID)}}
		});
	}

	async getMyRoleFor(dialogID: string | Types.ObjectId, user: string | Types.ObjectId){
		const role = await Dialog.aggregate([
			{$match: {type: DialogTypes.CHAT, _id: dialogID}},
			{$unwind: '$participants'},
			{$match: {'participants.user': user}},
			{$replaceRoot: {newRoot: '$participants'}}
		]);

		return role[0]?.role;
	}

	async isActive(dialogID: string | Types.ObjectId, user: string | Types.ObjectId){
		const part = await this.getParticipant(dialogID.toString(), user.toString());
		return !!part && !part.banTime;
	}

	async deleteGroup(id: string | Types.ObjectId){
		return Dialog.updateOne({_id: Types.ObjectId(id.toString())}, {
			$set: {'participants.$[].banTime': new Date()}
		});
	}

	async leave(dialogID: string | Types.ObjectId, user: string | Types.ObjectId){
		return this.updateParticipant(dialogID.toString(), user.toString(), {
			banTime: new Date(),
			banType: BanType.LEAVE
		});
	}

	async ban(dialogID: string | Types.ObjectId, user: string | Types.ObjectId){
		return this.updateParticipant(dialogID.toString(), user.toString(), {
			banTime: new Date(),
			banType: BanType.BAN
		});
	}
}

export default new DialogRepository();
