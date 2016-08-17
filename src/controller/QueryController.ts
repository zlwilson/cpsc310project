/**
 * Created by rtholmes on 2016-06-19.
 */

import Log from "../Util";

// TODO: actually define this in a meaningful way
export interface QueryRequest {
    ts:number;
    query:string;
}

export interface QueryResponse {
    ts:number;
    status:string;
    result:{};
}

export default class QueryController {

    public isValid(query:QueryRequest):boolean {
        if (typeof query.ts !== 'undefined' && typeof query.query !== 'undefined') {
            return true;
        }
        return false;
    }

    public query(query:QueryRequest):QueryResponse {
        Log.trace('QueryController::query( ' + query + ' )');

        return {status: 'received', ts: query.ts, result: {}};
    }
}
