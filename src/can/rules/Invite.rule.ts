import UserRepository from '../../repositories/User.repository';

import {IRule} from '../../interfaces/IRule';
import {IUser} from '../../models/User.model';


const inviteRule: IRule = async (me: IUser, userID: string) => {
	const user = await UserRepository.getById(userID);
	return user?.banned.includes(me._id);
};

export default inviteRule;
