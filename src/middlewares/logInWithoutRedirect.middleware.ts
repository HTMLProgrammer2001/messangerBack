import {NextFunction, Request, Response} from 'express';
import {authenticate} from 'passport';

import {IUser} from '../models/User.model';


const logInWithoutRedirect = (req: Request, res: Response, next: NextFunction) => {
	return authenticate('bearer', (err: string, user: IUser) => {
		//return without user
		if(!user)
			return next();

		//login user
		return req.logIn(user, (err) => {
			req.user = user;
			return next();
		});
	})(req, res, next);
};

export default logInWithoutRedirect;
