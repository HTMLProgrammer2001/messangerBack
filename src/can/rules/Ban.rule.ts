import {IRule} from '../../interfaces/IRule';
import {IUser} from '../../models/User.model';

import DialogRepository from '../../repositories/Dialog.repository';


const banRule: IRule = async (me: IUser, user: string, dialog: string) => {
	const userPart = await DialogRepository.getParticipant(dialog, user),
		mePart = await DialogRepository.getParticipant(dialog, me.id);

	return mePart && userPart && mePart.role < mePart.role;
};

export default banRule;
