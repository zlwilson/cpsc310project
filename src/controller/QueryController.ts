/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets, default as DatasetController} from "./DatasetController";
import Log from "../Util";
import {stringify} from "querystring";
import {type} from "os";
import Course from "../model/Course";
import Section from "../model/Section";

export interface QueryRequest {
    GET: string|string[];
    WHERE: {
        IS?:any;
    };
    ORDER: string;
    AS: string;

}

export interface QueryResponse {
}

export default class QueryController {
    private datasets: Datasets = null;
    private  static datasetController = new DatasetController();

    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    public isValid(query: QueryRequest): boolean {
        //Added an invalid condition - when GET is not included, query is not valid
        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0 && query.hasOwnProperty("GET")) {
            return true;
        }
        return false;
    }

    public query(query: QueryRequest): QueryResponse {
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');

        // TODO: implement this
        //Get preamble from the first half of GET part of QueryRequest
        var preamble: any;

        if (query.GET instanceof Array)
        {
            Log.trace("as an array");
            preamble = query.GET;
        }
        else if (typeof query.GET === "string" || query.GET instanceof String)
        {
            Log.trace("as a string");
            var temp:string[] = [];
            temp.push(query.GET.toString());
            preamble = temp;
        }

        //use id to find file
        var id: string = preamble[0].split("_", 2)[0];
        Log.trace(id);
        //if (datasets[id].pushed)
        let controller = QueryController.datasetController;
        var file = controller.getDataset(id);
        var sections:string[] = file.result;

        //If datasets[id] is null, then use DatasetController.process to find if it's in disk,
        //If still null, return error

        //Todo: Valid key translation using string.replace at the beginning or switch everywhere

        //WHERE
        this.filter(query);

        //GET
        this.getColumn(preamble, sections);

        //ORDER
        //AS


        //Create a Course of datasets[id] and translate keys
        //Get wanted information in Section


        return sections;
        //return {status: 'received', ts: new Date().getTime()};
    }

    public filter(query: QueryRequest)
    {
        var jsonwhere = query.WHERE;
        var index = 0;
        for (let q in jsonwhere)
        {
            if(index === 0)
            {
                Log.trace(q);
                switch (q)
                {
                    case'OR':
                        this.logicOr();
                        break;
                    case'AND':
                        this.logicAnd();
                        break;
                    default:
                        Log.trace("Undefined EBNF in WHERE");
                }
            }
            index++;
        }
    }

    public getColumn(preamble: string[], sections: string[])
    {
        for (let p in preamble)
        {
            Log.trace(preamble[p]);
            var getStat: string[] = [];

            for (let section of sections)
            {
                //valid key translation
                switch (preamble[p])
                {
                    case 'courses_dept':
                        // getStat.push(section.Subject);
                        // Log.trace(course.Subject);
                        break;
                    case 'courses_id':
                        break;
                    case 'courses_avg':
                        break;
                    case 'courses_instructor':
                        break;
                    case 'courses_title':
                        break;
                    case 'courses_pass':
                        break;
                    case 'courses_fail':
                        break;
                    case 'courses_audit':
                        break;
                    default:

                }

            }
        }
    }

    public logicOr ()
    {

    }

    public logicAnd ()
    {

    }

}
