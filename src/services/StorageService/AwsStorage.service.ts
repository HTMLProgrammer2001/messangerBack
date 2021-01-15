import AWS, {S3} from 'aws-sdk';
import multer from 'multer';
import {ManagedUpload} from 'aws-sdk/clients/s3';
import {NextFunction, Request, Response} from 'express';

import {IFile, IStorage} from './IStorage';
import codeGenerator from '../../helpers/codeGenerator';


class StorageService implements IStorage {
	private awsInstance: S3;

	constructor() {
		this.awsInstance = new AWS.S3({
			accessKeyId: process.env.AWS_ACCESS_KEY,
			secretAccessKey: process.env.AWS_SECRET_KEY
		});
	}

	getMiddleware(field: string, isSingle: boolean = true, destination: string = ''){
		const storage = multer.memoryStorage(),
			uploader = multer({storage});

		return [
			isSingle ? uploader.single(field) : uploader.array(field),
			(req: Request, res: Response, next: NextFunction) => {
				req.file.destination = destination;
				next();
			}
		];
	}

	async upload(file: IFile): Promise<string> {
		return new Promise((resolve, reject) => {
			const fileExt = file.originalname.split('.').slice(-1)[0],
				newFileName = [codeGenerator(24), fileExt].join('.');

			const params = {
				Bucket: <string>process.env.AWS_BUCKET,
				Key: newFileName,
				Body: file.buffer
			};

			this.awsInstance.upload(params, (err: Error, data: ManagedUpload.SendData) => {
				if (err)
					reject(err);

				resolve(data.Location);
			});
		});
	}

	async remove(url: string): Promise<boolean>{
		const fileName = url.split('/').slice(-1)[0];

		const params = {
			Key: fileName,
			Bucket: <string>process.env.AWS_BUCKET,
		};

		return new Promise((resolve, reject) => {
			this.awsInstance.deleteObject(params, (err) => {
				if(err)
					reject(err.message);
				else
					resolve(true);
			});
		});
	}
}

export default new StorageService();
