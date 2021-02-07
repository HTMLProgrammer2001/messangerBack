import {IUser} from '../models/User.model';

import GroupResource from './GroupResource';
import UserResource from './UserResource';


class UsersGroupResource extends GroupResource<IUser>{
	async apply(item: IUser){
		const message = new UserResource(item, this.userID);
		await message.json();
		return message.toJSON();
	}
}

export default UsersGroupResource;
