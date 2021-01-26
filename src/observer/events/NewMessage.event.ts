import {Types} from 'mongoose';

import {IMessage} from '../../models/Message.model';
import {IEvent} from '../../interfaces/IEvent';


class NewMessageEvent implements IEvent{
	constructor(private message: IMessage, private user: Types.ObjectId){}

	getMessage(): IMessage{
		return this.message;
	}

	getUser(){
		return this.user;
	}

	static getName(): string {
		return 'newMessage';
	}
}

export default NewMessageEvent;
