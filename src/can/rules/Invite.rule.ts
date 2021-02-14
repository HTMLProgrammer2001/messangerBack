import UserRepository from '../../repositories/User.repository';
import DialogRepository from '../../repositories/Dialog.repository';

import {IRule} from '../../interfaces/IRule';
import {IUser} from '../../models/User.model';
import {BanType} from '../../constants/BanType';


const inviteRule: IRule = async (me: IUser, userID: string, dialogID = '') => {
	const user = await UserRepository.getById(userID);

	if(user?.banned.includes(me._id))
		return false;

	if(!dialogID)
		return true;

	const part = await DialogRepository.getParticipant(dialogID, userID);

	if(part && part.banType == BanType.LEAVE)
		return false;

	return true;
};

export default inviteRule;
