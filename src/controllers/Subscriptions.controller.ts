import {Request, Response} from 'express';

import SubscriptionRepository from '../repositories/Subscription.repository';
import TokenRepository from '../repositories/Token.repository';


type ISetSubsRequest = Request<{}, {}, {push: any}>

class SubscriptionsController {
	async setSubs(req: ISetSubsRequest, res: Response){
		const token = req.user.currentToken,
			subs = await SubscriptionRepository.getByToken(token),
			push = req.body;

		const tokenModel = await TokenRepository.findByToken(token);

		if(subs)
			await SubscriptionRepository.updateByToken(token, {push});
		else
			await SubscriptionRepository.create({token, push, user: req.user.id, expires: tokenModel.expires});

		return res.json({message: 'Successfully set'});
	}
}

export default new SubscriptionsController();
