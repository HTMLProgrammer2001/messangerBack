import {Socket} from 'socket.io';

import UserRepository from '../../repositories/User.repository';


const disconnectListener = async (socket: Socket) => {
	console.log(`Disconnect ${socket.user.id}`);

	//update user
	await UserRepository.update(socket.user._id, {
		isOnline: false,
		lastSeen: new Date()
	});

	//send to sockets
	socket.broadcast.emit('offline', socket.user.id);
};

export default disconnectListener;
