import {IUser} from '../models/User.model';
import Resource from './Resource';
import UserRepository from '../repositories/User.repository';


class UserResource extends Resource<IUser>{
	async getData(): Promise<Object> {
		const curUser = await UserRepository.getById(this.userID);

		return {
			_id: this.data._id,
			avatar: this.data.avatar,
			name: this.data.name,
			nickname: this.data.nickname,
			phone: this.data.phone,
			description: this.data.description,
			isBanned: curUser?.banned.includes(this.data._id),
			isOnline: this.data.isOnline,
			lastSeen: this.data.lastSeen
		};
	}
}

export default UserResource;
