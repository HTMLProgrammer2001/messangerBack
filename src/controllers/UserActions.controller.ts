import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';

import User, {IUser, IUserData} from '../models/User.model';
import UserRepository from '../repositories/User.repository';
import CodeRepository from '../repositories/Code.repository';
import StorageService from '../services/StorageService';
import codeGenerator from '../helpers/codeGenerator';
import sendCode from '../helpers/sendCode';
import {CodeTypes} from '../constants/CodeTypes';
import {IAuthRequest} from '../interfaces/IAuthRequest';


type ILoginRequest = Request<{}, {}, {phone: string}>
type ISignInRequest = Request<{}, {}, {phone: string, nickname: string, name: string}>
type IConfirmLoginRequest = Request<{}, {}, {code: string}>
type IConfirmSignRequest = Request<{}, {}, {code: string}>
type IResendRequest = Request<{}, {}, {type: CodeTypes, phone: string}>
type ILogoutRequest = IAuthRequest
type IEditMeRequest = IAuthRequest & Request<{}, {}, {
	phone: string,
	nickname: string,
	name: string,
	avatar?: Buffer,
	description?: string
}>

class UserActionsController{
	async signIn(req: ISignInRequest, res: Response){
		const {phone, nickname, name} = req.body;

		//get user
		let user = await UserRepository.getByPhone(phone);

		if(user && !user.verified)
			return res.json({message: 'User already exists but not verified'});
		else if(user)
			return res.status(422).json({message: 'User with this phone already signed in'});

		//create user
		user = await UserRepository.create({phone, nickname, name});

		//send code
		try {
			await sendCode(user.phone, CodeTypes.SIGNIN, user._id);
			res.json({message: 'Verify code that was sent in your phone'});
		}
		catch (e) {
			res.status(500).json({
				message: 'Error in send message to your number'
			});
		}
	}

	async login(req: ILoginRequest, res: Response){
		//search user
		const user = await UserRepository.getByPhone(req.body.phone);

		if(!user || !user.verified)
			return res.status(422);

		//send code
		try {
			await sendCode(user.phone, CodeTypes.LOGIN, user._id);
			res.json({message: 'Verify code that was sent in your phone'});
		}
		catch (e) {
			res.status(500).json({
				message: 'Error in send message to your number'
			});
		}
	}

	async confirmSign(req: IConfirmSignRequest, res: Response){
		//search login code
		const code = await CodeRepository.findByCodeAndType(req.body.code, CodeTypes.SIGNIN);

		if(!code)
			return res.sendStatus(422);

		//get code user
		const populatedCode = await code.populate('user').execPopulate(),
			user = populatedCode.user as IUser;

		//verify him
		user.verified = true;
		await user.save();

		//remove code
		await CodeRepository.removeCode(code._id);

		//return response
		return res.json({
			message: 'Sign confirmed successfully',
			user
		});
	}

	async confirmLogin(req: IConfirmLoginRequest, res: Response){
		//search login code
		const code = await CodeRepository.findByCodeAndType(req.body.code, CodeTypes.LOGIN);

		if(!code)
			return res.status(422).json({message: 'This code is invalid'});

		if(+code.expires < Date.now())
			return res.status(422).json({message: 'Code expires'});

		//update user token
		const populatedCode = await code.populate('user').execPopulate(),
			user = populatedCode.user as IUser;

		user.sessionCode = codeGenerator(12);

		await user.save();
		await populatedCode.remove();

		//generate JWT token
		const jwtToken = await jwt.sign({
			sessionCode: user.sessionCode,
			expires: Date.now() + parseInt(process.env.TOKEN_TTL || '0')
		}, <string>process.env.JWT_SECRET);

		//return token
		return res.json({
			message: 'Login successfully',
			token: jwtToken,
			user
		});
	}

	async resend(req: IResendRequest, res: Response){
		//validate code type
		if(req.body.type in CodeTypes){
			//validate user exists
			const user = await UserRepository.getByPhone(req.body.phone);

			if(!user)
				return res.status(422).json({message: 'No user with this phone'});

			await sendCode(req.body.phone, req.body.type, user._id);

			//return successfully message
			return res.json({
				message: 'Code was successfully resend'
			});
		}
		else
			res.status(422).json({message: 'Incorrect type'});
	}

	async logout(req: ILogoutRequest, res: Response){
		if(req.user) {
			//logout user
			req.user.sessionCode = undefined;
			await req.user.save();

			return res.json({message: 'You were successfully logged out'})
		}

		//show 403 error
		return res.status(403).json({message: 'Unauthorized'});
	}

	async me(req: Request, res: Response){
		return res.json(req.user);
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

export default new UserActionsController();
