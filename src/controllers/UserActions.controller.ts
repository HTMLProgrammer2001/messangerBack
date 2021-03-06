import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';

import {CodeTypes} from '../constants/CodeTypes';

import UserRepository from '../repositories/User.repository';
import TokenRepository from '../repositories/Token.repository';
import CodeRepository from '../repositories/Code.repository';
import UserResource from '../resources/UserResource';
import codeGenerator from '../helpers/codeGenerator';
import sendCode from '../helpers/sendCode';


type ILoginRequest = Request<{}, {}, {phone: string}>
type ISignInRequest = Request<{}, {}, {phone: string, nickname: string, name: string}>
type IConfirmLoginRequest = Request<{}, {}, {code: string}>
type IConfirmSignRequest = Request<{}, {}, {code: string}>
type IResendRequest = Request<{}, {}, {type: CodeTypes, phone: string}>
type ILogoutRequest = Request

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
			res.status(500).json({message: 'Error in send message to your number'});
		}
	}

	async login(req: ILoginRequest, res: Response){
		//search user
		const user = await UserRepository.getByPhone(req.body.phone);

		if(!user || !user.verified)
			return res.status(422).json({
				message: 'User with this phone not exists or unverified'
			});

		//send code
		try {
			await sendCode(user.phone, CodeTypes.LOGIN, user._id);
			res.json({message: 'Verify code that was sent to your phone'});
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

		//verify him
		await UserRepository.update(code.user, {verified: true});

		//log in user
		const token = codeGenerator(12);
		await TokenRepository.createToken({token, user: code.user});

		const user = await UserRepository.getById(code.user),
			resource = new UserResource(user, req.user?._id);

		await resource.json();

		//remove code
		await CodeRepository.removeCode(code._id);

		//generate JWT token
		const jwtToken = await jwt.sign({token}, <string>process.env.JWT_SECRET);

		//return response
		return res.json({
			message: 'Sign confirmed successfully',
			token: jwtToken, user: resource
		});
	}

	async confirmLogin(req: IConfirmLoginRequest, res: Response){
		//search login code
		const code = await CodeRepository.findByCodeAndType(req.body.code, CodeTypes.LOGIN);

		if(!code)
			return res.status(422).json({message: 'This code is invalid'});

		//update db
		const token = codeGenerator(12);
		await TokenRepository.createToken({user: code.user, token});
		await CodeRepository.removeCode(code._id);

		const user = await UserRepository.getById(code.user),
			resource = new UserResource(user, req.user?._id);

		await resource.json();

		//generate JWT token
		const jwtToken = await jwt.sign({token}, <string>process.env.JWT_SECRET);

		//return token
		return res.json({
			message: 'Login successfully',
			token: jwtToken, user: resource
		});
	}

	async resend(req: IResendRequest, res: Response){
		//validate code type
		if(req.body.type in CodeTypes){
			//validate user exists
			let user = await UserRepository.getByPhone(req.body.phone),
				userID = user?._id;

			//for change phone search user in code
			if(!userID && req.body.type == CodeTypes.CHANGE_PHONE) {
				const code = await CodeRepository.findByPhoneAndType(req.body.phone, CodeTypes.CHANGE_PHONE);

				if(code[0])
					userID = code[0].user;
			}

			//show error
			if(!userID)
				return res.status(422).json({message: 'No user with this phone'});

			await sendCode(req.body.phone, req.body.type, userID);

			//return successfully message
			return res.json({message: 'Code was successfully resend'});
		}
		else
			return res.status(422).json({message: 'Incorrect type'});
	}

	async logout(req: ILogoutRequest, res: Response){
		if(req.user) {
			//logout user
			await TokenRepository.removeByToken(req.user.currentToken);
			return res.json({message: 'You were successfully logged out'})
		}

		//show 403 error
		return res.status(403).json({message: 'Unauthorized'});
	}

	async me(req: Request, res: Response){
		if(!req.user)
			return res.json(null);

		//create resource
		const userData = new UserResource(req.user, req.user._id);
		await userData.json();

		return res.json(userData.toJSON());
	}
}

export default new UserActionsController();

