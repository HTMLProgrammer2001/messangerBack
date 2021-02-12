import DialogRepository from '../../repositories/Dialog.repository';

import {IUser} from '../../models/User.model';
import {PartRoles} from '../../constants/PartRoles';


const leaveRule = async (me: IUser, dialogID: string) => {
	const participant = await DialogRepository.getParticipant(dialogID, me.id);

	//check data
	if(!participant || participant.role == PartRoles.OWNER)
		return false;

	return true;
};

export default leaveRule;
