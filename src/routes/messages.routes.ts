import {Router} from 'express';
import {authenticate} from 'passport';

import MessagesController from '../controllers/Messages.controller';


const messagesRouter = Router({caseSensitive: false});
messagesRouter.use(authenticate('bearer', {session: false}));

//add routes
messagesRouter.get('/text', MessagesController.getMessagesByText);

export default messagesRouter;
