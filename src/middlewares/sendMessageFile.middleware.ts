import {NextFunction, Request, Response} from 'express';

import {MessageTypes} from '../constants/MessageTypes';


type IReq = Request<{}, {}, {type: MessageTypes}>
const sendMessageFileMiddleware = (req: IReq, res: Response, next: NextFunction) => {
	const {type} = req.body;

	//add folder to save file
	switch (type) {
		case MessageTypes.IMAGE:
			req.file.destination = '/image/';
			break;

		case MessageTypes.DOCUMENT:
			req.file.destination = '/document/';
			break;

		case MessageTypes.AUDIO:
			req.file.destination = '/audio/';
			break;

		case MessageTypes.VIDEO:
			req.file.destination = '/video/';
			break;
	}

	//continue handling req
	next();
};

export default sendMessageFileMiddleware;
