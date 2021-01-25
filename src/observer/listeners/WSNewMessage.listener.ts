import {IListener} from '../../interfaces/IListener';
import {IDialog} from '../../models/Dialog.model';

import NewMessageEvent from '../events/NewMessage.event';
import MessageResource from '../../resources/MessageResource';
import {io} from '../../ws/';


const WSNewMessageListener: IListener = async (event: NewMessageEvent) => {
	//get data
	const message = event.getMessage();
	const populatedMessage = message.populate('dialog');
	await populatedMessage.execPopulate();

	//make resource
	const msgJson = new MessageResource(message, message.author, false);
	await msgJson.json();

	//send to sockets
	(populatedMessage.dialog as any as IDialog).participants.map(({user}) => {
		if(user.toString() == message.author.toString())
			return;

		io.to(user.toString()).emit('newMessage', msgJson);
	});
};

export default WSNewMessageListener;
