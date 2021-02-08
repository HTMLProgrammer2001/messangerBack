import {Router} from 'express';
import {authenticate} from 'passport';

import GroupActionsController from '../controllers/GroupActions.controller';
import errorOnInvalid from '../middlewares/errorOnInvalid.middleware';


const groupsRouter = Router();
groupsRouter.use(authenticate('bearer', {session: false}));

groupsRouter.post('/', GroupActionsController.create);

export default groupsRouter;
