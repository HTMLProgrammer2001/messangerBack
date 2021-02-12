import {Request, Response} from 'express';
import {Types} from 'mongoose';

import DialogRepository from '../repositories/Dialog.repository';
import MessageRepository from '../repositories/Message.repository';

import {DialogTypes} from '../constants/DialogTypes';
import {PartRoles} from '../constants/PartRoles';
import {MessageTypes} from '../constants/MessageTypes';
import NewDialogEvent from '../observer/events/NewDialog.event';
import NewMessageEvent from '../observer/events/NewMessage.event';
import DialogResource from '../resources/DialogResource';

import {dispatch} from '../observer';
import gate from '../can';


type IGroupCreateRequest = Request<{}, {}, {participants: string[], name: string}>
type IGetParticipantsRequest = Request<{}, {}, {}, {dialog: string}>
type IChangeAdminRequest = Request<{}, {}, {dialog: string, user: string}>
type IDeleteGroupRequest = Request<{id: string}, {}, {}, {}>
type ILeaveGroupRequest = Request<{}, {}, {dialog: string}>
type IBanRequest = Request<{}, {}, {dialog: string, user: string}>

class GroupActionsController{
	async create(req: IGroupCreateRequest, res: Response){
		const {participants, name} = req.body;
		const {user} = req;

		//validate input
		if(participants.length < 2 || !name)
			return res.status(422).json({message: 'Invalid input'});

		const canInviteUsers = await Promise.all(participants.map(
			(userID) => gate.can('invite', userID)
		));

		if(canInviteUsers.every(e => e))
			return res.status(403).json({message: 'You are banned by one or more users'});

		//parse participants
		const parsedParticipants = [
			...participants.map(id => ({user: Types.ObjectId(id), role: PartRoles.USER})),
			{user: req.user._id as Types.ObjectId, role: PartRoles.OWNER}
		];

		//create dialog
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

	async deleteGroup(req: IDeleteGroupRequest, res: Response){
		if(!await gate.can('deleteGroup', req.user, req.params.id))
			return res.status(403).json({message: 'Only owner can perform this action'});

		await DialogRepository.deleteGroup(req.params.id);
		return res.json({message: 'Dialog successfully deleted'});
	}

	async invite(){

	}

	async leave(req: ILeaveGroupRequest, res: Response){
		//check data
		const canLeave = await gate.can('leave', req.user, req.body.dialog);

		if(!canLeave)
			return res.status(422).json({message: 'Owner can not leave dialog'});

		//leave
		await DialogRepository.leave(req.body.dialog, req.user.id);

		//create message
		const msg = await MessageRepository.create({
			type: MessageTypes.SPECIAL,
			dialog: Types.ObjectId(req.body.dialog), author: req.user.id,
			message: `${req.user.name} leaved`
		});

		//send event to websocket
		dispatch(new NewMessageEvent(msg, req.user.id).broadcast());
		return res.json({message: 'You successfully leave dialog'});
	}

	async ban(req: IBanRequest, res: Response){
		return res.json({message: 'You successfully banned user'});
	}

	async changeAdmin(req: IChangeAdminRequest, res: Response){
		//get data
		const {dialog, user} = req.body,
			myPart = await DialogRepository.getParticipant(dialog, req.user.id),
			userPart = await DialogRepository.getParticipant(dialog, user);

		//check data
		if(!myPart || myPart.role != PartRoles.OWNER)
			return res.status(403).json({message: 'Only owner can perform this action'});

		if(!userPart)
			return res.status(404).json({message: 'No user in dialog'});

		const isUpgrade = userPart.role == PartRoles.USER;

		//update participant
		await DialogRepository.updateParticipant(dialog, user, {
			role: isUpgrade ? PartRoles.ADMIN : PartRoles.USER
		});

		//create message
		const msg = await MessageRepository.create({
			type: MessageTypes.SPECIAL,
			dialog: Types.ObjectId(dialog), author: req.user.id,
			message: `${userPart.user.name} ${isUpgrade ? 'upgraded to admin' : 'downgraded to user'}`
		});

		//send event to websocket
		dispatch(new NewMessageEvent(msg, req.user.id).broadcast());
		return res.json({message: 'Participant role was changed'});
	}

	async changeOwner(req: IChangeAdminRequest, res: Response){
		//get data
		const {dialog, user} = req.body,
			myPart = await DialogRepository.getParticipant(dialog, req.user.id),
			userPart = await DialogRepository.getParticipant(dialog, user);

		//check data
		if(!myPart || myPart.role != PartRoles.OWNER)
			return res.status(403).json({message: 'Only owner can perform this action'});

		if(!userPart)
			return res.status(404).json({message: 'No user in dialog'});

		//update participant
		await DialogRepository.updateParticipant(dialog, user, {role: PartRoles.OWNER});
		await DialogRepository.updateParticipant(dialog, req.user.id, {role: PartRoles.ADMIN});

		//create message
		const msg = await MessageRepository.create({
			type: MessageTypes.SPECIAL,
			dialog: Types.ObjectId(dialog), author: req.user.id,
			message: `${userPart.user.name} is owner now`
		});

		//send event to websocket
		dispatch(new NewMessageEvent(msg, req.user.id).broadcast());
		return res.json({message: 'Participant role was changed'});
	}

	async getParticipants(req: IGetParticipantsRequest, res: Response){
		const {dialog} = req.query,
			participants = await DialogRepository.getParticipants(dialog.toString());

		return res.json({message: 'Participants for dialog', participants});
	}
}

export default new GroupActionsController();
