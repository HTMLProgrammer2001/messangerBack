import {Socket} from 'socket.io';


const disconnectCallListener = (socket: Socket, to: string) => {
	socket.to(to).emit('disconnectCall', socket.user.id);
};

export default disconnectCallListener;
