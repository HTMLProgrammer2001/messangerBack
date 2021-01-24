import multer from 'multer';
import fs from 'fs';
import {join} from 'path';
import {NextFunction, Request, Response} from 'express';

import {IFile, IStorage} from './IStorage';
import codeGenerator from '../../helpers/codeGenerator';


class FileSystemStorageService implements IStorage {
	getMiddleware(field: string, isSingle: boolean = true, destination = ''){
		const storage = multer.memoryStorage();
		const uploader = multer({storage});

		return [
			isSingle ? uploader.single(field) : uploader.array(field),
			(req: Request, res: Response, next: NextFunction) => {
				if(req.file)
					req.file.destination = destination;

				next();
			}
		];
	}

	async upload(file: IFile){
		const fileExt = file.originalname.split('.').slice(-1)[0],
			newFilename = codeGenerator(32) + '.' + fileExt,
			path = join('./src/static', file.destination || '', newFilename);

		//create file
		console.log('Dest: ', file.destination);
		await fs.promises.writeFile(path, file.buffer);

		return process.env.APP_URL + join('/', file.destination || '', newFilename);
	}

	async remove(url: string): Promise<boolean>{
		const filePath = url.slice(process.env.APP_URL?.length),
			path = join('./src/static', filePath);

		//if file exists then delete it
		try {
			await fs.promises.stat(path);
			await fs.promises.unlink(path);

			return true;
		}
		catch (e) {
			return false;
		}
	}
}

export default new FileSystemStorageService();
