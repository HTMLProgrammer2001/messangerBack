import {body, param, query} from 'express-validator';

import User from '../../models/User.model';
import existsCustomValidator from '../validators/exists.validator';



export const getDialogsByNickValidators = [
	query('nickname').optional().isString().withMessage('Nickname must be a string').bail(),
	query('page').optional().isInt().withMessage('Page must be a number'),
	query('pageSize').optional().isInt().withMessage('Page size must be a number')
];

export const getDialogsByNameValidators = [
	query('name').optional().isString().withMessage('Name must be a string').bail(),
	query('page').optional().isInt().withMessage('Page must be a number'),
	query('pageSize').optional().isInt().withMessage('Page size must be a number')
];

export const getDialogValidators = [
	param('nickn' +
		'ame').isLength({min: 4, max: 32}).withMessage('Nickname must be from 4 to 32 chars').bail()
		.custom(existsCustomValidator(User, 'nickname')).withMessage('No dialogs with this nickname')
];
