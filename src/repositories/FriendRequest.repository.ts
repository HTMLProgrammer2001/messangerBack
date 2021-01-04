import {Schema} from 'mongoose';

import {IFriendRequestData} from '../models/FriendRequest.model';
import FriendRequest from '../models/FriendRequest.model';


class FriendRequestRepository{
	create(data: IFriendRequestData){
		const friendReq = new FriendRequest(data);
		return friendReq.save();
	}

	confirm(id: Schema.Types.ObjectId){
		return FriendRequest.updateOne({_id: id}, {confirmed: true});
	}
}

export default new FriendRequestRepository();
