import st from 'supertest';
import Mocked = jest.Mocked;

import {CodeTypes} from '../../constants/CodeTypes';
import UserRepository from '../../repositories/User.repository';
import resetDB from '../resetDB';
import sendCode from '../../helpers/sendCode';
import app from '../../app';


//mock modules
jest.mock('../../helpers/sendCode', () => ({
	__esModule: true,
	default: jest.fn()
}));

const mockedSend = sendCode as Mocked<typeof sendCode>;

describe('Test sign in', () => {
	const userData = {
		nickname: 'Test',
		name: 'Name',
		phone: '+380997645334'
	};

	beforeEach(async (done) => {
		await resetDB();
		jest.clearAllMocks();

		done();
	});

	jest.setTimeout(30000);

	it('Test success sign in', async done => {
		//test route call
		await st(app)
			.post('/sign')
			.send(userData)
			.expect(200)
			.expect({message: 'Verify code that was sent in your phone'});

		//test user create
		const user = await UserRepository.getByPhone(userData.phone);

		expect(user).toBeTruthy();
		expect(user).toMatchObject(userData);

		//test send call
		expect(mockedSend).toHaveBeenCalledTimes(1);
		expect(mockedSend).toHaveBeenCalledWith(userData.phone, CodeTypes.SIGNIN, user?._id);

		done();
	});

	it('Test sign in with empty data', () => {
		return st(app)
			.post('/sign')
			.send({})
			.expect(422)
			.expect(res => {
				expect(res.body).toMatchObject({
					errors: [{param: 'name'}, {param: 'nickname'}, {param: 'phone'}]
				});
			})
	});

	it('Test sign in for exists but unverified user', async done  => {
		await UserRepository.create(userData);

		//test sign route
		await st(app)
			.post('/sign')
			.send(userData)
			.expect(200)
			.expect({message: 'User already exists but not verified'});

		done();
	});

	it('Test sign in with exists nick', async done => {
		await UserRepository.create(userData);

		const newPhone = '+380990739657';

		//make api call
		st(app)
			.post('/sign')
			.send({...userData, phone: newPhone})
			.expect(422)
			.expect({
				errors: [{
					msg: 'Model with same nickname already exists',
					param: 'nickname',
					location: 'body',
					value: userData.nickname
				}]
			}, done);
	});

	it('Test sign in with exists phone', async done => {
		const user = await UserRepository.create(userData);
		await user.updateOne({verified: true});

		const newNick = 'Nick2';

		//make api call
		st(app)
			.post('/sign')
			.send({...userData, nickname: newNick})
			.expect(422)
			.expect({message: 'User with this phone already signed in'}, done);
	});
});
