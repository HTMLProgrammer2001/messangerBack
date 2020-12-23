import Code from '../../models/Code.model';


const expiresCodeValidator = async (val: string) => {
	const code = await Code.findOne({code: val});

	//check code exists
	if(!code)
		return  Promise.reject('This code is not found');

	//check code expires
	if(+code.expires < +Date.now())
		return Promise.reject('This code is expires');
};

export default expiresCodeValidator;
