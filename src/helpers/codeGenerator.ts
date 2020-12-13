const codeGenerator = (len = 8) => {
	let code = '';

	for(let i = 0; i < len; i++)
		code += Math.round(Math.random() * 10);

	return code;
};

export default codeGenerator;
