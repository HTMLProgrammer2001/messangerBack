import {Router} from 'express';
import {authenticate} from 'passport';

import GroupActionsController from '../controllers/GroupActions.controller';
import errorOnInvalid from '../middlewares/errorOnInvalid.middleware';


const groupsRouter = Router();
groupsRouter.use(authenticate('bearer', {session: false}));

groupsRouter.post('/', GroupActionsController.create);
groupsRouter.get('/participants', GroupActionsController.getParticipants);
groupsRouter.post('/changeAdmin', GroupActionsController.changeAdmin);
groupsRouter.post('/changeOwner', GroupActionsController.changeOwner);
groupsRouter.post('/leave', GroupActionsController.leave);
groupsRouter.post('/ban', GroupActionsController.ban);
groupsRouter.delete('/:id', GroupActionsController.deleteGroup);

export default groupsRouter;
