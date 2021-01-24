import {Server} from 'socket.io';

import connectListener from './listeners/Connect.listener';


export const connectListeners = (io: Server) => {
	io.on('connection', connectListener);
};
