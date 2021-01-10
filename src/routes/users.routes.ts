import {Router} from 'express';
import {authenticate} from 'passport';

import UsersController from '../controllers/Users.controller';


const usersRouter = Router({caseSensitive: false});
usersRouter.use(authenticate('bearer', {session: false}));

//register routes
usersRouter.post('/ban', UsersController.banUser);
usersRouter.get('/nickname/:nickname', UsersController.getUser);

export default usersRouter;
