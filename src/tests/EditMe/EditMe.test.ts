import st from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../../app';
import UserRepository from '../../repositories/User.repository';
import resetDB from '../resetDB';


describe('Test edit me', () => {
	const userData = {
			nickname: 'Test',
			name: 'Name',
			phone: '+380997645334',
			sessionCode: '123456'
		},
		newUserData = {
			nickname: 'newNick',
			name: 'newName'
		};

	beforeEach(async done => {
		await resetDB();
		jest.clearAllMocks();

		done();
	});

	jest.setTimeout(30000);

	it('Should return 403 error on unauthorized call', async done => {
		//make api call
		st(app)
			.post('/me')
			.expect(401, done);
	});

	it('Test success edit', async done => {
		//create data
		const user = await UserRepository.create(userData),
			token = await jwt.sign({
				sessionCode: userData.sessionCode,
				expires: Date.now() + 3000000
			}, <string>process.env.JWT_SECRET);

		//make api call
		st(app)
			.post('/me')
			.send(newUserData)
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect(res => {
				expect(res.body).toMatchObject({
					message: 'User was edited',
					newUser: {_id: user.id, ...newUserData}
				});
			})
			.end(done);
	});
});
