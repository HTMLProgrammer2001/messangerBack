import st from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../../app';
import resetDB from '../resetDB';
import {IUserData} from '../../models/User.model';
import {DialogTypes} from '../../constants/DialogTypes';
import {MessageTypes} from '../../constants/MessageTypes';

import UserRepository from '../../repositories/User.repository';
import TokenRepository from '../../repositories/Token.repository';
import DialogRepository from '../../repositories/Dialog.repository';
import MessageRepository from '../../repositories/Message.repository';


describe('Test search by name', () => {
	let userData: IUserData[] = [
		{nickname: 'test', name: 'Test', phone: '+380666876892'},
		{nickname: 'user', name: 'Yura', phone: '+380506564229'},
		{nickname: 'udemy', name: 'User', phone: '+380980765432'}
	],
		tokens = ['12345678', '23456789', '34567890'];

	beforeAll(async done => {
		//reset DB
		await resetDB();

		//create users
		const userIDs = await Promise.all(userData.map(async (d, i) => {
			const user = await UserRepository.create(d);
			await TokenRepository.createToken({user: user.id, token: tokens[i]});

			return user._id;
		}));

		//create dialogs
		await DialogRepository.create({type: DialogTypes.PERSONAL, participants: [
			{user: userIDs[0]}, {user: userIDs[1]}
		]});

		await DialogRepository.create({type: DialogTypes.PERSONAL, participants: [
			{user: userIDs[1]}, {user: userIDs[2]}
		]});

		const dialog = await DialogRepository.create({type: DialogTypes.PERSONAL, participants: [
			{user: userIDs[0]}, {user: userIDs[2]}
		]});

		//create message
		const message = await MessageRepository.create({
			type: MessageTypes.MESSAGE,
			time: new Date(),
			message: 'Text',
			dialog: dialog._id,
			author: userIDs[0]
		});

		await DialogRepository.update(dialog.id, {lastMessage: message._id});

		done();
	});

	jest.setTimeout(30000);

	it('Test success search', async done => {
		//create token
		const jwtToken = await jwt.sign({token: tokens[0]}, <string>process.env.JWT_SECRET);

		//make api call
		st(app)
			.get('/dialogs/name')
			.query({name: 'u'})
			.set('Authorization', `Bearer ${jwtToken}`)
			.expect(200)
			.expect(res => {
				expect(res.body).toMatchObject({
					message: 'Dialogs found',
					total: 2,
					totalPages: 1,
					pageSize: 5
				});

				expect(res.body.data).toHaveLength(2);

				//check correct dialogs and order
				expect(res.body.data[0]).toMatchObject({name: userData[2].name});
				expect(res.body.data[0].lastMessage).toBeTruthy();

				expect(res.body.data[1]).toMatchObject({name: userData[1].name});
			})
			.end(done);
	});

	it('Test search unauthorized', async done => {
		//make api call
		st(app)
			.get('/dialogs/nickname')
			.query({name: 'u'})
			.expect(401)
			.end(done);

		done();
	});

	it('Test not found', async done => {
		const jwtToken = await jwt.sign({token: tokens[0]}, <string>process.env.JWT_SECRET);

		//make api call
		st(app)
			.get('/dialogs/name')
			.query({name: 'notFound'})
			.set('Authorization', `Bearer ${jwtToken}`)
			.expect(200)
			.expect(res => {
				expect(res.body).toMatchObject({
					message: 'Dialogs not found', pageSize: 5,
					total: 0, totalPages: 0, data: []
				});
			})
			.end(done);
	});
});
