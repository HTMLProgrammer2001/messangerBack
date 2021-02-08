import {Request, Response} from 'express';
import {Types} from 'mongoose';

import DialogRepository from '../repositories/Dialog.repository';
import UserRepository from '../repositories/User.repository';
import MessageRepository from '../repositories/Message.repository';

import {DialogTypes} from '../constants/DialogTypes';
import {PartRoles} from '../constants/PartRoles';
import {MessageTypes} from '../constants/MessageTypes';
import NewDialogEvent from '../observer/events/NewDialog.event';
import DialogResource from '../resources/DialogResource';

import {dispatch} from '../observer';


type IGroupCreateRequest = Request<{}, {}, {participants: string[], name: string}>

class GroupActionsController{
	async create(req: IGroupCreateRequest, res: Response){
		const {participants, name} = req.body;
		const {user} = req;

		if(participants.length < 2 || !name)
			return res.status(422).json({message: 'Invalid input'});

		const bannedUsers = await Promise.all(participants.map(async userID => {
			const user = await UserRepository.getById(userID);
			return user?.banned.includes(req.user.id);
		}));

		if(bannedUsers.some(e => e))
			return res.status(403).json({message: 'You are banned by one or more users'});

		const parsedParticipants = [
			...participants.map(id => ({user: Types.ObjectId(id), role: PartRoles.USER})),
			{user: req.user._id as Types.ObjectId, role: PartRoles.ADMIN}
		];

		let dialog = await DialogRepository.create({
			participants: parsedParticipants,
			type: DialogTypes.CHAT,
			groupOptions: {title: name}
		});

		//create message
		const msg = await MessageRepository.create({
			author: user._id,
			dialog: dialog._id,
			type: MessageTypes.SPECIAL,
			message: 'Dialog start'
		});

		dialog = await DialogRepository.update(dialog._id, {lastMessage: msg._id});

		//make resource
		const dlgResource = new DialogResource(dialog, user._id);
		await dlgResource.json();

		//send events
		dispatch(new NewDialogEvent(dialog, req.user._id));

		//return response
		return res.json({
			message: 'Group created',
			dialog: dlgResource
		});
	}

	async changeTitle(){

	}

	async changeAvatar(){

	}

	async deleteGroup(){

	}

	async invite(){

	}

	async leave(){

	}

	async ban(){

	}

	async toggleAdmin(){

	}

	async getParticipants(){

	}
}

export default new GroupActionsController();
