import {Router} from 'express';
import {authenticate} from 'passport';

import DialogController from '../controllers/Dialogs.controller';
import * as DialogRequest from '../middlewares/requests/dialogs.request';


const dialogsRouter = Router();
dialogsRouter.use(authenticate('bearer', {session: false}));

dialogsRouter.get('/',
	DialogRequest.getDialogsValidators,
	DialogController.getDialogs
);

dialogsRouter.get('/:nickname',
	DialogRequest.getDialogValidators,
	DialogController.getDialog
);

export default dialogsRouter;
