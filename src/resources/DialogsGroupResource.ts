import {IDialog} from '../models/Dialog.model';

import GroupResource from './GroupResource';
import DialogResource from './DialogResource';


class DialogsGroupResource extends GroupResource<IDialog>{
	async apply(item: IDialog) {
		const data = new DialogResource(item, this.userID);
		await data.json();

		return data.toJSON();
	}
}

export default DialogsGroupResource;
