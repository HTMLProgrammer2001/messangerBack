import Nexmo from 'nexmo';

import {INotify} from './INotify';


class NexmoService implements INotify{
	private nexmo: Nexmo;
	private readonly from: string;

	constructor(){
		this.nexmo = new Nexmo({
			apiKey: <string>process.env.NEXMO_API,
			apiSecret: <string>process.env.NEXMO_SECRET
		});

		this.from = <string>process.env.FROM;
	}

	notify(to: string, text: string, opts?: Record<string, any>): Promise<string>{
		//promisify
		return new Promise((resolve, reject) => {
			this.nexmo.message.sendSms(this.from, to, text, {}, (err, response) => {
				//show error
				if(err)
					reject(err);

				if(response.messages[0].status != '0')
					reject(response.messages[0].status);

				//success status
				resolve(response.messages[0].status as string);
			});
		});
	}

	notifyLogin(to: string, code: string){
		const message = `It's your login code: ${code}. Don't show it to nobody!!!`;
		return this.notify(to, message);
	}

	notifyChange(to: string, code: string){
		const message = `It's your change phone code: ${code}. Don't show it nobody`;
		return this.notify(to, message);
	}

	notifySignIn(to: string, code: string) {
		const message = `It's your sign in code: ${code}. Don't show it nobody`;
		return this.notify(to, message);
	}
}

export default new NexmoService();
