import DialogRepository from '../../repositories/Dialog.repository';

import {IUser} from '../../models/User.model';
import {PartRoles} from '../../constants/PartRoles';


const deleteGroupRule = async (me: IUser, dialogID: string) => {
	const participant = await DialogRepository.getParticipant(dialogID, me.id);
	return participant?.role == PartRoles.OWNER;
};

export default deleteGroupRule;
