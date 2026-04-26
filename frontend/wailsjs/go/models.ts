export namespace service {
	
	export class VideoResult {
	    id: string;
	    title: string;
	    thumbnail: string;
	    url: string;
	
	    static createFrom(source: any = {}) {
	        return new VideoResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.thumbnail = source["thumbnail"];
	        this.url = source["url"];
	    }
	}

}

