import Subscription, {ISubscriptionData} from '../models/Subscription.model';


class SubscriptionRepository{
	async create(data: ISubscriptionData){
		return Subscription.create(data);
	}

	async updateById(id: string, data: Partial<ISubscriptionData>){
		return Subscription.findByIdAndUpdate(id, data);
	}

	async updateByToken(token: string, data: Partial<ISubscriptionData>){
		return Subscription.updateOne({token}, data);
	}

	async deleteByToken(token: string){
		return Subscription.deleteOne({token});
	}

	async getValidForUser(userID: string){
		return Subscription.find({user: userID, expires: {$lte: new Date()}});
	}

	async getByToken(token: string){
		return Subscription.findOne({token});
	}
}

export default new SubscriptionRepository();
