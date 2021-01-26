import {IEvent} from '../../interfaces/IEvent';
import {IMessage} from '../../models/Message.model';


class UpdateMessageEvent implements IEvent{
	constructor(private newMessage: IMessage){}

	getNewMessage(){
		return this.newMessage;
	}

	static getName(){
		return 'updateMessage';
	}
}

export default UpdateMessageEvent;
