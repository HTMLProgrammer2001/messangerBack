import {Router} from 'express';

import UserActionsController from '../controllers/UserActions.controller';


const userActionsRouter = Router();

//create routes
userActionsRouter.get('/me', UserActionsController.me);
userActionsRouter.post('/login', UserActionsController.login);
userActionsRouter.post('/logout', UserActionsController.logout);
userActionsRouter.post('/sign', UserActionsController.signIn);

export default userActionsRouter;
