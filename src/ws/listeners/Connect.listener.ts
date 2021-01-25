import {Socket} from 'socket.io';
import disconnectListener from './Disconnect.listener';


const connectListener = (socket: Socket) => {
	console.log(`Connected ${socket.user.id}`);
	socket.on('disconnected', disconnectListener);
};

export default connectListener;
