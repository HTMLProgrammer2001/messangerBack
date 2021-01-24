import {Server as HTTPServer} from 'http';
import {RedisClient} from 'redis';
import {createAdapter} from 'socket.io-redis';
import {Server} from 'socket.io';
import {connectListeners} from './connectListeners';


export let io: Server;

export const startWebsocket = async (http: HTTPServer) => {
	//connect to redis and socket io
	io = new Server(http, {cors: {origin: '*'}});

	//add redis adapter
	if(process.env.MODE == 'multi') {
		let client = new RedisClient({host: process.env.REDIS_URL, port: +process.env.REDIS_PORT});
		io.adapter(createAdapter({pubClient: client, subClient: client.duplicate()}));
	}

	//connect listeners
	connectListeners(io);
};
