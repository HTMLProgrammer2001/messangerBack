import {Router} from 'express';

import MessagesController from '../controllers/Messages.controller';


const messagesRouter = Router({caseSensitive: false});

//add routes
messagesRouter.get('/text', MessagesController.getMessagesByText);

export default messagesRouter;
