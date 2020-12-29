import {Router} from 'express';

import UserActionsRoutes from './userActions.routes';
import DialogRoutes from './dialogs.routes';
import UsersRoutes from './users.routes';
import MessagesRoutes from './messages.routes';


const rootRouter = Router({caseSensitive: false, strict: false});

rootRouter.use('/dialogs', DialogRoutes);
rootRouter.use('/users', UsersRoutes);
rootRouter.use('/messages', MessagesRoutes);
rootRouter.use('/', UserActionsRoutes);

export default rootRouter;
