/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets, default as DatasetController} from "./DatasetController";
import Log from "../Util";
import Section from "../model/Section";
import {error} from "util";
import {type} from "os";

export interface QueryRequest {
    GET: string|string[];
    WHERE: QueryBody;
    GROUP?:string[];
    APPLY?:QueryToken[];
    //SORT?:{
    ORDER?: string;

            // Comment out for testing
        //     {
        //     dir: string;
        //     keys: string[];
        // }
    //}
    AS: string;
}



export interface QueryToken {
    [name: string]: {
        MAX?: {
            courses_avg?: number;
            courses_pass?: number;
            courses_fail?: number;
            courses_audit?: number;
        }

        MIN?: {
            courses_avg?: number;
            courses_pass?: number;
            courses_fail?: number;
            courses_audit?: number;
        }

        AVG?: {
            courses_avg?: number;
            courses_pass?: number;
            courses_fail?: number;
            courses_audit?: number;
        }

        COUNT?: {
            courses_avg?: number;
            courses_pass?: number;
            courses_fail?: number;
            courses_audit?: number;
        }
    };
}

export interface QueryBody
{
    IS?:{
        courses_dept?: string;
        courses_id?: string;
        courses_instructor?: string;
        courses_title?: string;
        courses_fail?: number;
    }

    OR?:QueryBody[];
    AND?:QueryBody[];
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
        courses_id?: string;
    }

    NOT?: QueryBody;
}

export interface QueryResponse
{
    result: Array<Result>;
    render: string;
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
    private static datasetController = new DatasetController();
    private sections: Section[] = [];

    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    public isValid(query: QueryRequest): boolean {
        //Added an invalid condition - when GET is not included, query is not valid
        Log.trace('QueryController::isValid(..) - validOrder = ' + this.validOrder(query));

        if (typeof query !== 'undefined'
            && query !== null
            && Object.keys(query).length > 0
            && (typeof query.GET !== 'undefined')
            && (typeof query.WHERE !== 'undefined')
            && (typeof query.AS !== 'undefined')
            && (this.validOrder(query))) {
                return true;
            }

        return false;
    }

    public getId(query: QueryRequest):string[]{

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
        else
        {
            throw 400;
        }

        // requestedId should be an array of ids without duplicates
        var requestedId: string[] = [];
        for(var p in preamble)
        {
            var tempId = preamble[p].split("_")[0];

            if((preamble[p].indexOf("_") === -1)
                || (typeof tempId === "undefined")
                || (tempId === "")
                || (preamble[p].split("_")[1] === "")
                || (typeof preamble[p].split("_")[1] === "undefined")
                || (preamble[p].split("_").length !== 2)
            )
            {
                throw new Error('Invalid Query');
            }

            if (requestedId.length == 0)
            {
                requestedId[0] = tempId;
            }
            else
            {
                var exist: boolean = false;
                for(var i in requestedId)
                {
                    if (requestedId[i] === tempId)
                    {
                        exist = true;
                        break;
                    }
                }
                if(exist === false)
                {
                    requestedId.push(tempId);
                }
            }
        }

        return requestedId;
    }

    public query(query: QueryRequest, id: string): QueryResponse|string {
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


        var sections: Section[] = this.datasets[id];

        this.sections = sections;

        //WHERE
        var jsonwhere = query.WHERE;
        var filteredDs: Section[]  = this.filter(jsonwhere, sections);

        //GET
        var selectedDs: QueryResponse = this.getColumn(preamble, filteredDs);

        var orderedDs: QueryResponse = selectedDs;

        //GROUP
        var groupedDs: Array<Section[]>;

        if (typeof query.GROUP !== "undefined") {
            groupedDs = this.groupResult(query, selectedDs);
        }

        //APPLY
        if (typeof query.ORDER !== "undefined") {
            orderedDs = this.orderResult(query, selectedDs);
        }

        //ORDER
        if (typeof query.ORDER !== "undefined") {
            orderedDs = this.orderResult(query, selectedDs);
        }

        //AS
        orderedDs.render = query.AS.toLocaleUpperCase();

        return orderedDs;

    }

    public groupResult(query: QueryRequest, selectedDs: QueryResponse): Array<Section[]> {
        var response: Array<Section[]>;

        // for (let i in selectedDs) {
        //     response.concat(selectedDs[i]);
        // }

        for (let key in query.GROUP) {
            // sort into each key
            let criteria = query.GROUP[key];

            switch (criteria) {
                case 'courses_dept':
                    for (let element in response) {
                        selectedDs.result.sort(function (a,b) {
                            if (a.courses_dept < b.courses_dept)
                            {
                                return -1;
                            }
                            if (a.courses_dept > b.courses_dept)
                            {
                                return 1;
                            }
                            return 0;
                        });
                        break;
                    }
                case 'courses_id':
                    selectedDs.result.sort(function (a,b) {
                        if (a.courses_dept < b.courses_dept)
                        {
                            return -1;
                        }
                        if (a.courses_dept > b.courses_dept)
                        {
                            return 1;
                        }
                        return 0;
                    });
                    break;
                case 'courses_instructor':
                    selectedDs.result.sort(function (a,b) {
                        if (a.courses_instructor < b.courses_instructor)
                        {
                            return -1;
                        }
                        if (a.courses_instructor > b.courses_instructor)
                        {
                            return 1;
                        }
                        return 0;
                    });
                    break;
                case 'courses_title':
                    selectedDs.result.sort(function (a,b) {
                        if (a.courses_title < b.courses_title)
                        {
                            return -1;
                        }
                        if (a.courses_title > b.courses_title)
                        {
                            return 1;
                        }
                        return 0;
                    });
                    break;
            }
        }


        return response;
    }
    
    //return the filtered dataset , section should be Section[]
    public filter(query: QueryBody, sections: Section[]): Section[]
    {
        var filteredDs: Section[]=[];
        //var index = 0;
        for (let q in query)
        {
            //if(index === 0)
            //{
                Log.trace(q);
                switch (q)
                {
                    case 'IS':
                        filteredDs = this.compareString(query, sections);
                        break;
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
                    case 'NOT':
                        filteredDs = this.negation(query, sections);
                        break;
                    default:
                        // throw error
                        Log.trace("Undefined EBNF in WHERE");
                        throw new Error('Invalid Query');
                }
            //}
            //index++;
        }
        return filteredDs;
    }

    public getColumn(preamble: string[], sections: Section[]): QueryResponse
    {
        var selectedDs: QueryResponse = { result:[], render:""};

        for (let section in sections)
        {
            var result: Result = {};

            for (let p in preamble)
            {
                // Log.trace(preamble[p]);

                switch (preamble[p])
                {
                    case 'courses_dept':
                        result["courses_dept"] = sections[section].Subject;
                        break;
                    case 'courses_id':
                        result["courses_id"] = sections[section].Course;
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
                        result["courses_fail"] = sections[section].Fail;
                        break;
                    case 'courses_audit':
                        result["courses_audit"] = sections[section].Audit;
                        break;
                    default:
                        Log.error("Unexpected GET input");
                        throw new Error("Invalid Query");
                }
            }
            selectedDs.result.push(result);
        }
        return selectedDs;
    }

    public orderResult (query: QueryRequest, selectedDs: QueryResponse): QueryResponse
    {
        switch (query.ORDER)
        {
            case 'courses_dept':
                selectedDs.result.sort(function (a,b) {
                    if (a.courses_dept < b.courses_dept)
                    {
                        return -1;
                    }
                    if (a.courses_dept > b.courses_dept)
                    {
                        return 1;
                    }
                    return 0;
                });
                break;
            case 'courses_id':
                selectedDs.result.sort(function (a,b) {
                    if (a.courses_id < b.courses_id)
                    {
                        return -1;
                    }
                    if (a.courses_id > b.courses_id)
                    {
                        return 1;
                    }
                    return 0;
                });
                break;
            case 'courses_instructor':
                selectedDs.result.sort(function (a,b) {
                    if (a.courses_instructor < b.courses_instructor)
                    {
                        return -1;
                    }
                    if (a.courses_instructor > b.courses_instructor)
                    {
                        return 1;
                    }
                    return 0;
                });
                break;
            case 'courses_title':
                selectedDs.result.sort(function (a,b) {
                    if (a.courses_title < b.courses_title)
                    {
                        return -1;
                    }
                    if (a.courses_title > b.courses_title)
                    {
                        return 1;
                    }
                    return 0;
                });
                break;
            case 'courses_avg':
                selectedDs.result.sort(function (a,b) {
                    return a.courses_avg-b.courses_avg;
                })
                break;
            case 'courses_pass':
                selectedDs.result.sort(function (a,b) {
                    return a.courses_pass-b.courses_pass;
                })
                break;
            case 'courses_fail':
                selectedDs.result.sort(function (a,b) {
                    return a.courses_fail-b.courses_fail;
                })
                break;
            case 'courses_audit':
                selectedDs.result.sort(function (a,b) {
                    return a.courses_audit-b.courses_audit;
                })
                break;
        }
        return selectedDs;
    }

    public logicOr (query: QueryBody, sections: Section[]): Section[]
    {
        var or: Section[] = [];
        var subQueries = query.OR;

        if(subQueries.length > 0 &&(subQueries instanceof Array))
        {
            for(var q = 0; q < subQueries.length; q++)
            {
                or = or.concat(this.filter(query.OR[q], sections));
            }

            or = this.removeDuplicate(or);
        }
        else
        {
            throw new Error('Invalid Query');
        }

        return or;
    }

    public logicAnd (query: QueryBody, sections: Section[]): any
    {
        var and: Section[] = sections;
        var subQueries = query.AND;

        if (subQueries.length > 0 && (subQueries instanceof Array))
        {
            for (var q = 0; q < subQueries.length; q++)
            {
                var temp = this.filter(query.AND[q], and);
                and = temp;
            }
        }
        else
        {
            throw new Error('Invalid Query');
        }

        return and;
    }

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
                        //Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Avg + ", greater than " + comparedVal);
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
                        //Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Pass + ", greater than " + comparedVal);
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
                        //Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Fail + ", greater than " + comparedVal);
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
                        //Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Audit + ", greater than " + comparedVal);
                    }
                }
                break;
            default:
                Log.error("Unexpected compare value");
                throw new Error('Invalid Query');
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
                        //Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Avg + ", less than " + comparedVal);
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
                        //Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Pass + ", less than " + comparedVal);
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
                        //Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Fail + ", less than " + comparedVal);
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
                        //Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Audit + ", less than " + comparedVal);
                    }
                }
                break;
            default:
                Log.error("Unexpected compare value");
                throw new Error('Invalid Query');
        }
        // Log.trace("Comparing " + comparedKey[0] + " with " + comparedVal);


        return filteredDs;
    }

    public equalTo (query: QueryBody, sections:Section[]):any
    {
        var comparedKey = Object.keys(query.EQ);
        var comparedVal: string | number;
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
                        //Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Avg + ", equal to " + comparedVal);
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
                        //Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Pass + ", equal to " + comparedVal);
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
                        //Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Fail + ", equal to " + comparedVal);
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
                        //Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Audit + ", equal to " + comparedVal);
                    }
                }
                break;
            case 'courses_id':
                comparedVal = query.EQ.courses_id;
                compareField = "id";
                for (let section in sections)
                {
                    var s:Section = sections[section];
                    if (s.Course == comparedVal)
                    {
                        filteredDs.push(s);
                        //Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Audit + ", equal to " + comparedVal);
                    }
                }
                break;
            default:
                Log.error("Unexpected compare value");
                throw new Error('Invalid Query');
        }
        // Log.trace("Comparing " + comparedKey[0] + " with " + comparedVal);


        return filteredDs;
    }

    public compareString(query: QueryBody, sections:Section[]): Section[]
    {
        var comparedKey = Object.keys(query.IS);
        var comparedVal: string;
        var compareField: string;

        var filteredDs:Section[] = [];
        switch (comparedKey[0])
        {
            case 'courses_dept':
                comparedVal = query.IS.courses_dept;
                compareField = "Subject";

                for (let section in sections)
                {
                    var s:Section = sections[section];

                    var ifContains: Boolean = this.compareStringHelper(s.Subject, comparedVal);
                    if (ifContains)
                    {
                        filteredDs.push(s);
                    }
                }
                break;
            case 'courses_title':
                comparedVal = query.IS.courses_title;
                compareField = "Title";
                for (let section in sections)
                {
                    var s:Section = sections[section];

                    var ifContains: Boolean = this.compareStringHelper(s.Title, comparedVal);
                    if (ifContains)
                    {
                        filteredDs.push(s);
                    }
                }
                break;
            case 'courses_instructor':
                comparedVal = query.IS.courses_instructor;
                compareField = "Professor";
                for (let section in sections)
                {
                    var s:Section = sections[section];

                    var ifContains: Boolean = this.compareStringHelper(s.Professor, comparedVal);
                    if (ifContains)
                    {
                        filteredDs.push(s);
                    }
                }
                break;

            case  'courses_id':
                comparedVal = query.IS.courses_id;
                compareField = "id";
                for (let section in sections)
                {
                    var s:Section = sections[section];

                    var ifContains: Boolean = this.compareStringHelper(s.Course, comparedVal);
                    if (ifContains)
                    {
                        filteredDs.push(s);
                    }
                }
                break;
            case 'courses_fail':
                comparedVal = query.IS.courses_fail.toLocaleString();
                compareField = "fail";
                for (let section in sections)
                {
                    var s:Section = sections[section];

                    var ifContains: Boolean = this.compareStringHelper(s.Fail.toLocaleString(), comparedVal);
                    if (ifContains)
                    {
                        filteredDs.push(s);
                    }
                }
                break;
            default:
                Log.error("Unexpected compare value");
                throw new Error('Invalid Query');
        }
        // Log.trace("Comparing " + comparedKey[0] + " with " + comparedVal);


        return filteredDs;
    }

    public negation (query: QueryBody, sections:Section[]): Section[]
    {
        var filteredDs: Section[] = this.filter(query.NOT, sections);
        var filteredId: string[] = [];
        for (var s in filteredDs) {
            filteredId.push(filteredDs[s].id);
        }

        var negatedDs: Section[] =  sections.filter(function (el) {
            return filteredId.indexOf(el.id) > -1;
        })

        return negatedDs;
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

    public validOrder(query: QueryRequest): Boolean
    {
        if (typeof query.ORDER === "undefined") {
            return true;
        }

        if (query.GET instanceof Array)
        {
            for (var k = 0; k<query.GET.length; k++)
                {
                    if (query.GET[k] === query.ORDER)
                    {
                        return true;
                    }
                }
            }
        else if (typeof query.GET === "string" || query.GET instanceof String)
        {
            if (query.GET.toString() === query.ORDER)
            {
                    return true;
            }
        }

        return false;
    }

    public compareStringHelper(string: string, comparedVal: string): Boolean
    {
        if (string === "")
        {
            return false;
        }

        if ((comparedVal.lastIndexOf("*", 0) == -1)
            && (comparedVal.lastIndexOf("*", comparedVal.length -1) != -1))
        {
            //starts with the string
            comparedVal = comparedVal.slice(0, -1);
            if(string.startsWith(comparedVal))
            {
                //Log.trace('Find ' + string + ' starts with ' + comparedVal);
                return true;
            }
        }
        if ((comparedVal.lastIndexOf("*", 0) != -1)
            && (comparedVal.lastIndexOf("*", comparedVal.length -1) == -1))
        {
            //ends with the given string
            comparedVal = comparedVal.slice(1, comparedVal.length);
            if(string.endsWith(comparedVal))
            {
                //Log.trace('Find ' + string + ' starts with ' + comparedVal);
                return true;
            }
        }
        if ((comparedVal.lastIndexOf("*", 0) != -1)
            && (comparedVal.lastIndexOf("*", comparedVal.length -1) != -1))
        {
            //contains the string somewhere
            comparedVal = comparedVal.slice(1, comparedVal.length -1);
            if(string.indexOf(comparedVal) != -1)
            {
                //Log.trace('Find ' + string + ' starts with ' + comparedVal);
                return true;
            }
        }
        if ((comparedVal.lastIndexOf("*", 0) == -1)
            && (comparedVal.lastIndexOf("*", comparedVal.length -1) == -1))
        {
            //must be the exact string
            if (string == comparedVal)
            {
                //Log.trace('Find ' + string + ' starts with ' + comparedVal);
                return true;
            }
        }
        return false;
    }

}