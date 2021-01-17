import {Request, Response} from 'express';

import UsersRepository from '../repositories/User.repository';
import UserResource from '../resources/UserResource';


type IGetUserRequest = Request<{nickname: string}>
type IBanUserRequest = Request<{}, {}, {id: any}>

class UsersController{
	async getUser(req: IGetUserRequest, res: Response){
		const nickname = req.params.nickname,
			user = await UsersRepository.getByNick(nickname);

		if(!user || user.id == req.user?.id)
			return res.json({message: 'User with this nickname are not exists', user: null});
		else{
			const resource = new UserResource(user, req.user?._id);
			await resource.json();

			return res.json({message: 'User was found', user: resource});
		}
	}

	async banUser(req: IBanUserRequest, res: Response){
		const user = await UsersRepository.getById(req.body.id);

		//show error if no user
		if(!user)
			return res.status(404).json({message: 'No user with this id'});

		//update user
		req.user.banned.includes(user._id) ? await UsersRepository.update(req.user._id, {
			banned: req.user.banned.filter(id => id != user.id)
		}) :
			await UsersRepository.update(req.user._id, {banned: [...req.user.banned, user.id]});

		//make resource
		const resource = new UserResource(user, req.user?._id);
		await resource.json();

		return res.json({message: 'User ban toggled', newUser: resource.toJSON()})
	}
}

export default new UsersController();
