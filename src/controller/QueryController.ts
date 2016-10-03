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
    WHERE: QueryBody;
    ORDER: string;
    AS: string;

}

export interface QueryBody
{
    IS?:any;
    OR?:[QueryBody, QueryBody];
    AND?:[QueryBody, QueryBody];
    GT?: {
        courses_avg?: number;
        courses_pass?: number;
        courses_fail?: number;
        courses_audit?: number;

    };
    LT?: {
        courses_avg?: number;
        courses_pass?: number;
        courses_fail?: number;
        courses_audit?: number;
    };
    EQ?:{
        courses_avg?: number;
        courses_pass?: number;
        courses_fail?: number;
        courses_audit?: number;
    }
}

export interface QueryResponse
{

    result: Array<Result>;
}

export interface Result
{
    courses_dept?: string;
    courses_id?: string;
    courses_instructor?: string;
    courses_title?: string;

    courses_avg?: number;
    courses_pass?: number;
    courses_fail?: number;
    courses_audit?: number;
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
        var result = file.result;
        var sections:Section[] = [];

        for (var r in result)
        {
            var instanceSection: Section = result[r];
            sections.push(instanceSection);
        }

        //If datasets[id] is null, then use DatasetController.process to find if it's in disk,
        //If still null, return error

        //Todo: Valid key translation using string.replace at the beginning or switch everywhere

        //WHERE
        var jsonwhere = query.WHERE;
        var filteredDs: Section[]  = this.filter(jsonwhere, sections);

        //GET
        var selectedDs: QueryResponse = this.getColumn(preamble, filteredDs);
        // selectedDs.render = query.AS;

        //ORDER
        //AS


        //Create a Course of datasets[id] and translate keys
        //Get wanted information in Section


        return selectedDs;
        //return {status: 'received', ts: new Date().getTime()};
    }

    //return the filtered dataset , section should be Section[]
    public filter(query: QueryBody, sections: Section[]): Section[]
    {
        var filteredDs: Section[]=[];
        var index = 0;
        for (let q in query)
        {
            if(index === 0)
            {
                Log.trace(q);
                switch (q)
                {
                    case 'OR':
                        filteredDs = this.logicOr(query, sections);
                        break;
                    case 'AND':
                        filteredDs = this.logicAnd(query, sections);
                        break;
                    case 'GT':
                        filteredDs = this.greaterThan(query, sections);
                        break;
                    case 'LT':
                        filteredDs = this.lessThan(query, sections);
                        break;
                    case 'EQ':
                        filteredDs = this.equalTo(query, sections);
                        break;
                    default:
                        Log.trace("Undefined EBNF in WHERE");
                }
            }
            index++;
        }
        return filteredDs;
    }

    public getColumn(preamble: string[], sections: Section[]): QueryResponse
    {
        var selectedDs: QueryResponse = { result:[]};

        for (let section in sections)
        {
            var result: Result = {};

            for (let p in preamble)
            {
                Log.trace(preamble[p]);

                switch (preamble[p])
                {
                    case 'courses_dept':
                        result["courses_dept"] = sections[section].Subject;
                        break;
                    case 'courses_id':
                        result["courses_id"] = sections[section].id;
                        break;
                    case 'courses_avg':
                        result["courses_avg"] = sections[section].Avg;
                        break;
                    case 'courses_instructor':
                        result["courses_instructor"] = sections[section].Professor;
                        break;
                    case 'courses_title':
                        result["courses_title"] = sections[section].Title;
                        break;
                    case 'courses_pass':
                        result["courses_pass"] = sections[section].Pass;
                        break;
                    case 'courses_fail':
                        result["courses_fail"] = sections[section].Pass;
                        break;
                    case 'courses_audit':
                        result["courses_audit"] = sections[section].Audit;
                        break;
                    default:
                        Log.error("Unexpected GET input");
                }
            }
            selectedDs.result.push(result);
        }
        return selectedDs;
    }

    public logicOr (query: QueryBody, sections: Section[]): Section[]
    {
        var or: Section[] = this.filter(query.OR[0], sections).concat(this.filter(query.OR[1], sections));
        or = this.removeDuplicate(or);
        return or;
    }

    public logicAnd (query: QueryBody, sections: Section[]): any
    {
        var applyFirst: Section[] = this.filter(query.AND[0], sections);
        var applySecond: Section[] = this.filter(query.AND[1], applyFirst);
        return applySecond;
    }

    //Todo: deal with wrong input
    public greaterThan (query: QueryBody, sections:Section[]):any
    {
        //get the object inseide GT, use key to iterate through sections to find targeted value and compare
        //if value is greater, add it to filteredData.
        //return filteredData

        var comparedKey = Object.keys(query.GT);
        var comparedVal: number;
        var compareField: string;

        var filteredDs:Section[] = [];
        switch (comparedKey[0])
        {
            case 'courses_avg':
                comparedVal = query.GT.courses_avg;
                compareField = "Avg";
                for (let section in sections)
                {
                    var s:Section = sections[section];
                    if (s.Avg > comparedVal)
                    {
                        filteredDs.push(s);
                        Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Avg + ", greater than " + comparedVal);
                    }
                }
                break;
            case 'courses_pass':
                comparedVal = query.GT.courses_pass;
                compareField = "Pass";
                for (let section in sections)
                {
                    var s:Section = sections[section];
                    if (s.Pass > comparedVal)
                    {
                        filteredDs.push(s);
                        Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Pass + ", greater than " + comparedVal);
                    }
                }
                break;
            case 'courses_fail':
                comparedVal = query.GT.courses_fail;
                compareField = "Fail";
                for (let section in sections)
                {
                    var s:Section = sections[section];
                    if (s.Fail > comparedVal)
                    {
                        filteredDs.push(s);
                        Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Fail + ", greater than " + comparedVal);
                    }
                }
                break;
            case  'courses_audit':
                comparedVal = query.GT.courses_audit;
                compareField = "Audit";
                for (let section in sections)
                {
                    var s:Section = sections[section];
                    if (s.Audit > comparedVal)
                    {
                        filteredDs.push(s);
                        Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Audit + ", greater than " + comparedVal);
                    }
                }
                break;
            default:
                Log.error("Unexpected compare value");
        }
        // Log.trace("Comparing " + comparedKey[0] + " with " + comparedVal);


        return filteredDs;
    }

    public lessThan (query: QueryBody, sections:Section[]):any
    {
        var comparedKey = Object.keys(query.LT);
        var comparedVal: number;
        var compareField: string;

        var filteredDs:Section[] = [];
        switch (comparedKey[0])
        {
            case 'courses_avg':
                comparedVal = query.LT.courses_avg;
                compareField = "Avg";
                for (let section in sections)
                {
                    var s:Section = sections[section];
                    if (s.Avg < comparedVal)
                    {
                        filteredDs.push(s);
                        Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Avg + ", less than " + comparedVal);
                    }
                }
                break;
            case 'courses_pass':
                comparedVal = query.LT.courses_pass;
                compareField = "Pass";
                for (let section in sections)
                {
                    var s:Section = sections[section];
                    if (s.Pass < comparedVal)
                    {
                        filteredDs.push(s);
                        Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Pass + ", less than " + comparedVal);
                    }
                }
                break;
            case 'courses_fail':
                comparedVal = query.LT.courses_fail;
                compareField = "Fail";
                for (let section in sections)
                {
                    var s:Section = sections[section];
                    if (s.Fail < comparedVal)
                    {
                        filteredDs.push(s);
                        Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Fail + ", less than " + comparedVal);
                    }
                }
                break;
            case  'courses_audit':
                comparedVal = query.LT.courses_audit;
                compareField = "Audit";
                for (let section in sections)
                {
                    var s:Section = sections[section];
                    if (s.Audit < comparedVal)
                    {
                        filteredDs.push(s);
                        Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Audit + ", less than " + comparedVal);
                    }
                }
                break;
            default:
                Log.error("Unexpected compare value");
        }
        // Log.trace("Comparing " + comparedKey[0] + " with " + comparedVal);


        return filteredDs;
    }

    public equalTo (query: QueryBody, sections:Section[]):any
    {
        var comparedKey = Object.keys(query.EQ);
        var comparedVal: number;
        var compareField: string;

        var filteredDs:Section[] = [];
        switch (comparedKey[0])
        {
            case 'courses_avg':
                comparedVal = query.EQ.courses_avg;
                compareField = "Avg";
                for (let section in sections)
                {
                    var s:Section = sections[section];
                    if (s.Avg == comparedVal)
                    {
                        filteredDs.push(s);
                        Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Avg + ", equal to " + comparedVal);
                    }
                }
                break;
            case 'courses_pass':
                comparedVal = query.EQ.courses_pass;
                compareField = "Pass";
                for (let section in sections)
                {
                    var s:Section = sections[section];
                    if (s.Pass == comparedVal)
                    {
                        filteredDs.push(s);
                        Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Pass + ", equal to " + comparedVal);
                    }
                }
                break;
            case 'courses_fail':
                comparedVal = query.EQ.courses_fail;
                compareField = "Fail";
                for (let section in sections)
                {
                    var s:Section = sections[section];
                    if (s.Fail == comparedVal)
                    {
                        filteredDs.push(s);
                        Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Fail + ", equal to " + comparedVal);
                    }
                }
                break;
            case  'courses_audit':
                comparedVal = query.EQ.courses_audit;
                compareField = "Audit";
                for (let section in sections)
                {
                    var s:Section = sections[section];
                    if (s.Audit == comparedVal)
                    {
                        filteredDs.push(s);
                        Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Audit + ", equal to " + comparedVal);
                    }
                }
                break;
            default:
                Log.error("Unexpected compare value");
        }
        // Log.trace("Comparing " + comparedKey[0] + " with " + comparedVal);


        return filteredDs;
    }

    public removeDuplicate (dupArray: Section[]):Section[]
    {
        for (var i = 0; i<dupArray.length; ++i)
        {
            for (var j = i + 1; j< dupArray.length; ++j)
            {
                if (dupArray[i].id === dupArray[j].id)
                {
                    dupArray.splice(j--, 1);
                }

            }
        }
        return dupArray;
    }
}
