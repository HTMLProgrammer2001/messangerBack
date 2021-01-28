import {Socket} from 'socket.io';

import MessageRepository from '../../repositories/Message.repository';


const ViewMessagesListener = async (socket: Socket, ids: string[]) => (
	Promise.all(ids.map(async id => {
		const msg = await MessageRepository.readFor(id, socket.user.id);
		socket.to(msg.author.toString()).emit('viewMessages', [id]);
	}))
);

export default ViewMessagesListener;
