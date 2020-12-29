import {Request, Response} from 'express';

import MessageRepository from '../repositories/Message.repository';
import {IMessage} from '../models/Message.model';


type IGetMessagesByTextReq = Request<{}, {}, {}, {text?: string, page?: number, pageSize?: number}>;

class MessagesController{
	async getMessages(req: IGetMessagesByTextReq, res: Response){
		//parse data from QP
		let {text, page = 1, pageSize = 5} = req.query;
		page = +page;
		pageSize = +pageSize;

		if(!text)
			return res.json({message: 'No text to search', page: 1, totalPages: 1, data: [], pageSize: 1});

		//calculate paginate fields
		const resp = await MessageRepository.paginateMessagesByTextFor(req.user?._id, {text, page, pageSize}),
			total = resp ? resp.total : 0,
			totalPages = Math.ceil(total / pageSize),
			messages: IMessage[] = resp ? resp.data : [];

		const msg = messages.length ? 'Messages found' : 'Messages not found';

		//return response
		return res.json({message: msg, page, totalPages, pageSize, data: messages, total});
	}
}

export default new MessagesController();
