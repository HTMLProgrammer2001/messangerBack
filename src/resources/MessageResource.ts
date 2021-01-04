import Resource from './Resource';
import {IMessage} from '../models/Message.model';

import UserResource from './UserResource';
import DialogResource from './DialogResource';
import UserRepository from '../repositories/User.repository';
import DialogRepository from '../repositories/Dialog.repository';


class MessageResource extends Resource<IMessage>{
	constructor(data: IMessage, userID: any, private withDialog: boolean = true){
		super(data, userID);
	}

	async getData(): Promise<Object> {
		let authorModel = await UserRepository.getById(this.data.author as any),
			author = null,
			dialog: any = this.data.dialog;

		//load author
		if(authorModel) {
			author = new UserResource(authorModel, this.userID);
			await author.json();
		}

		//load dialog if need
		if(this.withDialog) {
			let dialogModel = await DialogRepository.getDialogById(this.data.dialog);

			if (dialogModel) {
				dialog = new DialogResource(dialogModel, this.userID, false);
				await dialog.json();
			}
		}

		return {
			_id: this.data._id,
			type: this.data.type,
			message: this.data.message,
			url: this.data.url,
			time: this.data.time,
			author, dialog
		};
	}
}

export default MessageResource;
