import {Request, Response} from 'express';

import UsersRepository from '../repositories/User.repository';


type IGetUserRequest = Request<{nickname: string}>

class UsersController{
	async getUser(req: IGetUserRequest, res: Response){
		const nickname = req.params.nickname,
			user = await UsersRepository.getByNick(nickname);

		if(!user) {
			return res.status(200).json({
				message: 'User with this nickname are not exists',
				user: null
			});
		}
		else{
			return res.status(200).json({
				message: 'User was found',
				user
			});
		}
	}
}

export default new UsersController();
