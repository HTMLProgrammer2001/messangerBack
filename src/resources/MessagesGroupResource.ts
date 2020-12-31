import {IMessage} from '../models/Message.model';

import GroupResource from './GroupResource';
import MessageResource from './MessageResource';


class MessagesGroupResource extends GroupResource<IMessage>{
	async apply(item: IMessage){
		const message = new MessageResource(item, this.userID);
		await message.json();
		return message.toJSON();
	}
}

export default MessagesGroupResource;
