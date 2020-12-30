import {IDialog} from '../models/Dialog.model';
import {DialogTypes} from '../constants/DialogTypes';

import Resource from './Resource';
import MessageResource from './MessageResource';
import MessageRepository from '../repositories/Message.repository';
import UserRepository from '../repositories/User.repository';


class DialogResource extends Resource<IDialog>{
	constructor(data: IDialog, private withMessage = true){
		super(data);
	}

	async getData(){
		let messageModel = await MessageRepository.getById(this.data.lastMessage as any),
			lastMessage: any = this.data.lastMessage;

		//load message
		if(messageModel && this.withMessage) {
			lastMessage = new MessageResource(messageModel, false);
			await lastMessage.json();
		}

		const opts = this.data.type == DialogTypes.PERSONAL ?
			await this.getOptsForPersonal() : await this.getOptsForChat();

		return {
			_id: this.data._id,
			type: this.data.type,
			partCount: this.data.participants.length,
			groupOptions: this.data.groupOptions,
			lastMessage,
			...opts
		};
	}

	private async getOptsForPersonal(): Promise<Object>{
		//get data of another user
		let userID: any = this.data.participants[0].user;
		const userModel = await UserRepository.getById(userID);

		//return data
		return {
			name: userModel?.name,
			avatar: userModel?.avatar,
			nick: userModel?.nickname
		};
	}

	private async getOptsForChat(): Promise<Object>{
		return {
			name: this.data.groupOptions?.title,
			avatar: this.data.groupOptions?.avatar,
			nick: this.data.groupOptions?.nick
		}
	}
}

export default DialogResource;
