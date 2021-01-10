import {Router} from 'express';
import {authenticate} from 'passport';

import DialogController from '../controllers/Dialogs.controller';
import * as DialogRequest from '../middlewares/requests/dialogs.request';


const dialogsRouter = Router();
dialogsRouter.use(authenticate('bearer', {session: false}));

dialogsRouter.get('/nickname',
	DialogRequest.getDialogsByNickValidators,
	DialogController.getDialogsByNick
);

dialogsRouter.get('/name',
	DialogRequest.getDialogsByNameValidators,
	DialogController.getDialogsByName
);

dialogsRouter.get('/nickname/:nickname',
	DialogRequest.getDialogValidators,
	DialogController.getDialog
);

dialogsRouter.post('/personal', DialogController.createPersonal);
dialogsRouter.post('/clear', DialogController.clearDialog);

export default dialogsRouter;
