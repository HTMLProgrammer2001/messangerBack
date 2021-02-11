import {Types} from 'mongoose';

import {IMessage} from '../../models/Message.model';
import {IEvent} from '../../interfaces/IEvent';


class NewMessageEvent implements IEvent{
	private isBroadcast = false;
	constructor(private message: IMessage, private user?: Types.ObjectId){}

	getMessage(): IMessage{
		return this.message;
	}

	broadcast(){
		this.isBroadcast = true;
		return this;
	}

	getBroadcast(){
		return this.isBroadcast;
	}

	getUser(){
		return this.user;
	}

	static getName(): string {
		return 'newMessage';
	}
}

export default NewMessageEvent;
