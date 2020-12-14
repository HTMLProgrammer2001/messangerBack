import {Router} from 'express';

import UserActionsRoutes from './userActions.routes';
import DialogRoutes from './dialogs.routes';


const rootRouter = Router({caseSensitive: false, strict: false});

rootRouter.use('/dialogs', DialogRoutes);
rootRouter.use('/', UserActionsRoutes);

export default rootRouter;
