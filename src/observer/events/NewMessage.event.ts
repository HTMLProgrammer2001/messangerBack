import {IMessage} from '../../models/Message.model';
import {IEvent} from '../../interfaces/IEvent';


class NewMessageEvent implements IEvent{
	constructor(private message: IMessage){}

	getMessage(): IMessage{
		return this.message;
	}

	static getName(): string {
		return 'newMessage';
	}
}

export default NewMessageEvent;
