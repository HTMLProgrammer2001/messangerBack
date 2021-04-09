import {Request, Response} from 'express';
import {Schema} from "mongoose";

import {CodeTypes} from '../constants/CodeTypes';
import sendCode from '../helpers/sendCode';

import UserRepository from '../repositories/User.repository';
import CodeRepository from '../repositories/Code.repository';
import StorageService from '../services/StorageService';


type IChangePhoneRequest = Request<{}, {}, {oldPhone: string, newPhone: string}>
type IConfirmChangeRequest = Request<{}, {}, {oldCode: string, newCode: string}>
type IEditMeRequest = Request<{}, {}, {
	phone: string,
	nickname: string,
	name: string,
	avatar?: Buffer,
	description?: string
}>

class EditMeController{
	async changePhone(req: IChangePhoneRequest, res: Response){
		//get old phone and new phone
		const {oldPhone, newPhone} = req.body;

		//find user in DB
		const user = await UserRepository.getByPhone(oldPhone);

		if(!user)
			return res.sendStatus(422);

		//send code to old and new phone
		await sendCode(oldPhone, CodeTypes.CHANGE_PHONE, user._id);
		await sendCode(newPhone, CodeTypes.CHANGE_PHONE, user._id);

		return res.json({
			message: 'Codes was sent on your old and new phone'
		});
	}

	async confirmChange(req: IConfirmChangeRequest, res: Response){
		//search codes
		const oldCode = await CodeRepository.findByCodeAndType(req.body.oldCode, CodeTypes.CHANGE_PHONE),
			newCode = await CodeRepository.findByCodeAndType(req.body.newCode, CodeTypes.CHANGE_PHONE);

		//check that codes exists
		if(!oldCode || !newCode)
			return res.sendStatus(422);

		//check that it's codes for one user
		if(oldCode.user.toString() != newCode.user.toString())
			return res.status(422).json({
				message: 'Incorrect codes'
			});

		//update user phone
		await UserRepository.update(oldCode.user as Schema.Types.ObjectId, {
			phone: newCode.to
		});

		//remove codes
		await CodeRepository.removeCode(oldCode._id);
		await CodeRepository.removeCode(newCode._id);

		//return response
		return res.json({
			message: 'Phone was changed'
		});
	}

	async editMe(req: IEditMeRequest, res: Response){
		const user = req.user;

		if(!user)
			return res.sendStatus(403);

		let {name = user.name, description = user.description, nickname = user.nickname} = req.body,
			avatar = user.avatar;

		//upload new avatar
		if(req.file) {
			if(user.avatar)
				await StorageService.remove(user.avatar);

			avatar = await StorageService.upload(req.file);
		}

		//update user and return new
		await UserRepository.update(user.id, {name, description, nickname, avatar});
		const newUser = await UserRepository.getById(user._id);

		return res.json({message: 'User was edited', newUser});
	}

	async deleteAvatar(req: Request, res: Response){
		const user = req.user;

		if(!user)
			return res.sendStatus(403);

		//show error if has not avatar
		if(!user.avatar)
			return res.status(422).json({message: 'This user has not avatar'});

		//delete file
		await StorageService.remove(user.avatar);

		//update user in DB
		await UserRepository.update(user._id, {avatar: null});
		const newUser = await UserRepository.getById(user._id);

		return res.json({message: 'Avatar was deleted', newUser});
	}
}

export default new EditMeController();
