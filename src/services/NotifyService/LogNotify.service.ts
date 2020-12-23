import {INotify} from './INotify';


class LogNotifyService implements INotify{
	notify(to: string, message: string, opts?: any): Promise<string> {
		console.log({to, message});
		return Promise.resolve('');
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

export default new LogNotifyService();
