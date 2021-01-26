import {IListener} from '../../interfaces/IListener';
import {IDialog} from '../../models/Dialog.model';

import DeleteMessageEvent from '../events/DeleteMessage.event';
import {io} from '../../ws/';


const wsDeleteMessageListener: IListener = async (event: DeleteMessageEvent) => {
	const deleteMessage = event.getDeletedMessage(),
		populatedDeleteMsg = deleteMessage.populate('dialog');

	await populatedDeleteMsg.execPopulate();

	//send to socket
	(populatedDeleteMsg.dialog as any as IDialog).participants.map(({user}) => {
		if(user.toString() != deleteMessage.author.toString())
			io.to(user.toString()).emit('deleteMessage', deleteMessage.id);
	});
};

export default wsDeleteMessageListener;
