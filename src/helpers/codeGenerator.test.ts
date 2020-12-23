import codeGenerator from './codeGenerator';


describe('Test code generator helper', () => {
	it('Should generate code with only numbers', () => {
		const code = codeGenerator(100);
		expect(code).toMatch(/^\d+$/);
	});

	it('Should generate code with specific length', () => {
		const length = 100,
			code = codeGenerator(length);

		expect(code).toHaveLength(length);
	});
});
