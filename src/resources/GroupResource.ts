abstract class GroupResource<T>{
	private jsonData: Object = null;
	constructor(protected data: T[], protected userID: any){};
	abstract apply(item: T): Object;

	async json(){
		this.jsonData = await Promise.all(this.data.map(item => this.apply(item)));
	}

	toJSON(){
		return this.jsonData;
	}
}

export default GroupResource;
