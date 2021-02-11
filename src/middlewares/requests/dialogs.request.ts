import {param, query, body} from 'express-validator';

import User from '../../models/User.model';
import Dialog from '../../models/Dialog.model';
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
	param('nickname').isLength({min: 4, max: 32})
		.withMessage('Nickname must be from 4 to 32 chars')
];

export const createPersonalValidators = [
	body('to').isString().withMessage('Not valid id')
		.custom(existsCustomValidator(User, '_id')).withMessage('No user with this id')
];

export const clearDialogValidators = [
	body('user').optional().isString().withMessage('Invalid user id format')
		.custom(existsCustomValidator(User, '_id')).withMessage('No user with this id'),

	body('dialog').optional().isString().withMessage('Invalid dialog id format')
		.custom(existsCustomValidator(Dialog, '_id')).withMessage('No dialog with this id'),
];
