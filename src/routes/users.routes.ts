import {Router} from 'express';
import {authenticate} from 'passport';

import UsersController from '../controllers/Users.controller';
import * as UserRequest from '../middlewares/requests/users.request';
import errorOnInvalid from '../middlewares/errorOnInvalid.middleware';


const usersRouter = Router({caseSensitive: false});
usersRouter.use(authenticate('bearer', {session: false}));

//register routes
usersRouter.post('/ban',
	errorOnInvalid(UserRequest.banUserValidators),
	UsersController.banUser
);

usersRouter.get('/nickname/:nickname',
	errorOnInvalid(UserRequest.getUserValidators),
	UsersController.getUser
);

export default usersRouter;
