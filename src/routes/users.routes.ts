import {Router} from 'express';

import UsersController from '../controllers/Users.controller';


const usersRouter = Router({caseSensitive: false});

//register routes
usersRouter.get('/:nickname', UsersController.getUser);

export default usersRouter;
