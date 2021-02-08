import {Router} from 'express';

import UserActionsRoutes from './userActions.routes';
import DialogRoutes from './dialogs.routes';
import UsersRoutes from './users.routes';
import MessagesRoutes from './messages.routes';
import GroupRoutes from './group.routes';


const rootRouter = Router({caseSensitive: false, strict: false});

rootRouter.use('/dialogs', DialogRoutes);
rootRouter.use('/users', UsersRoutes);
rootRouter.use('/messages', MessagesRoutes);
rootRouter.use('/groups', GroupRoutes);
rootRouter.use('/', UserActionsRoutes);

export default rootRouter;
