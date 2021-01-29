import {Socket} from 'socket.io';

import UserRepository from '../../repositories/User.repository';
import UserResource from '../../resources/UserResource';


const sendListener = async (socket: Socket, userID: string) => {
	const user = await UserRepository.getById(userID as any);

	if(user.banned.includes(userID))
		return;

	///make resource
	const userResource = new UserResource(socket.user, userID);
	await userResource.json();

	socket.to(userID).emit('receiveCall', userResource);
};

export default sendListener;
