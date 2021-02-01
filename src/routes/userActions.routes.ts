import {NextFunction, Request, Response, Router} from 'express';
import {body} from 'express-validator';
import {authenticate} from 'passport';

import {CodeTypes} from '../constants/CodeTypes';
import User from '../models/User.model';
import UserActionsController from '../controllers/UserActions.controller';
import EditMeController from '../controllers/EditMe.controller';
import * as UserActionsRequest from '../middlewares/requests/userActions.request';
import StorageService from '../services/StorageService';
import errorOnInvalid from '../middlewares/errorOnInvalid.middleware';
import existsCustomValidator from '../middlewares/validators/exists.validator';


const userActionsRouter = Router();

//create routes
userActionsRouter.get('/me',
	authenticate('bearer', {session: false}),
	UserActionsController.me
);

userActionsRouter.post('/me',
	authenticate('bearer', {session: false}),
	errorOnInvalid(UserActionsRequest.editMeValidators),
	...StorageService.getMiddleware('avatar', true, '/avatars/'),
	EditMeController.editMe
);

userActionsRouter.post('/login',
	errorOnInvalid(UserActionsRequest.loginValidators),
	UserActionsController.login
);

userActionsRouter.post('/logout',
	authenticate('bearer', {session: false}),
	UserActionsController.logout
);

userActionsRouter.post('/resend',
	errorOnInvalid(UserActionsRequest.resendValidators),
	UserActionsController.resend
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

userActionsRouter.delete('/avatar',
	authenticate('bearer', {session: false}),
	EditMeController.deleteAvatar
);

userActionsRouter.post('/changePhone',
	errorOnInvalid(UserActionsRequest.changePhoneValidators),
	EditMeController.changePhone
);

userActionsRouter.post('/confirm/changePhone',
	errorOnInvalid(UserActionsRequest.confirmChangePhoneValidators),
	EditMeController.confirmChange
);

export default userActionsRouter;
