import AwsStorage from './AwsStorage.service';
import FileSystemStorage from './FileSystemStorage.service';
import {IStorage} from './IStorage';


const storage: IStorage = process.env.APP_STORAGE == 'aws' ? AwsStorage : FileSystemStorage;

export default storage;
