import {Socket} from 'socket.io';

import DialogRepository from '../../repositories/Dialog.repository';
import dialogStatusToText from '../../helpers/dialogStatusToText';
import {DialogStatus} from '../../constants/DialogStatus';


let timers: Record<string, number> = {};

const setStatusListener = async (socket: Socket, {dialog, status}: {dialog: string, status: DialogStatus}) => {
	const dlg = await DialogRepository.getDialogById(dialog);

	if(!dlg)
		return;

	const sendStatus = (status: string) => {
		dlg.participants.map(({user}) => {
			if(user.toString() != socket.user.id)
				socket.to(user.toString()).emit('setStatus', {dialog, status});
		});
	};

	//send status
	sendStatus(dialogStatusToText(socket.user.name, status));

	//add timer to clear status
	if(timers[socket.user.id])
		clearTimeout(timers[socket.user.id]);

	timers[socket.user.id] = setTimeout(sendStatus, 2000, '');
};

export default setStatusListener;
