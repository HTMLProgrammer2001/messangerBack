import {NextFunction, Request, Response} from 'express';
import {ValidationChain, validationResult} from 'express-validator';


const errorOnInvalid = (validators: ValidationChain[]) => [
	...validators,
	(req: Request, res: Response, next: NextFunction) => {
		//get errors
		const errors = validationResult(req);

		//return errors
		if(!errors.isEmpty())
			return res.status(422).json({
				errors: errors.array()
			});

		//continue on successfully validation
		next();
	}
];

export default errorOnInvalid;
