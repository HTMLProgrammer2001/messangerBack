import {Response, NextFunction} from 'express';

import {IAuthRequest} from '../interfaces/IAuthRequest';


const updateSeenMiddleware = async (req: IAuthRequest, res: Response, next: NextFunction) => {
	if(req.user)
		await req.user.updateOne({lastSeen: new Date()});

	next();
};

export default updateSeenMiddleware;
