import {IListener} from '../../interfaces/IListener';

import NewDialogEvent from '../events/NewDialog.event';
import DialogResource from '../../resources/DialogResource';
import {io} from '../../ws/';


const WSNewDialogListener: IListener = async (event: NewDialogEvent) => {
	const dialog = event.getDialog(),
		curUser = event.getUser();

	//make resource
	const dlgMsg = new DialogResource(dialog, dialog.participants[1].user);
	await dlgMsg.json();

	//send to socket
	dialog.participants.map(({user}) => {
		if(user.toString() != curUser.toString())
			io.to(user.toString()).emit('newDialog', dlgMsg);
	});
};

export default WSNewDialogListener;
