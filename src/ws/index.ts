import {Server as HTTPServer} from 'http';
import {RedisClient} from 'redis';
import {createAdapter} from 'socket.io-redis';
import {Server} from 'socket.io';

import {connectListeners} from './connectListeners';
import {auth} from '../passport';
import {IUser} from '../models/User.model';


export let io: Server;

export const startWebsocket = async (http: HTTPServer) => {
	//connect to redis and socket io
	io = new Server(http, {cors: {origin: '*'}});

	//set auth middleware
	io.use(async (socket, next) => {
		const done = (error: string, user: IUser) => {
			if(error || !user)
				next(new Error(error || 'No user'));
			else {
				socket.user = user;
				socket.join(user.id);

				next();
			}
		};

		//@ts-ignore
		await auth(socket.handshake.query['Token'], done);
	});

	//add redis adapter
	if(process.env.MODE == 'multi') {
		let client = new RedisClient({host: process.env.REDIS_URL, port: +process.env.REDIS_PORT});
		io.adapter(createAdapter({pubClient: client, subClient: client.duplicate()}));
	}

	//connect listeners
	connectListeners(io);
};
