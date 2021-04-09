import express, {NextFunction, Request, Response, Errback, Application} from 'express';
import {createServer} from 'http';
import bodyParser from 'body-parser';
import passport from 'passport';
import cors from 'cors';

import './passport';
import './initEnv';
import './can/initRules';

import rootRouter from './routes/';
import {connect} from './db';
import {startWebsocket} from './ws';
import updateSeenMiddleware from './middlewares/updateSeen.middleware';
import logInWithoutRedirect from './middlewares/logInWithoutRedirect.middleware';
import mqService from './services/MQService/';


const app: Application = express();

//middleware
app.use(<any>cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(express.static(__dirname + '/static'));

app.use(logInWithoutRedirect, updateSeenMiddleware);

//set router
app.use('/', rootRouter);

//error handler
app.use((err: Errback, req: Request, res: Response, next: NextFunction) => {
	if(err) {
		console.dir(err);
		res.status(500);
		res.json({error: err.name, message: JSON.stringify(err)});
	}
	else
		next();
});

//not found handler
app.use((req: Request, res: Response, next: NextFunction) => {
	res.sendStatus(404);
});

async function start() {
	const http = createServer(app),
		PORT = process.env.PORT || 5000;

	await connect(process.env.MONGO_URL);
	await startWebsocket(http);
	await mqService.connect();

	//start server
	if(!process.env.APP_ENV || !process.env.APP_ENV.includes('testing')){
		http.listen(+PORT, '192.168.0.150', 511, () => {
			console.log(`App is running on ${PORT} port`);
		});
	}
}

start();

export default app;
