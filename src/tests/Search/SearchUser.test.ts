import st from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../../app';
import resetDB from '../resetDB';

import UserRepository from '../../repositories/User.repository';
import TokenRepository from '../../repositories/Token.repository';

import {IUserData} from '../../models/User.model';


describe('Test search user', () => {
	let tokens = ['12345678', '23456789'],
		userData: IUserData[] = [
			{nickname: 'test', name: 'Test', phone: '+380666876892'},
			{nickname: 'user', name: 'Test2', phone: '+380506564229'}
		];

	beforeAll(async done => {
		await resetDB();

		//create data
		await Promise.all(userData.map(async (d, i) => {
			const user = await UserRepository.create(d);
			await TokenRepository.createToken({user: user.id, token: tokens[i]});

			return user._id;
		}));

		done();
	});

	jest.setTimeout(30000);

	it('Test success user search', async done => {
		const token = await jwt.sign({token: tokens[0]}, <string>process.env.JWT_SECRET);

		//make api call
		st(app)
			.get(`/users/nickname/${userData[1].nickname}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect(res => {
				expect(res.body).toMatchObject({
					message: 'User was found',
					user: userData[1]
				})
			})
			.end(done);
	});

	it('Test not authorized user search', async done => {
		st(app)
			.get(`/users/nickname/${userData[1].nickname}`)
			.expect(401)
			.end(done);
	});

	it('Test search of not exists user', async done => {
		const token = await jwt.sign({token: tokens[0]}, <string>process.env.JWT_SECRET);

		st(app)
			.get('/users/nickname/notFound')
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect({
				message: 'User with this nickname are not exists',
				user: null
			})
			.end(done);
	});
});
