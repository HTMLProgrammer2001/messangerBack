import {IListener} from '../../interfaces/IListener';
import {IDialog} from '../../models/Dialog.model';

import UpdateMessageEvent from '../events/UpdateMessage.event';
import MessageResource from '../../resources/MessageResource';
import {io} from '../../ws/';


const wsUpdateMessageListener: IListener = async (event: UpdateMessageEvent) => {
	const newMessage = event.getNewMessage();

	//make resource
	const msgResource = new MessageResource(newMessage, newMessage.author, false);
	await msgResource.json();

	//get dialog
	const populatedMessage = newMessage.populate('dialog');
	await populatedMessage.execPopulate();

	//send to socket
	(populatedMessage.dialog as any as IDialog).participants.map(({user}) => {
		io.to(user.toString()).emit('updateMessage', msgResource);
	});
};

export default wsUpdateMessageListener;
