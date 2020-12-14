import {Request, Response} from 'express';

import Dialog, {IDialog} from '../models/Dialog.model';
import {IAuthRequest} from '../interfaces/IAuthRequest';
import {DialogTypes} from '../constants/DialogTypes';


type IGetDialogsQuery = {nickname?: string, page?: number, pageSize?: number};

type IGetDialogsRequest = IAuthRequest & Request<{}, {}, {}, IGetDialogsQuery>;
type IGetDialogRequest = IAuthRequest & Request<{nickname: string}>;

class DialogsController{
	async getDialogs(req: IGetDialogsRequest, res: Response){
		//parse data from QP
		let {nickname, page = 1, pageSize = 5} = req.query as IGetDialogsQuery;
		page = +page;
		pageSize = +pageSize;

		//get paginated dialogs
		const filteredDialogs = Dialog.aggregate([
				{$limit: 1},
				{$project: {_id: 1}},
				{$project: {_id: 0}},
				{$lookup: {from: "dialogs", pipeline: [
					{$match: {type: DialogTypes.PERSONAL, participants: {$elemMatch: {user: req.user?._id}}}},
					{$addFields: {partCount: {$size: "$participants"}}},
					{$unwind: "$participants"},
					{$match: {"participants.user": {$ne: req.user?._id}}},
					{$lookup: {localField: "participants.user", from: "users", foreignField: "_id", as: "user"}},
					{$match: {"user.nickname": {$regex: nickname || '', $options: 'i'}}}
				], as: "personal"}},
				{$lookup: {from: "dialogs", pipeline: [
					{$addFields: {partCount: {$size: "$participants"}}},
					{$match: {type: {$ne: DialogTypes.PERSONAL}, groupOptions: {$exists: true}}},
					{$match: {"groupOptions.nickname": {$regex: nickname || '', $options: 'i'}}}
				], as: "group"}},
				{$project: {Union: {$concatArrays: ["$personal", "$group"]}}},
				{$replaceRoot: {newRoot: {dialogs: {$slice: ["$Union", pageSize * (page - 1), pageSize]}, total: {$size: "$Union"}}}},
				{$project: {"dialogs.participants": 0}}
			]).sort({type: 1});

		//calculate paginate fields
		let resp: [{total: number, dialogs: IDialog[]}] = await filteredDialogs.exec(),
			totalPages = 0,
			total = 0,
			dialogs: IDialog[] = [];

		if(resp.length){
			total = resp[0].total;
			totalPages = Math.ceil(total/pageSize);
			dialogs = resp[0].dialogs;
		}

		//return response
		return res.json({message: 'Dialogs found', page, pageSize, data: dialogs, total, totalPages});
	}

	async getDialog(req: IGetDialogRequest, res: Response){
		const dialog = await Dialog.findOne({nickname: req.params.nickname});

		//send response
		return res.json({
			message: 'Dialog found',
			data: dialog
		});
	}
}

export default new DialogsController();
