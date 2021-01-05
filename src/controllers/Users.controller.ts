import {Request, Response} from 'express';

import UsersRepository from '../repositories/User.repository';


type IGetUserRequest = Request<{nickname: string}>

class UsersController{
	async getUser(req: IGetUserRequest, res: Response){
		const nickname = req.params.nickname,
			user = await UsersRepository.getByNick(nickname);

		if(!user || user.id == req.user?.id) {
			return res.json({message: 'User with this nickname are not exists', user: null});
		}
		else{
			return res.json({message: 'User was found', user});
		}
	}
}

export default new UsersController();
