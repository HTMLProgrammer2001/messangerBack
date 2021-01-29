import {Socket} from 'socket.io';

import UserRepository from '../../repositories/User.repository';
import disconnectListener from './Disconnect.listener';
import setStatusListener from './SetStatus.listener';
import viewMessagesListener from './ViewMessages.listener';
import sendListener from './Send.listener';
import acceptListener from './Accept.listener';
import disconnectCallListener from './DisconnectCall.listener';


const connectListener = async (socket: Socket) => {
	console.log(`Connected ${socket.user.id}`);

	//update user
	await UserRepository.update(socket.user._id, {isOnline: true});

	//send to sockets
	socket.broadcast.emit('online', socket.user.id);
	socket.user.isOnline = true;

	//handlers
	socket.on('disconnecting', disconnectListener.bind(null, socket));
	socket.on('changeDialogStatus', setStatusListener.bind(null, socket));
	socket.on('viewMessages', viewMessagesListener.bind(null, socket));
	socket.on('sendCall', sendListener.bind(null, socket));
	socket.on('acceptCall', acceptListener.bind(null, socket));
	socket.on('disconnectCall', disconnectCallListener.bind(null, socket));
};

export default connectListener;
