import {Request, Response} from 'express';

import {IDialog} from '../models/Dialog.model';
import DialogRepository from '../repositories/Dialog.repository';
import {IAuthRequest} from '../interfaces/IAuthRequest';


type IGetDialogsQuery = {nickname?: string, page?: number, pageSize?: number};

type IGetDialogsRequest = IAuthRequest & Request<{}, {}, {}, IGetDialogsQuery>;
type IGetDialogRequest = IAuthRequest & Request<{nickname: string}>;

class DialogsController{
	async getDialogs(req: IGetDialogsRequest, res: Response){
		//parse data from QP
		let {nickname, page = 1, pageSize = 5} = req.query as IGetDialogsQuery;
		page = +page;
		pageSize = +pageSize;

		//calculate paginate fields
		const resp = await DialogRepository.paginateFor(req.user?._id, {nickname, pageSize, page}),
			total = resp ? resp.total : 0,
			totalPages = total / pageSize,
			dialogs: IDialog[] = resp ? resp.data : [];

		const message = dialogs.length ? 'Dialogs found' : 'Dialogs not found';

		//return response
		return res.json({message, page, pageSize, data: dialogs, total, totalPages});
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
