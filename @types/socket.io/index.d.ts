import {IUser} from '../../src/models/User.model';


declare module "socket.io"{
	interface Socket {
		user: IUser
	}
}
