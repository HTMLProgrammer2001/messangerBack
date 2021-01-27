import {DialogStatus} from '../constants/DialogStatus';


const dialogStatusToText = (userName: string, status: DialogStatus): string => {
	switch (status) {
		case DialogStatus.MESSAGE:
			return `${userName} is writing message...`;

		case DialogStatus.AUDIO:
			return `${userName} is sending audio file(s)...`;

		case DialogStatus.VIDEO:
			return `${userName} is sending video file(s)...`;

		case DialogStatus.DOCUMENT:
			return `${userName} is sending document(s)...`;

		case DialogStatus.IMAGE:
			return `${userName} is sending image(s)...`;

		default:
			return '';
	}
};

export default dialogStatusToText;
