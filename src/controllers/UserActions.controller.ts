import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User.model';
import Code from '../models/Code.model';
import codeGenerator from '../helpers/codeGenerator';
import {CodeTypes} from '../constants/CodeTypes';
import {IAuthRequest} from '../interfaces/IAuthRequest';
import sendCode from '../helpers/sendCode';


type ILoginRequest = Request<{}, {}, {phone: string}>
type ISignInRequest = Request<{}, {}, {phone: string, nickname: string, name: string}>
type IConfirmLoginRequest = Request<{}, {}, {code: string}>
type IConfirmSignRequest = Request<{}, {}, {code: string}>
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

		//create user
		const user = new User({
			phone,
			nickname,
			name
		});

		await user.save();

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
		const user = await User.findOne({phone: req.body.phone});

		if(!user)
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
		const code = await Code.findOne({code: req.body.code, type: CodeTypes.SIGNIN});

		if(!code)
			return res.sendStatus(422);

		await code.remove();

		return res.json({
			message: 'Sign confirmed successfully'
		});
	}

	async confirmLogin(req: IConfirmLoginRequest, res: Response){
		//search login code
		const code = await Code.findOne({code: req.body.code, type: CodeTypes.LOGIN});

		if(!code)
			return res.sendStatus(422);

		//update user token
		const populatedCode = await code.populate('user').execPopulate(),
			user = populatedCode.user;

		user.sessionCode = codeGenerator(12);

		await user.save();
		await populatedCode.remove();

		//generate JWT token
		const jwtToken = await jwt.sign({
			sessionCode: populatedCode.user.sessionCode,
			expires: Date.now() + parseInt(process.env.TOKEN_TTL || '0')
		}, <string>process.env.JWT_SECRET);

		//return token
		return res.json({
			message: 'Login successfully',
			token: jwtToken,
			user
		});
	}

	async logout(req: ILogoutRequest, res: Response){
		if(req.user) {
			//logout user
			req.user.sessionCode = undefined;
			await req.user.save();

			res.json({message: 'You were successfully logged out'})
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

		const {phone, name, avatar, description, nickname} = req.body;

		await req.user.updateOne({phone, name, nickname, description});
		const user = await User.findById(req.user._id);

		return res.json({
			message: 'User was edited',
			newUser: user
		});
	}
}

export default new UserActionsController();
