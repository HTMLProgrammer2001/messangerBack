import {Socket} from 'socket.io';

const disconnectListener = (socket: Socket) => {
	console.log(`Disconnect ${socket.id}`);
};

export default disconnectListener;
