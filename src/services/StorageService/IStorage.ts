import {RequestHandler} from 'express';
import {Readable} from 'stream';


export type IFile = {
	originalname: string,
	buffer: Buffer,
	stream: Readable
}

export interface IStorage{
	upload: (file: IFile) => Promise<string>,
	remove: (url: string) => Promise<boolean>,
	getMiddleware: (field: string, isSingle?: boolean) => RequestHandler
}
