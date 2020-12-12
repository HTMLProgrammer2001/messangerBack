import {Request, Response} from 'express';


type ILoginRequest = Request<{}, {}, {phone: string}>
type ISignInRequest = Request<{}, {}, {phone: string, email?: string, nickname: string, name: string}>
type IConfirmRequest = Request<{}, {}, {code: string}>
type IMeRequest = Request<{id: number}, {}>

class UserActionsController{
	signIn(req: ISignInRequest, res: Response){

	}

	login(req: ILoginRequest, res: Response){

	}

	confirm(req: IConfirmRequest, res: Response){

	}

	logout(req: Request, res: Response){

	}

	me(req: IMeRequest, res: Response){
		res.json({name: 'Hi'});
	}
}

export default new UserActionsController();
