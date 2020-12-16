import Nexmo from 'nexmo';


class NexmoService{
	private nexmo: Nexmo;
	private readonly from: string;

	constructor(){
		this.nexmo = new Nexmo({
			apiKey: <string>process.env.NEXMO_API,
			apiSecret: <string>process.env.NEXMO_SECRET
		});

		this.from = <string>process.env.FROM;
	}

	sendMessage(to: string, text: string){
		if(process.env.NODE_ENV != 'production') {
			console.log(text);
			return Promise.resolve({to, text});
		}

		//promisify
		return new Promise((resolve, reject) => {
			this.nexmo.message.sendSms(this.from, to, text, {}, (err, response) => {
				//show error
				if(err)
					reject(err);

				if(response.messages[0].status != '0')
					reject(response.messages[0].status);

				//success status
				resolve(response.messages[0].status);
			});
		});
	}

	sendLoginMessage(to: string, code: number | string){
		const message = `It's your login code: ${code}. Don't show it to nobody!!!`;
		return this.sendMessage(to, message);
	}

	sendSignInMessage(to: string, code: number | string) {
		const message = `It's your sign in code: ${code}. Don't show it nobody`;
		return this.sendMessage(to, message);
	}
}

export default new NexmoService();
