import {param, body} from 'express-validator';

import existsCustomValidator from '../validators/exists.validator';
import User from '../../models/User.model';


export const getUserValidators = [
	param('nickname').isString().withMessage('Nickname must be string')
];

export const banUserValidators = [
	body('id').isString().withMessage('User id must be string')
		.custom(existsCustomValidator(User, '_id')).withMessage('No user with this id')
];
