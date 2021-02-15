import {IUser} from '../../models/User.model';
import DialogRepository from '../../repositories/Dialog.repository';
import {PartRoles} from '../../constants/PartRoles';


const changeGroupRule = async (me: IUser, dialogID: string) => {
	const part = await DialogRepository.getParticipant(dialogID, me.id);
	return part && !part.banTime && part.role <= PartRoles.ADMIN;
};

export default changeGroupRule;
