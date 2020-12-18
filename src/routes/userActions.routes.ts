import {Router} from 'express';
import {authenticate} from 'passport';
import multer from 'multer';

import UserActionsController from '../controllers/UserActions.controller';
import * as UserActionsRequest from '../middlewares/requests/userActions.request';
import errorOnInvalid from '../middlewares/errorOnInvalid.middleware';
import codeGenerator from '../helpers/codeGenerator';


const diskStorage = multer.diskStorage({
	destination(req, file, cb){
		if(file.mimetype.indexOf('image') == -1)
			return cb(new Error('Avatar can be only image'), '');

		cb(null, './src/static/avatars');
	},
	filename(req, file, cb): void {
		const fileExt = file.originalname.split('.').slice(-1)[0],
			fileName = codeGenerator(24);

		cb(null, `${fileName}.${fileExt}`);
	}
});

const uploader = multer({storage: diskStorage});

const userActionsRouter = Router();

//create routes
userActionsRouter.get('/me',
	authenticate('bearer', {session: false}),
	UserActionsController.me
);

userActionsRouter.post('/me',
	authenticate('bearer', {session: false}),
	errorOnInvalid(UserActionsRequest.editMeValidators),
	uploader.single('avatar'),
	UserActionsController.editMe
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
	UserActionsController.deleteAvatar
);

export default userActionsRouter;
