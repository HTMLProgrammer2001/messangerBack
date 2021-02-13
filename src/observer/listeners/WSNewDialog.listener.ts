import {IListener} from '../../interfaces/IListener';

import NewDialogEvent from '../events/NewDialog.event';
import DialogResource from '../../resources/DialogResource';
import {io} from '../../ws/';


const WSNewDialogListener: IListener = async (event: NewDialogEvent) => {
	const dialog = event.getDialog(),
		curUser = event.getUser();

	//send to socket
	return Promise.all(dialog.participants.map(async ({user}) => {
		//make resource
		const dlgMsg = new DialogResource(dialog, user);
		await dlgMsg.json();

		if(event.getBroadcast() || user.toString() != curUser.toString())
			io.to(user.toString()).emit('newDialog', dlgMsg);
	}));
};

export default WSNewDialogListener;
