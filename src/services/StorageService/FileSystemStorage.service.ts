import multer from 'multer';
import fs from 'fs';

import {IFile, IStorage} from './IStorage';
import codeGenerator from '../../helpers/codeGenerator';


class FileSystemStorageService implements IStorage {
	getMiddleware(field: string, isSingle: boolean = true){
		const storage = multer.memoryStorage();
		const uploader = multer({storage});

		return isSingle ? uploader.single(field) : uploader.array(field);
	}

	async upload(file: IFile){
		const fileExt = file.originalname.split('.').slice(-1)[0],
			newFilename = codeGenerator(32) + '.' + fileExt,
			path = `./src/static/avatars/${newFilename}`;

		//create file
		fs.writeFileSync(path, file.buffer);

		return `${process.env.APP_URL}/avatars/${newFilename}`;
	}

	async remove(url: string): Promise<boolean>{
		const fileName = url.split('/').slice(-1)[0],
			path = `./src/static/avatars/${fileName}`;

		//if file exists then delete it
		if(fs.existsSync(path)) {
			fs.unlinkSync(path);
			return true;
		}

		return false;
	}
}

export default new FileSystemStorageService();
