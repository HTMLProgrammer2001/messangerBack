import {Request, Response} from 'express';

import {IDialog} from '../models/Dialog.model';
import DialogRepository from '../repositories/Dialog.repository';
import {IAuthRequest} from '../interfaces/IAuthRequest';


type IGetDialogsQuery = {page?: number, pageSize?: number};

type IGetDialogsByNickRequest = IAuthRequest & Request<{}, {}, {}, IGetDialogsQuery & {nickname?: string}>
type IGetDialogsByNameRequest = IAuthRequest & Request<{name?: string} | IGetDialogsQuery>
type IGetDialogRequest = IAuthRequest & Request<{nickname: string}>

class DialogsController{
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

		const message = dialogs.length ? 'Dialogs found' : 'Dialogs not found';

		//return response
		return res.json({message, page, total, totalPages, pageSize, data: dialogs});
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

		const message = dialogs.length ? 'Dialogs found' : 'Dialogs not found';

		//return response
		return res.json({message, page, pageSize, total, totalPages, data: dialogs});
	}

	async getDialog(req: IGetDialogRequest, res: Response){
		const dialog = await DialogRepository.getDialogByNick(req.params.nickname);

		//send response
		if(dialog)
			return res.json({
				message: 'Dialog found',
				data: dialog
			});

		return res.status(422).json({message: 'No dialog with this nick'});
	}
}

export default new DialogsController();
