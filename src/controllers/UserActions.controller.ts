import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';

import User, {IUser} from '../models/User.model';
import Code from '../models/Code.model';
import generateCode from '../helpers/codeGenerator';
import nexmoService from '../services/Nexmo.service';
import {CodeTypes} from '../constants/CodeTypes';
import codeGenerator from '../helpers/codeGenerator';
import {IAuthRequest} from '../interfaces/IAuthRequest';


type ILoginRequest = Request<{}, {}, {phone: string}>
type ISignInRequest = Request<{}, {}, {phone: string, email?: string, nickname: string, name: string}>
type IConfirmRequest = Request<{}, {}, {code: string}>
type ILogoutRequest = IAuthRequest;

class UserActionsController{
	async signIn(req: ISignInRequest, res: Response){

	}

	async login(req: ILoginRequest, res: Response){
		//search user
		const user = await User.findOne({phone: req.body.phone});

		if(!user) {
			//send error
			return res.status(422).json({
				message: 'Error data',
				errors: {
					phone: 'No user with this phone'
				}
			});
		}

		//create code
		let code = new Code({
			code: generateCode(),
			expires: Date.now() + parseInt(process.env.CODE_TTL || ''),
			type: CodeTypes.LOGIN,
			user: user._id
		});

		await code.save();

		//send message
		try {
			await nexmoService.sendLoginMessage(user.phone, code.code);
			res.json({message: 'Verify code that was sent in your phone'});
		}
		catch (e) {
			res.status(500).json({
				message: 'Error in send message to your number'
			});
		}
	}

	async confirm(req: IConfirmRequest, res: Response){
		//search login code
		const code = await Code.findOne({code: req.body.code, type: CodeTypes.LOGIN});

		if(!code) {
			//show error
			return res.status(422).json({
				message: 'Error in data',
				errors: {
					code: 'This code is invalid'
				}
			});
		}

		//update user token
		const populatedCode = await code.populate('user').execPopulate();
		populatedCode.user.sessionCode = codeGenerator(12);

		await populatedCode.user.save();
		await populatedCode.remove();

		//parse JWT token
		const jwtToken = await jwt.sign({
			sessionCode: populatedCode.user.sessionCode,
			expires: Date.now() + parseInt(process.env.TOKEN_TTL || '0')
		}, <string>process.env.JWT_SECRET);

		res.json({
			message: 'Login successfully',
			token: jwtToken
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
}

export default new UserActionsController();
