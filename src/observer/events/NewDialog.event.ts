import {Types} from 'mongoose';

import {IDialog} from '../../models/Dialog.model';
import {IEvent} from '../../interfaces/IEvent';


class NewDialogEvent implements IEvent{
	constructor(private dialog: IDialog, private user: Types.ObjectId){}

	getDialog(): IDialog{
		return this.dialog;
	}

	getUser(){
		return this.user;
	}

	static getName(): string {
		return 'newDialog';
	}
}

export default NewDialogEvent;
