import {Socket} from 'socket.io';


const acceptListener = (socket: Socket, peerID: string, withUser: string) => {
	socket.to(withUser).emit('acceptCall', peerID);
};

export default acceptListener;
