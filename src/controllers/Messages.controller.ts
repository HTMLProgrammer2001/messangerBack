import {Request, Response} from 'express';
import {Types} from 'mongoose';

import {IMessage} from '../models/Message.model';
import {MessageTypes} from '../constants/MessageTypes';

import MessageRepository from '../repositories/Message.repository';
import DialogRepository from '../repositories/Dialog.repository';
import MessagesGroupResource from '../resources/MessagesGroupResource';
import MessageResource from '../resources/MessageResource';
import StorageService from '../services/StorageService/';
import NewMessageEvent from '../observer/events/NewMessage.event';

import {dispatch} from '../observer';
import UpdateMessageEvent from '../observer/events/UpdateMessage.event';
import DeleteMessageEvent from '../observer/events/DeleteMessage.event';


type IGetMessagesByTextReq = Request<{}, {}, {}, { text?: string, page?: number, pageSize?: number }>;
type IGetMessagesForChat = Request<{ dialog: string }, {}, {}, { page?: number, pageSize?: number }>
type ICreateMessageReq = Request<{}, {}, {
	dialog: any,
	message: string,
	type: MessageTypes
}>

type IDeleteMessagesReq = Request<{}, {}, {}, {
	messages: string[],
	forOthers: string
}>

type IEditMessageReq = Request<{ messageID: string }, {}, {
	message: string,
	type: MessageTypes
}>

class MessagesController {
	async getMessagesByText(req: IGetMessagesByTextReq, res: Response) {
		//parse data from QP
		let {text, page = 1, pageSize = 5} = req.query;
		page = +page;
		pageSize = +pageSize;

		if (!text)
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

	async getMessageForChat(req: IGetMessagesForChat, res: Response) {
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

	async createMessage(req: ICreateMessageReq, res: Response) {
		let {dialog, message, type} = req.body,
			dlg = await DialogRepository.getDialogById(dialog),
			userID = req.user?._id,
			size = null,
			url = null;

		//check dialog exists
		if (!dlg)
			return res.status(422).json({message: 'No dialog with this id'});

		//check if user is participant
		if (!dlg.participants.some(part => part.user.toString() == userID.toString()))
			return res.status(403).json({
				message: 'You are not active participant of this dialog'
			});

		//upload file
		if (req.file) {
			url = await StorageService.upload(req.file);
			size = req.file.size;
			message = req.file.originalname;
		}

		//create message
		const newMessage = await MessageRepository.create({
			type, dialog, author: req.user?._id,
			message, time: new Date(), url, size
		});

		dispatch(new NewMessageEvent(newMessage, req.user._id));

		//make resource
		const resource = new MessageResource(newMessage, req.user._id, false);
		await resource.json();

		//return new message
		return res.json({
			message: 'Message created',
			newMessage: resource
		});
	}

	async deleteMessages(req: IDeleteMessagesReq, res: Response) {
		//get data from query
		const {messages, forOthers} = req.query,
			isOther = forOthers == 'true';

		for (let messageID of messages) {
			//find message
			const msg = await MessageRepository.getById(messageID);

			//check exists
			if (!msg)
				return res.status(404).json({message: 'No message with this id'});

			//check error
			if (isOther && (msg.author.toString() != req.user?.id))
				return res.status(403).json({message: 'You cannot delete this messages'});

			if (!isOther)
			//update message deleted for
				await MessageRepository.update(new Types.ObjectId(messageID), {
					deletedFor: [...new Set([...msg.deletedFor, req.user?._id])]
				});
			else {
				//delete message for all
				const msg = await MessageRepository.getById(messageID);
				dispatch(new DeleteMessageEvent(msg));
				await MessageRepository.delete(msg._id);
			}
		}

		return res.json({message: 'Messages successfully deleted'});
	}

	async editMessage(req: IEditMessageReq, res: Response) {
		let {messageID} = req.params,
			{message, type} = req.body,
			userID = req.user?._id,
			size: number = null,
			url: string = null;

		//find message
		const msg = await MessageRepository.getById(messageID);

		//check exists
		if (!msg)
			return res.status(404).json({message: 'Message not exists'});

		//check author
		if (msg.author.toString() != userID.toString())
			return res.status(403).json({message: 'You are not author of this message'});

		//upload file
		if (req.file) {
			url = await StorageService.upload(req.file);
			size = req.file.size;
			message = req.file.originalname;
		}

		//update message
		await MessageRepository.update(new Types.ObjectId(messageID), {
			type, message, url, size
		});

		const updatedMessage = await MessageRepository.getById(messageID),
			resource = new MessageResource(updatedMessage, req.user._id, false);

		await resource.json();

		//send event
		dispatch(new UpdateMessageEvent(updatedMessage));

		//return new message
		return res.json({
			message: 'Message updated',
			newMessage: resource
		});
	}
}

export default new MessagesController();
