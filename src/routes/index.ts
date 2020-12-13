import {Router} from 'express';

import UserActionsRoutes from './userActions.routes';


const rootRouter = Router({caseSensitive: false, strict: false});

rootRouter.use('/', UserActionsRoutes);

export default rootRouter;
