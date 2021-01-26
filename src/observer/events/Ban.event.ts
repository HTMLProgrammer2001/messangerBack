import {Types} from 'mongoose';

import {IEvent} from '../../interfaces/IEvent';


class BanEvent implements IEvent{
	constructor(private banUser: Types.ObjectId, private user: Types.ObjectId){}

	getUser(){
		return this.user;
	}

	getBanUser(){
		return this.banUser;
	}

	static getName(){
		return 'banUser';
	}
}

export default BanEvent;
