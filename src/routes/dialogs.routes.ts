import {Router} from 'express';
import {authenticate} from 'passport';

import DialogController from '../controllers/Dialogs.controller';
import * as DialogRequest from '../middlewares/requests/dialogs.request';


const dialogsRouter = Router();
dialogsRouter.use(authenticate('bearer', {session: false}));

dialogsRouter.get('/',
	DialogRequest.getDialogsValidators,
	<any>DialogController.getDialogs
);

dialogsRouter.get('/:nickname',
	DialogRequest.getDialogValidators,
	<any>DialogController.getDialog
);

export default dialogsRouter;
