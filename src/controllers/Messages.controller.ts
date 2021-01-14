import {Request, Response} from 'express';

import {IMessage} from '../models/Message.model';
import {MessageTypes} from '../constants/MessageTypes';

import MessageRepository from '../repositories/Message.repository';
import DialogRepository from '../repositories/Dialog.repository';
import MessagesGroupResource from '../resources/MessagesGroupResource';
import MessageResource from '../resources/MessageResource';


type IGetMessagesByTextReq = Request<{}, {}, {}, {text?: string, page?: number, pageSize?: number}>;
type IGetMessagesForChat = Request<{dialog: string}, {}, {}, {page?: number, pageSize?: number}>
type ICreateMessageReq = Request<{}, {}, {
	dialog: any,
	message: string,
	type: MessageTypes
}>

class MessagesController{
	async getMessagesByText(req: IGetMessagesByTextReq, res: Response){
		//parse data from QP
		let {text, page = 1, pageSize = 5} = req.query;
		page = +page;
		pageSize = +pageSize;

		if(!text)
			return res.json({message: 'No text to search', page: 1, totalPages: 1, data: [], pageSize: 1});

		//calculate paginate fields
		const resp = await MessageRepository.paginateMessagesByTextFor(req.user?.id, {text, page, pageSize}),
			total = resp ? resp.total : 0,
			totalPages = Math.ceil(total / pageSize),
			messages: IMessage[] = resp ? resp.data : [];

		const msg = messages.length ? 'Messages found' : 'Messages not found',
			data = new MessagesGroupResource(messages, req.user._id);

		await data.json();

		//return response
		return res.json({message: msg, page, totalPages, pageSize, total, data});
	}

	async getMessageForChat(req: IGetMessagesForChat, res: Response){
		let {page = 1, pageSize = 20} = req.query,
			{dialog} = req.params;

		page = +page;
		pageSize = +pageSize;

		const resp = await MessageRepository.paginateDialogFor(req.user?.id, dialog, {pageSize, page}),
			total = resp ? resp.total : 0,
			totalPages = Math.ceil(total / pageSize),
			messages: IMessage[] = resp ? resp.data : [];

		const msg = messages.length ? 'Messages found' : 'Messages not found',
			data = new MessagesGroupResource(messages, req.user._id);

		await data.json();

		//return response
		return res.json({message: msg, page, totalPages, pageSize, total, data});
	}

	async createMessage(req: ICreateMessageReq, res: Response){
		const {dialog, message, type} = req.body,
			dlg = await DialogRepository.getDialogById(dialog),
			userID = req.user?._id;

		//check dialog exists
		if(!dlg)
			return res.status(422).json({message: 'No dialog with this id'});

		//check if user is participant
		if(!dlg.participants.some(part => part.user.toString() == userID.toString()))
			return res.status(403).json({
				message: 'You are not active participant of this dialog'
			});

		//create message and resource
		const newMessage = await MessageRepository.create({
				type, dialog, author: req.user?._id,
				message, time: new Date()
		}),
			resource = new MessageResource(newMessage, req.user._id, false);

		await resource.json();

		//return new message
		return res.json({
			message: 'Message created',
			newMessage: resource
		});
	}
}

export default new MessagesController();
