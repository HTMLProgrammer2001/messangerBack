import {Router} from 'express';
import {authenticate} from 'passport';

import StorageService from '../services/StorageService/';
import MessagesController from '../controllers/Messages.controller';


const messagesRouter = Router({caseSensitive: false});
messagesRouter.use(authenticate('bearer', {session: false}));

//add routes
messagesRouter.get('/text', MessagesController.getMessagesByText);
messagesRouter.get('/chat/:dialog', MessagesController.getMessageForChat);

messagesRouter.post('/',
	StorageService.getMiddleware('file', true),
	MessagesController.createMessage
);

export default messagesRouter;
