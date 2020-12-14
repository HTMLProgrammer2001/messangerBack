import {Router} from 'express';
import {authenticate} from 'passport';

import DialogController from '../controllers/Dialogs.controller';


const dialogsRouter = Router();
dialogsRouter.use(authenticate('bearer', {session: false}));

dialogsRouter.get('/', <any>DialogController.getDialogs);
dialogsRouter.get('/:nickname', <any>DialogController.getDialog);

export default dialogsRouter;
