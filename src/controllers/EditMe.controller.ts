import {Request, Response} from 'express';
import {Schema} from "mongoose";

import {IAuthRequest} from '../interfaces/IAuthRequest';
import {CodeTypes} from '../constants/CodeTypes';
import sendCode from '../helpers/sendCode';

import UserRepository from '../repositories/User.repository';
import CodeRepository from '../repositories/Code.repository';
import User, {IUserData} from '../models/User.model';
import StorageService from '../services/StorageService';


type IChangePhoneRequest = Request<{}, {}, {oldPhone: string, newPhone: string}>
type IConfirmChangeRequest = Request<{}, {}, {oldCode: string, newCode: string}>
type IEditMeRequest = IAuthRequest & Request<{}, {}, {
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
		if(!req.user)
			return res.sendStatus(403);

		const {name, description, nickname} = req.body,
			newDoc: Partial<IUserData> = {};

		//parse data to change
		if(name)
			newDoc['name'] = name;

		if(description)
			newDoc['description'] = description;

		if(nickname)
			newDoc['nickname'] = nickname;

		if(req.file) {
			if(req.user?.avatar)
				await StorageService.remove(req.user.avatar);

			newDoc['avatar'] = await StorageService.upload(req.file);
		}

		//update user and return new
		await req.user.updateOne(newDoc);
		const user = await User.findById(req.user._id);

		return res.json({
			message: 'User was edited',
			newUser: user
		});
	}

	async deleteAvatar(req: IAuthRequest, res: Response){
		if(!req.user)
			return res.sendStatus(403);

		//show error if has not avatar
		if(!req.user.avatar)
			return res.status(422).json({
				message: 'This user has not avatar'
			});

		//delete file
		await StorageService.remove(req.user.avatar);

		//update user in DB
		await req.user.updateOne({avatar: null});
		const user = await User.findById(req.user._id);

		return res.json({
			message: 'Avatar was deleted',
			newUser: user
		});
	}
}

export default new EditMeController();
