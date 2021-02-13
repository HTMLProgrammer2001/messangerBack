import {Types} from 'mongoose';

import {IDialog} from '../../models/Dialog.model';
import {IEvent} from '../../interfaces/IEvent';


class NewDialogEvent implements IEvent{
	private isBroadcast = false;
	constructor(private dialog: IDialog, private user: Types.ObjectId){}

	getDialog(): IDialog{
		return this.dialog;
	}

	getBroadcast(){
		return this.isBroadcast;
	}

	broadcast(){
		this.isBroadcast = true;
		return this;
	}

	getUser(){
		return this.user;
	}

	static getName(): string {
		return 'newDialog';
	}
}

export default NewDialogEvent;
