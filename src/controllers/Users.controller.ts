import {Request, Response} from 'express';

import UsersRepository from '../repositories/User.repository';
import UserResource from '../resources/UserResource';

import {dispatch} from '../observer';
import BanEvent from '../observer/events/Ban.event';
import UsersGroupResource from '../resources/UsersGroupResource';


type IGetUserRequest = Request<{ nickname: string }>
type IBanUserRequest = Request<{}, {}, { id: any }>
type IGetFriendsByName = Request<{}, {}, {name: string, page: number, pageSize: number}>
type IGetFriendsByNick = Request<{}, {}, {nick: string, page: number, pageSize: number}>

class UsersController {
	async getUser(req: IGetUserRequest, res: Response) {
		const nickname = req.params.nickname,
			user = await UsersRepository.getByNick(nickname);

		if (!user || user.id == req.user?.id)
			return res.json({message: 'User with this nickname are not exists', user: null});

		//make resource
		const resource = new UserResource(user, req.user?._id);
		await resource.json();

		return res.json({message: 'User was found', user: resource});
	}

	async banUser(req: IBanUserRequest, res: Response) {
		const user = await UsersRepository.getById(req.body.id);

		//show error if no user
		if (!user)
			return res.status(404).json({message: 'No user with this id'});

		//update user
		req.user.banned.includes(user._id) ? await UsersRepository.update(req.user._id, {
				banned: req.user.banned.filter(id => id != user.id)
			}) :
			await UsersRepository.update(req.user._id, {banned: [...req.user.banned, user.id]});

		//dispatch event
		dispatch(new BanEvent(user._id, req.user._id));

		//make resource
		const resource = new UserResource(user, req.user?._id);
		await resource.json();

		return res.json({message: 'User ban toggled', newUser: resource.toJSON()})
	}

	async getFriendsByName(req: IGetFriendsByName, res: Response){
		//get data
		const {name, page, pageSize} = req.query,
			{_id} = req.user;

		const parsedPage = +page || 1,
			parsedPageSize = +pageSize || 5;

		//make query to db
		const friends = await UsersRepository.getFriendsByFieldFor(_id, {
			field: 'name',
			val: (name || '') as string,
			page: parsedPage, pageSize: parsedPageSize
		});

		//create resource
		const resource = new UsersGroupResource(friends, req.user.id);
		await resource.json();

		return res.status(200).json({data: friends, page, pageSize});
	}

	async getFriendsByNick(req: IGetFriendsByNick, res: Response){
		//get data
		const {nick, page, pageSize} = req.query,
			{_id} = req.user;

		const parsedPage = +page || 1,
			parsedPageSize = +pageSize || 5;

		//make query to db
		const friends = await UsersRepository.getFriendsByFieldFor(_id, {
			field: 'nickname',
			val: (nick || '') as string,
			page: parsedPage, pageSize: parsedPageSize
		});

		//create resource
		const resource = new UsersGroupResource(friends, req.user.id);
		await resource.json();

		return res.status(200).json({data: friends, page: parsedPage, pageSize: parsedPageSize});
	}
}

export default new UsersController();
