import {Request, Response} from 'express';
import {Types} from 'mongoose';

import {IDialog} from '../models/Dialog.model';
import DialogRepository from '../repositories/Dialog.repository';
import UserRepository from '../repositories/User.repository';
import MessageRepository from '../repositories/Message.repository';

import DialogsGroupResource from '../resources/DialogsGroupResource';
import DialogResource from '../resources/DialogResource';
import {DialogTypes} from '../constants/DialogTypes';
import {MessageTypes} from '../constants/MessageTypes';
import NewDialogEvent from '../observer/events/NewDialog.event';

import {dispatch} from '../observer';


type IGetDialogsQuery = {page?: number, pageSize?: number};

type IGetDialogsByNickRequest = Request<{}, {}, {}, IGetDialogsQuery & {nickname?: string}>
type IGetDialogsByNameRequest = Request<{name?: string} | IGetDialogsQuery>
type IGetDialogRequest = Request<{nickname: string}>
type ICreatePersonal = Request<{}, {}, {to: any}>
type IClearRequest = Request<{}, {}, {user?: any, dialog?: any}>

class DialogsController{
	async createPersonal(req: ICreatePersonal, res: Response){
		const user = req.user,
			{to} = req.body;

		//search user with this nick
		const anotherUser = await UserRepository.getById(to);

		if(!anotherUser)
			return res.status(404).json({message: 'No user with this id'});

		//create dialog and friend request
		let dialog = await DialogRepository.getDialogByNick(anotherUser.nickname);

		if(!dialog)
			dialog = await DialogRepository.create({
				type: DialogTypes.PERSONAL,
				participants: [{user: user._id}, {user: anotherUser._id}]
			});
		else
			return res.status(422).json({message: 'Dialog with this user already exists'});

		//create message
		const msg = await MessageRepository.create({
			author: user._id,
			dialog: dialog._id,
			type: MessageTypes.SPECIAL,
			message: 'Dialog start'
		});

		dialog = await DialogRepository.update(dialog._id, {lastMessage: msg._id});

		//send events
		dispatch(new NewDialogEvent(dialog, req.user._id));

		//return response
		return res.json({
			message: 'Dialog created'
		});
	}

	async getDialogsByNick(req: IGetDialogsByNickRequest, res: Response){
		//parse data from QP
		let {nickname, page = 1, pageSize = 5} = req.query;
		page = +page;
		pageSize = +pageSize;

		//calculate paginate fields
		const resp = await DialogRepository.paginateByNickFor(req.user?._id, {nickname, pageSize, page}),
			total = resp ? resp.total : 0,
			totalPages = Math.ceil(total / pageSize),
			dialogs: IDialog[] = resp ? resp.data : [];

		const message = dialogs.length ? 'Dialogs found' : 'Dialogs not found',
			data = new DialogsGroupResource(dialogs, req.user._id);

		await data.json();

		//return response
		return res.json({
			message, page, total,
			totalPages, pageSize, data
		});
	}

	async getDialogsByName(req: IGetDialogsByNameRequest, res: Response){
		let {name = '', page = 1, pageSize = 5} = req.query;
		name = name as string;
		page = +page;
		pageSize = +pageSize;

		//calculate paginate fields
		const resp = await DialogRepository.paginateByNameFor(req.user?._id, {name, pageSize, page}),
			total = resp ? resp.total : 0,
			totalPages = Math.ceil(total / pageSize),
			dialogs: IDialog[] = resp ? resp.data : [];

		const message = dialogs.length ? 'Dialogs found' : 'Dialogs not found',
			data = new DialogsGroupResource(dialogs, req.user?._id);

		await data.json();

		//return response
		return res.json({
			message, page, pageSize,
			total, totalPages, data
		});
	}

	async getDialog(req: IGetDialogRequest, res: Response){
		const dialog = await DialogRepository.getDialogByNick(req.user._id, req.params.nickname),
			data = new DialogResource(dialog, req.user._id);

		await data.json();

		//send response
		if(dialog)
			return res.json({message: 'Dialog found', dialog: data});

		return res.status(404).json({message: 'No dialog with this nick'});
	}

	async clearDialog(req: IClearRequest, res: Response){
		const {user, dialog} = req.body;

		//check input
		if((!user && !dialog) || (user && dialog))
			return res.status(422).json({message: 'Provide or user or dialog'});

		//find dialog
		const dlg = dialog ?
			await DialogRepository.getDialogById(dialog) :
			await DialogRepository.getDialogWith(req.user._id, new Types.ObjectId(user));

		//show error
		if(!dlg)
			return res.status(404).json({message: 'No dialog with this id'});

		//clear and send success response
		await DialogRepository.clearFor(req.user.id, dlg.id);
		return res.json({
			message: 'Dialog was cleared'
		});
	}
}

export default new DialogsController();
