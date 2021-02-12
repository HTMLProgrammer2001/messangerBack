import {IRule} from '../../interfaces/IRule';
import {IUser} from '../../models/User.model';
import {PartRoles} from '../../constants/PartRoles';

import MessageRepository from '../../repositories/Message.repository';
import DialogRepository from '../../repositories/Dialog.repository';


const deleteMessageRule: IRule = async (me: IUser, messageID: string) => {
	const msg = await MessageRepository.getById(messageID),
		part = await DialogRepository.getParticipant(msg.dialog.toString(), me.id);

	return part.role <= PartRoles.ADMIN || msg.author.toString() != me.id;
};

export default deleteMessageRule;
