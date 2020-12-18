import AWS, {S3} from 'aws-sdk';
import codeGenerator from '../helpers/codeGenerator';
import {ManagedUpload} from 'aws-sdk/clients/s3';


class StorageService {
	private awsInstance: S3;

	constructor() {
		this.awsInstance = new AWS.S3({
			accessKeyId: process.env.AWS_ACCESS_KEY,
			secretAccessKey: process.env.AWS_SECRET_KEY
		});
	}

	async upload(file: { filename: string }): Promise<ManagedUpload.SendData> {
		return new Promise((resolve, reject) => {
			const fileExt = file.filename.split('.').slice(-1)[0],
				newFileName = [codeGenerator(24), fileExt].join('.');

			const params = {
				Bucket: <string>process.env.AWS_BUCKET,
				Key: newFileName
			};

			this.awsInstance.upload(params, (err: Error, data: ManagedUpload.SendData) => {
				if (err)
					reject(err);

				resolve(data);
			});
		});
	}
}

export default new StorageService();
