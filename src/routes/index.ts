import {Router} from 'express';

import UserActionsRoutes from './userActions.routes';
import DialogRoutes from './dialogs.routes';
import UsersRoutes from './users.routes';
import MessagesRoutes from './messages.routes';
import GroupRoutes from './group.routes';
import SubsRoutes from './subscription.routes';


const rootRouter = Router({caseSensitive: false, strict: false});

rootRouter.use('/dialogs', DialogRoutes);
rootRouter.use('/users', UsersRoutes);
rootRouter.use('/messages', MessagesRoutes);
rootRouter.use('/groups', GroupRoutes);
rootRouter.use('/subscription', SubsRoutes);
rootRouter.use('/', UserActionsRoutes);

export default rootRouter;
