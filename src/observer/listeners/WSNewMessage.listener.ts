import {IListener} from '../../interfaces/IListener';

import NewMessageEvent from '../events/NewMessage.event';
import MessageResource from '../../resources/MessageResource';
import DialogRepository from '../../repositories/Dialog.repository';
import {io} from '../../ws/';


const WSNewMessageListener: IListener = async (event: NewMessageEvent) => {
	//get data
	const message = event.getMessage(),
		curUser = event.getUser();

	const dialog = await DialogRepository.getDialogById(message.dialog.toString());

	//send to sockets
	return Promise.all(dialog.participants.map(async ({user, banTime}) => {
		if (banTime && message.time > banTime)
			return;

		//make resource
		const msgJson = new MessageResource(message, user.toString(), true);
		await msgJson.json();

		io.to(user.toString()).emit('newMessage', msgJson);
	}));
};

export default WSNewMessageListener;
