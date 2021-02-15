import {Request, Response} from 'express';
import {Types} from 'mongoose';

import DialogRepository from '../repositories/Dialog.repository';
import MessageRepository from '../repositories/Message.repository';
import UserRepository from '../repositories/User.repository';

import {DialogTypes} from '../constants/DialogTypes';
import {PartRoles} from '../constants/PartRoles';
import {MessageTypes} from '../constants/MessageTypes';
import NewDialogEvent from '../observer/events/NewDialog.event';
import NewMessageEvent from '../observer/events/NewMessage.event';
import DialogResource from '../resources/DialogResource';

import {dispatch} from '../observer';
import gate from '../can';
import StorageService from '../services/StorageService';


type IGroupCreateRequest = Request<{}, {}, {participants: string[], name: string}>
type IGetParticipantsRequest = Request<{}, {}, {}, {dialog: string}>
type IChangeAdminRequest = Request<{}, {}, {dialog: string, user: string}>
type IDeleteGroupRequest = Request<{id: string}, {}, {}, {}>
type ILeaveGroupRequest = Request<{}, {}, {dialog: string}>
type IBanRequest = Request<{}, {}, {dialog: string, user: string}>
type IInviteRequest = Request<{}, {}, {dialog: string, users: string[]}>
type IChangeAvatarRequest = Request<{id: string}>
type IChangeTitleRequest = Request<{id: string}, {}, {title: string}>

class GroupActionsController{
	async create(req: IGroupCreateRequest, res: Response){
		const {participants, name} = req.body;
		const {user} = req;

		//validate input
		if(participants.length < 2 || !name)
			return res.status(422).json({message: 'Invalid input'});

		const canInviteUsers = await Promise.all(participants.map(
			(userID) => gate.can('invite', user, userID)
		));

		if(!canInviteUsers.every(e => e))
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
			message: 'Dialog start',
			time: new Date()
		});

		dialog = await DialogRepository.update(dialog._id, {lastMessage: msg._id});

		//make resource
		const dlgResource = new DialogResource(dialog, user._id);
		await dlgResource.json();

		//send events
		dispatch(new NewDialogEvent(dialog, req.user._id).broadcast());

		//return response
		return res.json({
			message: 'Group created',
			dialog: dlgResource
		});
	}

	async changeTitle(req: IChangeTitleRequest, res: Response){
		const dialog = await DialogRepository.getDialogById(req.params.id),
			{user} = req,
			{title} = req.body;

		if(!await gate.can('changeGroup', user, req.params.id))
			return res.status(403).json({message: 'Only admins can change group options'});

		await DialogRepository.update(new Types.ObjectId(req.params.id), {
			groupOptions: {...dialog.groupOptions, title}
		});

		//new message
		const msg = await MessageRepository.create({
			author: user._id, dialog: dialog._id, type: MessageTypes.SPECIAL,
			message: `New title is ${title}`, time: new Date()
		});

		//send ws
		dispatch(new NewMessageEvent(msg, user._id).broadcast());
		return res.json({message: 'Title was changed'});
	}

	async deleteAvatar(req: IChangeAvatarRequest, res: Response){
		const dialog = await DialogRepository.getDialogById(req.params.id),
			{user} = req;

		if(!await gate.can('changeGroup', user, req.params.id))
			return res.status(403).json({message: 'Only admins can change group options'});

		if(!dialog.groupOptions?.avatar)
			return res.status(404).json({message: 'No avatar for dialog'});

		//update dialog
		await DialogRepository.update(new Types.ObjectId(req.params.id), {
			groupOptions: {...dialog.groupOptions, avatar: null}
		});

		//new message
		const msg = await MessageRepository.create({
			author: user._id, dialog: dialog._id, type: MessageTypes.SPECIAL,
			message: 'Avatar deleted', time: new Date()
		});

		//send ws
		dispatch(new NewMessageEvent(msg, user._id).broadcast());
		return res.json({message: 'Avatar deleted'});
	}

	async changeAvatar(req: IChangeAvatarRequest, res: Response){
		const dialog = await DialogRepository.getDialogById(req.params.id),
			{user} = req;

		if(!await gate.can('changeGroup', user, req.params.id))
			return res.status(403).json({message: 'Only admins can change group options'});

		if(!req.file)
			return res.status(422).json({message: 'No file'});

		//upload new avatar
		if(dialog.groupOptions?.avatar)
			await StorageService.remove(dialog.groupOptions.avatar);

		const avatar = await StorageService.upload(req.file);

		//update dialog
		await DialogRepository.update(new Types.ObjectId(req.params.id), {
			groupOptions: {...dialog.groupOptions, avatar}
		});

		//new message
		const msg = await MessageRepository.create({
			author: user._id, dialog: dialog._id,
			type: MessageTypes.SPECIAL, message: 'Avatar changed', time: new Date()
		});

		//send ws
		dispatch(new NewMessageEvent(msg, user._id).broadcast());
		return res.json({message: 'Avatar changed'});
	}

	async deleteGroup(req: IDeleteGroupRequest, res: Response){
		if(!await gate.can('deleteGroup', req.user, req.params.id))
			return res.status(403).json({message: 'Only owner can perform this action'});

		//create message
		const msg = await MessageRepository.create({
			type: MessageTypes.SPECIAL,
			dialog: Types.ObjectId(req.params.id), author: req.user.id,
			message: 'Group deleted',
			time: new Date()
		});

		await DialogRepository.deleteGroup(req.params.id);

		//send event to websocket
		dispatch(new NewMessageEvent(msg, req.user.id).broadcast());
		return res.json({message: 'Dialog successfully deleted'});
	}

	async invite(req: IInviteRequest, res: Response){
		const {dialog: dialogID, users} = req.body;

		//check that we can invite all users
		const canInvites = await Promise.all(users.map(userID =>
			gate.can('invite', userID, dialogID))
		);

		if(!canInvites.every(i => i))
			return res.status(403).json({message: 'You cannot invite one or more users'});

		//add users
		for(let userID of users){
			const part = await DialogRepository.getParticipant(dialogID, userID),
				user = await UserRepository.getById(userID);

			if(part && !part.banTime)
				continue;

			if(part)
				await DialogRepository.updateParticipant(dialogID, userID, {banType: 0, banTime: null});
			else
				await DialogRepository.addParticipant(dialogID, userID);

			//create message
			const msg = await MessageRepository.create({
				type: MessageTypes.SPECIAL,
				dialog: Types.ObjectId(dialogID), author: req.user.id,
				message: `Invited ${user.name}`,
				time: new Date()
			});

			//send to websocket
			dispatch(new NewMessageEvent(msg, user._id).broadcast());
		}

		return res.json({message: 'Invited'});
	}

	async leave(req: ILeaveGroupRequest, res: Response){
		//check data
		const canLeave = await gate.can('leave', req.user, req.body.dialog);

		if(!canLeave)
			return res.status(422).json({message: 'Owner can not leave dialog'});

		//create message
		const msg = await MessageRepository.create({
			type: MessageTypes.SPECIAL,
			dialog: Types.ObjectId(req.body.dialog), author: req.user.id,
			message: `${req.user.name} leaved`,
			time: new Date()
		});

		//leave
		await DialogRepository.leave(req.body.dialog, req.user.id);

		//send event to websocket
		dispatch(new NewMessageEvent(msg, req.user.id).broadcast());
		return res.json({message: 'You successfully leave dialog'});
	}

	async ban(req: IBanRequest, res: Response){
		const part = await DialogRepository.getParticipant(req.body.dialog, req.body.user);

		if(!part || part.banTime)
			return res.status(422).json({message: 'No participant'});

		const canBan = await gate.can('ban', req.user, req.body.user, req.body.dialog);

		if(!canBan)
			return res.status(403).json({message: 'You can not ban this user'});

		//create message
		const msg = await MessageRepository.create({
			type: MessageTypes.SPECIAL,
			dialog: Types.ObjectId(req.body.dialog), author: req.user.id,
			message: `${part.user.name} banned`,
			time: new Date()
		});

		await DialogRepository.ban(req.body.dialog, req.body.user);

		//send event to websocket
		dispatch(new NewMessageEvent(msg, req.user.id).broadcast());
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

		if(!userPart || userPart.banTime)
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
			message: `${userPart.user.name} ${isUpgrade ? 'upgraded to admin' : 'downgraded to user'}`,
			time: new Date()
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

		if(!userPart || userPart.banTime)
			return res.status(404).json({message: 'No user in dialog'});

		//update participant
		await DialogRepository.updateParticipant(dialog, user, {role: PartRoles.OWNER});
		await DialogRepository.updateParticipant(dialog, req.user.id, {role: PartRoles.ADMIN});

		//create message
		const msg = await MessageRepository.create({
			type: MessageTypes.SPECIAL,
			dialog: Types.ObjectId(dialog), author: req.user.id,
			message: `${userPart.user.name} is owner now`,
			time: new Date()
		});

		//send event to websocket
		dispatch(new NewMessageEvent(msg, req.user.id).broadcast());
		return res.json({message: 'Participant role was changed'});
	}

	async getParticipants(req: IGetParticipantsRequest, res: Response){
		const {dialog} = req.query,
			participants = await DialogRepository.getParticipants(dialog.toString());

		const activeParticipants = participants.filter(part => !part.banTime);
		return res.json({message: 'Participants for dialog', participants: activeParticipants});
	}
}

export default new GroupActionsController();
