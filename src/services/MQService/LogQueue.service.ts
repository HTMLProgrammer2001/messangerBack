import {IMQ} from './IMQ';
import {IPushMessage} from '../../interfaces/IPushMessage';


class LogQueueService implements IMQ{
	async connect(): Promise<void> {}

	async sendMessage(to: string, pushMessage: IPushMessage, type: string): Promise<any> {
		console.log({to, data: pushMessage});
	}
}

export default new LogQueueService();
