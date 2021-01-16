import {Router} from 'express';
import {authenticate} from 'passport';

import StorageService from '../services/StorageService/';
import MessagesController from '../controllers/Messages.controller';
import sendMessageFileMiddleware from '../middlewares/sendMessageFile.middleware';
import {MessageTypes} from '../constants/MessageTypes';


const messagesRouter = Router({caseSensitive: false});
messagesRouter.use(authenticate('bearer', {session: false}));

//add routes
messagesRouter.get('/text', MessagesController.getMessagesByText);
messagesRouter.get('/chat/:dialog', MessagesController.getMessageForChat);

messagesRouter.post('/',
	(req: any, res: any, next: any) => {
		if(req.body.type != MessageTypes.MESSAGE)
			StorageService.getMiddleware('file', true)[0](req, res, next);
		else
			next();
	},
	sendMessageFileMiddleware,
	MessagesController.createMessage
);

messagesRouter.delete('/', MessagesController.deleteMessages);

export default messagesRouter;
