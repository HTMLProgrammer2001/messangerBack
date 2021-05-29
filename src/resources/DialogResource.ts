import {IDialog} from '../models/Dialog.model';
import {DialogTypes} from '../constants/DialogTypes';

import Resource from './Resource';
import MessageResource from './MessageResource';
import MessageRepository from '../repositories/Message.repository';
import UserRepository from '../repositories/User.repository';
import DialogRepository from '../repositories/Dialog.repository';


class DialogResource extends Resource<IDialog>{
	constructor(data: IDialog, userID: any, private withMessage = true){
		super(data, userID);
	}

	async getData(){
		let messageModel = await MessageRepository.getById(this.data.lastMessage),
			lastMessage: any = this.data.lastMessage;

		//load last message
		if(messageModel && this.withMessage) {
			lastMessage = new MessageResource(messageModel, this.userID, false);
			await lastMessage.json();
		}

		//get unread messages count
		const unread = await MessageRepository.getUnreadMessagesFor(this.userID, this.data._id);

		const opts = this.data.type == DialogTypes.PERSONAL ?
			await this.getOptsForPersonal() : await this.getOptsForChat();

		const activeParts = this.data.participants.filter(part => !part.banTime);

		return {
			_id: this.data._id,
			type: this.data.type,
			partCount: activeParts.length,
			groupOptions: this.data.groupOptions,
			unread: unread.length,
			lastMessage,
			...opts
		};
	}

	private async getOptsForPersonal(): Promise<Object>{
		//get data of another user
		let userID = this.data.participants[0].user;

		if(userID.toString() == this.userID.toString())
			userID = this.data.participants[1].user;

		const userModel = await UserRepository.getById(userID.toString());

		//return data
		return {
			name: userModel?.name,
			avatar: userModel?.avatar,
			nick: userModel?.nickname,
			isActive: !userModel.banned.includes(this.userID.toString()),
			isOnline: userModel?.isOnline,
			user: userID
		};
	}

	private async getOptsForChat(): Promise<Object>{
		return {
			name: this.data.groupOptions?.title,
			avatar: this.data.groupOptions?.avatar,
			nick: this.data._id,
			isActive: await DialogRepository.isActive(this.data._id, this.userID),
			myRole: await DialogRepository.getMyRoleFor(this.data._id, this.userID),
			isOnline: false
		}
	}
}

export default DialogResource;
