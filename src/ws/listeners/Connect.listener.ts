import {Socket} from 'socket.io';

import UserRepository from '../../repositories/User.repository';
import disconnectListener from './Disconnect.listener';
import setStatusListener from './SetStatus.listener';


const connectListener = async (socket: Socket) => {
	console.log(`Connected ${socket.user.id}`);

	//update user
	await UserRepository.update(socket.user._id, {isOnline: true});

	//send to sockets
	socket.broadcast.emit('online', socket.user.id);

	//handlers
	socket.on('disconnecting', disconnectListener.bind(null, socket));
	socket.on('changeDialogStatus', setStatusListener.bind(null, socket));
};

export default connectListener;
