import {IEvent} from '../../interfaces/IEvent';
import {IMessage} from '../../models/Message.model';


class DeleteMessageEvent implements IEvent{
	constructor(private curUser: string, private deletedMessage: IMessage){}

	getDeletedMessage(){
		return this.deletedMessage;
	}


	getCurUser(){
		return this.curUser;
	}

	static getName(){
		return 'deleteMessage';
	}
}

export default DeleteMessageEvent;
