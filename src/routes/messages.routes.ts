import {Router} from 'express';
import {authenticate} from 'passport';

import StorageService from '../services/StorageService/';
import MessagesController from '../controllers/Messages.controller';
import * as MessagesRequest from '../middlewares/requests/messages.request';
import sendMessageFileMiddleware from '../middlewares/sendMessageFile.middleware';
import errorOnInvalid from '../middlewares/errorOnInvalid.middleware';


const messagesRouter = Router({caseSensitive: false});
messagesRouter.use(authenticate('bearer', {session: false}));

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
	...StorageService.getMiddleware('file', true),
	sendMessageFileMiddleware,
	errorOnInvalid(MessagesRequest.createMessageValidators),
	MessagesController.createMessage
);

messagesRouter.delete('/',
	errorOnInvalid(MessagesRequest.deleteMessageValidators),
	MessagesController.deleteMessages
);

messagesRouter.put('/:messageID',
	...StorageService.getMiddleware('file', true),
	sendMessageFileMiddleware,
	errorOnInvalid(MessagesRequest.editMessageValidators),
	MessagesController.editMessage
);

messagesRouter.post('/resend', MessagesController.resendMessage);

export default messagesRouter;
