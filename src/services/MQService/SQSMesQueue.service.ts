import {SQS} from 'aws-sdk';

import {IMQ} from './IMQ';
import {IPushMessage} from '../../interfaces/IPushMessage';


class SQSMesQueueService implements IMQ {
	private sqs: SQS;
	private queueURL: string = null;

	async connect() {
		this.sqs = new SQS({
			accessKeyId: process.env.AWS_ACCESS_KEY,
			secretAccessKey: process.env.AWS_SECRET_KEY,
			region: process.env.AWS_REGION,
			apiVersion: '2012-11-05'
		});

		const queueResult = await this.sqs.getQueueUrl({
			QueueName: process.env.QUEUE_NAME,
			QueueOwnerAWSAccountId: process.env.ACCOUNT_ID
		}).promise();

		this.queueURL = queueResult.QueueUrl;
	}

	async sendMessage(to: string, msg: IPushMessage, type: string, id: string){
		return this.sqs.sendMessage({
			QueueUrl: this.queueURL,
			MessageBody: JSON.stringify(msg),
			MessageGroupId: id,
			MessageAttributes: {
				To: {DataType: 'String', StringValue: to},
				Type: {DataType: 'String', StringValue: type}
			}
		}).promise();
	}
}

export default new SQSMesQueueService();
