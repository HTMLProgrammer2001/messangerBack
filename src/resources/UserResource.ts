import Resource from './Resource';
import {IUser} from '../models/User.model';


class UserResource extends Resource<IUser>{
	getData(): Object {
		return {
			_id: this.data._id,
			avatar: this.data.avatar,
			name: this.data.name,
			nickname: this.data.nickname,
			phone: this.data.phone,
			description: this.data.description
		};
	}
}

export default UserResource;
