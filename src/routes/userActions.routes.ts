import {Router} from 'express';
import {authenticate} from 'passport';

import UserActionsController from '../controllers/UserActions.controller';


const userActionsRouter = Router();

//create routes
userActionsRouter.get('/me', authenticate('bearer', {session: false}), UserActionsController.me);
userActionsRouter.post('/login', UserActionsController.login);
userActionsRouter.post('/logout', authenticate('bearer', {session: false}), <any>UserActionsController.logout);
userActionsRouter.post('/sign', UserActionsController.signIn);
userActionsRouter.post('/confirm', UserActionsController.confirm);

export default userActionsRouter;
