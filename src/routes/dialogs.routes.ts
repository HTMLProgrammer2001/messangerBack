import {Router} from 'express';
import {authenticate} from 'passport';

import DialogController from '../controllers/Dialogs.controller';
import * as DialogRequest from '../middlewares/requests/dialogs.request';
import errorOnInvalid from '../middlewares/errorOnInvalid.middleware';


const dialogsRouter = Router();
dialogsRouter.use(authenticate('bearer', {session: false}));

dialogsRouter.get('/nickname',
	errorOnInvalid(DialogRequest.getDialogsByNickValidators),
	DialogController.getDialogsByNick
);

dialogsRouter.get('/name',
	errorOnInvalid(DialogRequest.getDialogsByNameValidators),
	DialogController.getDialogsByName
);

dialogsRouter.get('/nickname/:nickname',
	errorOnInvalid(DialogRequest.getDialogValidators),
	DialogController.getDialog
);

dialogsRouter.post('/personal',
	errorOnInvalid(DialogRequest.createPersonalValidators),
	DialogController.createPersonal
);

dialogsRouter.post('/clear',
	errorOnInvalid(DialogRequest.clearDialogValidators),
	DialogController.clearDialog
);

export default dialogsRouter;
