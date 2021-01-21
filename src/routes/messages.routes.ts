import {Request, Response, Router} from 'express';
import {authenticate} from 'passport';

import StorageService from '../services/StorageService/';
import MessagesController from '../controllers/Messages.controller';
import * as MessagesRequest from '../middlewares/requests/messages.request';
import sendMessageFileMiddleware from '../middlewares/sendMessageFile.middleware';
import {MessageTypes} from '../constants/MessageTypes';
import errorOnInvalid from '../middlewares/errorOnInvalid.middleware';


const messagesRouter = Router({caseSensitive: false});
messagesRouter.use(authenticate('bearer', {session: false}));

//middleware for optional file upload
const preMessageValidator = (req: Request, res: Response, next: any) => {
	if (req.body.type != MessageTypes.MESSAGE)
		StorageService.getMiddleware('file', true)[0](req, res, next);
	else
		next();
};

//add routes
messagesRouter.get('/text',
	errorOnInvalid(MessagesRequest.getMessagesByTextValidators),
	MessagesController.getMessagesByText
);

messagesRouter.get('/chat/:dialog',
	errorOnInvalid(MessagesRequest.getMessagesForChatValidators),
	MessagesController.getMessageForChat
);

messagesRouter.post('/',
	preMessageValidator,
	sendMessageFileMiddleware,
	errorOnInvalid(MessagesRequest.createMessageValidators),
	MessagesController.createMessage
);

messagesRouter.delete('/',
	errorOnInvalid(MessagesRequest.deleteMessageValidators),
	MessagesController.deleteMessages
);

messagesRouter.put('/:messageID',
	preMessageValidator,
	sendMessageFileMiddleware,
	errorOnInvalid(MessagesRequest.editMessageValidators),
	MessagesController.editMessage
);

export default messagesRouter;
