import {Socket} from 'socket.io';
import disconnectListener from './Disconnect.listener';


const connectListener = (socket: Socket) => {
	console.log(`Connected ${socket.id}`);
	let count = 0;

	socket.on('disconnected', disconnectListener);

	setInterval(() =>{
		socket.emit('message', ++count);
	}, 1000);
};

export default connectListener;
