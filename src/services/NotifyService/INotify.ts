export interface INotify{
	notify(to: string, message: string, opts?: Record<string, any>): Promise<string>;
	notifyLogin(to: string, code: string): Promise<string>;
	notifySignIn(to: string, code: string): Promise<string>;
	notifyChange(to: string, code: string): Promise<string>;
}
