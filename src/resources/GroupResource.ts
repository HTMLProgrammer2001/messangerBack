abstract class GroupResource<T>{
	private jsonData: Object = null;
	constructor(protected data: T[]){};
	abstract apply(item: T): Object;

	async json(){
		this.jsonData = await Promise.all(this.data.map(item => this.apply(item)));
	}

	toJSON(){
		console.log(this.jsonData);
		return this.jsonData;
	}
}

export default GroupResource;
