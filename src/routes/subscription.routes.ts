import {Router} from 'express';
import {authenticate} from 'passport';

import SubscriptionsController from '../controllers/Subscriptions.controller';


const subsRouter = Router();
subsRouter.use(authenticate('bearer', {session: false}));

subsRouter.post('/', SubscriptionsController.setSubs);

export default subsRouter;
