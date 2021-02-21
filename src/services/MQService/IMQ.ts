import {IPushMessage} from '../../interfaces/IPushMessage';


export interface IMQ{
	connect(): Promise<void>;
	sendMessage(to: string, pushMessage: IPushMessage, type: string, id: string): Promise<any>
}
