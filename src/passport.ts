import {Strategy as BearerStrategy} from 'passport-http-bearer';
import passport from 'passport';
import jwt from 'jsonwebtoken'

import User from './models/User.model';


passport.use(new BearerStrategy(async (token, done) => {
	try {
		type IJWTData = {sessionCode: string, expires: number};
		const {expires, sessionCode} = jwt.verify(token, <string>process.env.JWT_SECRET) as IJWTData;

		//check token expire
		if(expires < Date.now())
			return done('Token expires');

		//find user
		const user = await User.findOne({sessionCode});

		//if user not found than null
		if(!user)
			done(false, null);

		//auth user
		done(false, user, {scope: 'all'});
	}
	catch(e){
		//error
		done(e);
	}
}));
