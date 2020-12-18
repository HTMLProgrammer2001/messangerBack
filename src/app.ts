import express, {NextFunction, Request, Response, Errback, Application} from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import passport from 'passport';
import cors from 'cors';

dotenv.config();

import rootRouter from './routes/';
import {connect} from './db';
import './passport';
import updateSeenMiddleware from './middlewares/updateSeen.middleware';
import logInWithoutRedirect from './middlewares/logInWithoutRedirect.middleware';


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
		res.status(500);
		res.json({error: err});
	}
	else
		next();
});

//not found handler
app.use((req: Request, res: Response, next: NextFunction) => {
	res.sendStatus(404);
});

async function start() {
	await connect(process.env.MONGO_URL);

	const PORT = process.env.PORT || 5000;

	//start server
	app.listen(PORT, () => {
		console.log(`App is running on ${PORT} port`);
	});
}

start();
