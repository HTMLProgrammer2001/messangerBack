import st from 'supertest';
import jwt from 'jsonwebtoken';
import Mocked = jest.Mocked;

import StorageService from '../../services/StorageService/';
import UserRepository from '../../repositories/User.repository';
import app from '../../app';
import resetDB from '../resetDB';


//mocks
jest.mock('../../services/StorageService/', () => ({
	__esModule: true,
	default: {
		getMiddleware: () => (req: any, res: any, next: any) => next(),
		remove: jest.fn(() => Promise.resolve(true))
	}
}));

const mockedStorage = StorageService as Mocked<typeof StorageService>;

describe('Test avatar delete', () => {
	const session = '123456',
		avatarPath = '/avatars/test.jpg',
		avatarPathURL =  process.env.APP_URL + avatarPath,
		userData = {
			nickname: 'Test',
			name: 'Name',
			phone: '+380997645334',
			sessionCode: session
		};

	beforeEach(async done => {
		await resetDB();
		jest.clearAllMocks();

		done();
	});

	jest.setTimeout(30000);

	it('Test deleting unauthorized', async done => {
		st(app)
			.delete('/avatar')
			.expect(401, done);
	});

	it('Test deleting for user without avatar', async done => {
		const user = await UserRepository.create(userData),
			token = await jwt.sign({
				sessionCode: session,
				expires: Date.now() + 3000000
			}, <string>process.env.JWT_SECRET);

		st(app)
			.delete('/avatar')
			.set('Authorization', `Bearer ${token}`)
			.expect(422)
			.expect({message: 'This user has not avatar'})
			.end(done);
	});

	it('Test success avatar deleting', async done => {
		const user = await UserRepository.create({
			...userData,
			avatar: avatarPathURL
		});

		const token = await jwt.sign({
			sessionCode: session,
			expires: Date.now() + 3000000
		}, <string>process.env.JWT_SECRET);

		//make api call
		await st(app)
			.delete('/avatar')
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect(res => {
				expect(res.body).toMatchObject({
					message: 'Avatar was deleted',
					newUser: {_id: user.id, avatar: null}
				})
			});

		//test remove call
		expect(mockedStorage.remove).toHaveBeenCalledTimes(1);
		expect(mockedStorage.remove).toBeCalledWith(avatarPathURL);

		done();
	});
});
