import {IRule} from '../../interfaces/IRule';
import {IUser} from '../../models/User.model';
import {PartRoles} from '../../constants/PartRoles';

import MessageRepository from '../../repositories/Message.repository';
import DialogRepository from '../../repositories/Dialog.repository';


const deleteMessageRule: IRule = async (me: IUser, messageID: string) => {
	const msg = await MessageRepository.getById(messageID),
		part = await DialogRepository.getParticipant(msg?.dialog.toString(), me.id);

	const isActive = !part?.banTime;
	const canDelete = part?.role <= PartRoles.ADMIN || msg.author.toString() == me.id;

	return isActive && canDelete;
};

export default deleteMessageRule;
