import Resource from './Resource';
import {IMessage} from '../models/Message.model';

import UserResource from './UserResource';
import DialogResource from './DialogResource';
import MessagesGroupResource from './MessagesGroupResource';
import UserRepository from '../repositories/User.repository';
import DialogRepository from '../repositories/Dialog.repository';
import MessageRepository from '../repositories/Message.repository';


class MessageResource extends Resource<IMessage>{
	constructor(data: IMessage, userID: any, private withDialog: boolean = true){
		super(data, userID);
	}

	async getData(): Promise<Object> {
		let authorModel = await UserRepository.getById(this.data.author as any),
			author = null,
			dialog: any = this.data.dialog;

		if(this.data.deletedFor.includes(this.userID.toString()))
			return null;

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

		//populate resend messages
		const populated = await MessageRepository.getById(this.data._id)
			.populate('resend')
			.exec() as IMessage & {resend: IMessage[]};

		const resendMessages = new MessagesGroupResource(populated.resend || [], this.userID);
		await resendMessages.json();

		return {
			_id: this.data._id,
			type: this.data.type,
			message: this.data.message,
			url: this.data.url,
			time: this.data.time,
			size: this.data.size,
			resend: resendMessages.toJSON(),
			readed: this.data.readBy.includes(this.userID.toString()) ||
				(this.data.author.toString() == this.userID.toString() && this.data.readBy.length),
			author, dialog
		};
	}
}

export default MessageResource;
