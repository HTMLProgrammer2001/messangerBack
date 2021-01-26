import {IEvent} from '../../interfaces/IEvent';
import {IMessage} from '../../models/Message.model';


class DeleteMessageEvent implements IEvent{
	constructor(private deletedMessage: IMessage){}

	getDeletedMessage(){
		return this.deletedMessage;
	}

	static getName(){
		return 'deleteMessage';
	}
}

export default DeleteMessageEvent;
