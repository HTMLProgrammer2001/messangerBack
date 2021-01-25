import {Strategy as BearerStrategy} from 'passport-http-bearer';
import passport from 'passport';
import jwt from 'jsonwebtoken'

import UserRepository from './repositories/User.repository';
import TokenRepository from './repositories/Token.repository';


export const auth = async (jwtToken: string, done: Function) => {
	try {
		type IJWTData = {token: string};
		const {token} = jwt.verify(jwtToken, <string>process.env.JWT_SECRET) as IJWTData,
			tokenObj = await TokenRepository.findByToken(token);

		//check token exists
		if(!tokenObj)
			return done('Token not exists');

		//check token expires
		if(+tokenObj.expires < Date.now())
			return done('Token expires');

		//find user
		const user = await UserRepository.getById(tokenObj.user);

		//if user not found than null
		if(!user)
			done(false, null);

		//auth user
		user.currentToken = token;
		done(false, user, {scope: 'all'});
	}
	catch(e){
		//error
		done(e);
	}
};

passport.use(new BearerStrategy(auth));
