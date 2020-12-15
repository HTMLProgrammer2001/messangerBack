import {Schema} from 'mongoose';

import Dialog, {IDialog} from '../models/Dialog.model';
import {DialogTypes} from '../constants/DialogTypes';
import {IPaginateResponse} from '../interfaces/IPaginateResponse';


type IPaginateFor = IPaginateResponse<IDialog> | undefined;

class DialogRepository{
	async paginateFor(id: Schema.Types.ObjectId, {nickname = '', pageSize = 5, page = 1} = {}): Promise<IPaginateFor>{
		//get paginated dialogs
		const filteredDialogsReq = Dialog.aggregate([
			{$limit: 1},
			{$project: {_id: 1}},
			{$project: {_id: 0}},
			{$lookup: {from: "dialogs", pipeline: [
						{$match: {type: DialogTypes.PERSONAL, participants: {$elemMatch: {user: id}}}},
						{$addFields: {partCount: {$size: "$participants"}}},
						{$unwind: "$participants"},
						{$match: {"participants.user": {$ne: id}}},
						{$lookup: {localField: "participants.user", from: "users", foreignField: "_id", as: "user"}},
						{$match: {"user.nickname": {$regex: nickname || '', $options: 'i'}}}
					], as: "personal"}},
			{$lookup: {from: "dialogs", pipeline: [
						{$addFields: {partCount: {$size: "$participants"}}},
						{$match: {type: {$ne: DialogTypes.PERSONAL}, groupOptions: {$exists: true}}},
						{$match: {"groupOptions.nickname": {$regex: nickname || '', $options: 'i'}}}
					], as: "group"}},
			{$project: {Union: {$concatArrays: ["$personal", "$group"]}}},
			{$replaceRoot: {newRoot: {data: {$slice: ["$Union", pageSize * (page - 1), pageSize]}, total: {$size: "$Union"}}}},
			{$project: {"dialogs.participants": 0}}
		]).sort({type: 1});

		const filteredDialogs = await filteredDialogsReq.exec();
		return filteredDialogs[0];
	}

	async getDialogByNick(nickname = ''){
		return Dialog.findOne({nickname});
	}
}

export default new DialogRepository();