import {Router} from 'express';
import {authenticate} from 'passport';

import UserActionsController from '../controllers/UserActions.controller';
import * as UserActionsRequest from '../middlewares/requests/userActions.request';
import errorOnInvalid from '../middlewares/errorOnInvalid.middleware';


const userActionsRouter = Router();

//create routes
userActionsRouter.get('/me',
	authenticate('bearer', {session: false}),
	UserActionsController.me
);

userActionsRouter.post('/me',
	authenticate('bearer', {session: false}),
	errorOnInvalid(UserActionsRequest.editMeValidators),
	<any>UserActionsController.editMe
);

userActionsRouter.post('/login',
	errorOnInvalid(UserActionsRequest.loginValidators),
	UserActionsController.login
);

userActionsRouter.post('/logout',
	authenticate('bearer', {session: false}),
	<any>UserActionsController.logout
);

userActionsRouter.post('/resend',
	errorOnInvalid(UserActionsRequest.resendValidators),
	<any>UserActionsController.resend
);

userActionsRouter.post('/sign',
	errorOnInvalid(UserActionsRequest.signValidators),
	UserActionsController.signIn
);

userActionsRouter.post('/confirm/login',
	errorOnInvalid(UserActionsRequest.confirmValidators),
	UserActionsController.confirmLogin
);

userActionsRouter.post('/confirm/sign',
	errorOnInvalid(UserActionsRequest.confirmValidators),
	UserActionsController.confirmSign
);

export default userActionsRouter;
