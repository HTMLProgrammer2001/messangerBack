import {Request, Response} from 'express';

import UsersRepository from '../repositories/User.repository';


type IGetUserRequest = Request<{nickname: string}>
type IBanUserRequest = Request<{}, {}, {id: any}>

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

	async banUser(req: IBanUserRequest, res: Response){
		const user = await UsersRepository.getById(req.body.id);

		if(!user)
			return res.status(404).json({message: 'No user with this id'});

		return res.json({message: 'User banned'})
	}
}

export default new UsersController();
