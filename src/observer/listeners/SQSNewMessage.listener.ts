import {IListener} from '../../interfaces/IListener';
import {DialogTypes} from '../../constants/DialogTypes';

import NewMessageEvent from '../events/NewMessage.event';
import sqsService from '../../services/MQService/';
import DialogRepository from '../../repositories/Dialog.repository';
import UserRepository from '../../repositories/User.repository';


const sqsNewMessageListener: IListener = async (event: NewMessageEvent) => {
	//get data
	const message = event.getMessage(),
		curUserID = event.getUser();

	const dialog = await DialogRepository.getDialogById(message.dialog.toString()),
		curUser = await UserRepository.getById(curUserID);

	//send to sockets
	return Promise.all(dialog.participants.map(async ({user: userID, banTime}) => {
		if (banTime && message.time > banTime)
			return;

		if(userID.toString() == curUserID.toString())
			return;

		const user = await UserRepository.getById(userID);

		if(!user.banned.includes(curUserID.toString()))
			await sqsService.sendMessage(user.id, {
				icon: dialog.type == DialogTypes.PERSONAL ? curUser.avatar : dialog.groupOptions.avatar,
				message: message.message,
				title: dialog.type == DialogTypes.PERSONAL ? curUser.name : dialog.groupOptions.title
			}, 'NEW_MESSAGE', message.id);
	}));
};

export default sqsNewMessageListener;
