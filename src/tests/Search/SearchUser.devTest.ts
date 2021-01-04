import st from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../../app';
import resetDB from '../resetDB';
import UserRepository from '../../repositories/User.repository';

import {IUserData} from '../../models/User.model';


describe('Test search user', () => {
	let userData: IUserData[] = [
			{nickname: 'test', name: 'Test', phone: '+380666876892', sessionCode: '12345678'},
			{nickname: 'user', name: 'Test2', phone: '+380506564229', sessionCode: '87654321'}
		];

	beforeAll(async done => {
		await resetDB();

		//create data
		await Promise.all(userData.map(async d => {
			const user = await UserRepository.create(d);
			return user._id;
		}));

		done();
	});

	jest.setTimeout(30000);

	it('Test success user search', async done => {
		const token = await jwt.sign({
			session: userData[0].sessionCode,
			expires: Date.now() + 300000
		}, <string>process.env.JWT_SECRET);

		//make api call
		st(app)
			.get(`/users/${userData[1].nickname}`)
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
			.get(`/users/${userData[1].nickname}`)
			.expect(401)
			.end(done);
	});

	it('Test search of not exists user', async done => {
		const token = await jwt.sign({
			session: userData[0].sessionCode,
			expires: Date.now() + 300000
		}, <string>process.env.JWT_SECRET);

		st(app)
			.get('/users/notFound')
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect({
				message: 'User with this nickname are not exists',
				user: null
			})
			.end(done);
	});
});
