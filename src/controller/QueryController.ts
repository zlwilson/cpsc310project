/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets, default as DatasetController} from "./DatasetController";
import Log from "../Util";
import Section from "../model/Section";
import {error} from "util";
import {type} from "os";
import sort = require("core-js/fn/array/sort");

export interface QueryRequest {
    GET: string|string[];
    WHERE: QueryBody;
    GROUP?: string[];
    APPLY?:QueryToken[];
    //SORT?:{
    ORDER?: string|NewOrder;
    AS: string;
}

export interface NewOrder {
    dir: 'UP'|'DOWN';
    keys: string[];
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
            courses_dept?: string;
            courses_id?: string;
            courses_instructor?: string;
            courses_title?: string;

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
        courses_uuid?: string;
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
    result: Array<any>;
    render: string;
}

export interface Result
{
    courses_dept?: string;
    courses_id?: string;
    courses_instructor?: string;
    courses_title?: string;
    courses_uuid?: string;

    courses_avg?: number;
    courses_pass?: number;
    courses_fail?: number;
    courses_audit?: number;

}

export interface GroupByDictionary {
    [id: string]: Result[];
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
            && (this.validGroup(query))
            && (this.validOrder(query))
            && (
                ((typeof query.GROUP === 'undefined') && (typeof query.APPLY === 'undefined'))
             ||((typeof query.GROUP !== 'undefined') && (typeof query.APPLY !== 'undefined'))
            )
        ) {
                return true;
            }
            //Todo: check if Group and Apply go together

        return false;
    }

    public getId(query: QueryRequest):string[]{

        var preamble: string[] = [];

        if (query.GET instanceof Array)
        {
            Log.trace("as an array");
            var temp = query.GET as string[];
            preamble = temp;
        }
        else if (typeof query.GET === "string" || query.GET instanceof String)
        {
            Log.trace("as a string");
            preamble.push(query.GET.toString());
        }
        else
        {
            throw 400;
        }

        // requestedId should be an array of ids without duplicates
        var requestedId: string[] = [];

        //if there is any APPLY key, delete it from preamble.
        if (typeof query.APPLY !== 'undefined') {
            var applyKeys:string[] = [];

            for (var a in query.APPLY) {
                var keyTemp = Object.keys(query.APPLY[a]);
                applyKeys.push(keyTemp[0]); // assume each apply token has exactly one key
            }

            preamble = preamble.filter(function (el) {
                return applyKeys.indexOf(el) === -1;
            })
        }

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

        var groupedDs:any;
        var applyTerms : string[] = [];

        //GROUP & APPLY
        if (query.GROUP instanceof Array) {

            Log.info('QueryController::query() - GROUP BY');
            var grouped: any = this.groupBy(query, filteredDs); // return a dictionary of groups

            Log.info('QueryController::query() - APPLY');
            for (var a in query.APPLY) {
                applyTerms.push(Object.keys(query.APPLY[a])[0]); // to pass applyTerms to getColumn()
            }
            var applied: any = this.apply(query, grouped); // return a dictionary of groups with applied value
            groupedDs = this.dictToResults(applied); // return an array of results

        } else if (typeof query.GROUP === 'undefined') {

            groupedDs = filteredDs;

        } else {

            throw new Error('QueryController:: GROUP - Invalid Query');
        }

        //GET:: takes either an array of sections or an array of results, and return a QueryResponse (render, result)
        var selectedDs: QueryResponse = this.getColumn(preamble, groupedDs, applyTerms);


        // Log.info('QueryController::query() - orderedDs result is:');
        // for (var i = 0; i <= 5; i++) {
        //     Log.info('QueryController::query() - orderedDs = ' + orderedDs.result[i].courses_id);
        // }

        //ORDER
        var orderedDs = selectedDs;

        if (typeof query.ORDER !== "undefined") {
            orderedDs = this.order(query, selectedDs, applyTerms);
        }

        //AS
        orderedDs.render = query.AS.toLocaleUpperCase();

        return orderedDs;
    }

    /*
        citation: http://codereview.stackexchange.com/questions/37028/grouping-elements-in-array-by-multiple-properties
        groupBy() returns a dictionary where:
            key: an array of strings (the group by queries)
            body: array of results
        eg: the key ['CPSC','310'] maps to [ all the sections of CPSC 310 ... ]
     */
    public groupBy(query: QueryRequest, array: Section[]): {} {
        var groups: any = {};

        // Log.info('QueryController::groupBy()...');
        //
        // Log.info('QueryController::groupBy() - array size = ' + array.length);

        var keys: string[] = this.getKeys(query);

        for (let i in array) {

            var key: any = this.getValues(keys, array[i]);
            // Log.info('QueryController::groupBy() - key = ' + key + ', # of elements in key = ' + key.length);
            // Log.info('QueryController::groupBy() - key[] = ' + key[0] + ' & key[1] = ' + key[1]);
            if (key in groups) {
                groups[key].push(array[i]);
            } else {
                groups[key] = [array[i]];
            }
        }

        return groups;
    }

    // helpers for groupBy()
    public getKeys(query: QueryRequest): string[] {
        var result: any;

        if (query.GROUP instanceof Array) {
            result = query.GROUP;
        } else {
            result.push(query.GROUP.toString());
        }
        return result;
    }

    public apply(query: QueryRequest, groups:any):{} {
        var result:any = {};

            //Loop through each group
            for (var g in groups) {

                //Create dictionary for each group to store the result of calculations
                var groupResult:any = {};

                //Add group key information to groupResult
                // for(var gk in query.GROUP) {
                //     var groupKey = this.sectionTranslator(query.GROUP[gk]);
                //     Log.info('QueryController::apply() - gk = ' + query.GROUP[gk]);
                //     var groupValue = groups[g][0][groupKey];
                //     Log.info('QueryController::apply() - groupValue = ' + groupValue);
                //     groupResult[groupKey] = groupValue;
                // }

                var keys: string[] = this.getKeys(query);

                var key: any = this.getValues(keys, groups[g]);

                var groupValue = groups[g][0][key];

                groupResult[key] = groupValue;

                //Loop through each applyToken
                for (var i in query.APPLY) {
                    var term: string = Object.keys(query.APPLY[i])[0];
                    var calculation: any = query.APPLY[i][term];

                    var token = Object.keys(calculation)[0];

                    //Switch to different calculations according to applyToken
                    switch (token) {
                        case 'MAX':
                            groupResult[term] = this.max(groups[g], calculation[token]);
                            break;
                        case 'MIN':
                            groupResult[term] = this.min(groups[g], calculation[token]);
                            break;
                        case 'AVG':
                            groupResult[term] = this.avg(groups[g], calculation[token]);
                            break;
                        case 'COUNT':
                            groupResult[term] = this.count(groups[g], calculation[token]);
                            break;
                        default:
                            Log.error("Unexpected Apply Token");
                            throw  new Error("Invalid Apply Token");
                    }
                }

                //add dictionary to result[current group]
                result[g] = groupResult;
            }


        return result;
    }

    public dictToResults(dictionary: any): Result[] {
        var result: Result[] = [];
        Log.info('QueryController::dictToResults - start');

        for (let key in dictionary) {
            // Log.info('QueryController::dictToResults - for - key = ' + key);
            // Log.info('QueryController::dictToResults - key ' + key + ' length = ' + dictionary[key].length);

            result.push(dictionary[key]);
        }

        Log.info('QueryController::dictToResults - result = ' + result.length);

        return result;
    }

    public getValues(preamble: string[], section: Section): any {
        var result: string[] = [];


        for (let p in preamble) {
            switch (preamble[p]) {
                case 'courses_dept':
                    result.push(section.Subject);
                    break;
                case 'courses_id':
                    result.push(section.Course);
                    break;
                case 'courses_avg':
                    result.push(section.Avg.toString());
                    break;
                case 'courses_instructor':
                    result.push(section.Professor);
                    break;
                case 'courses_title':
                    result.push(section.Title);
                    break;
                case 'courses_pass':
                    result.push(section.Pass.toString());
                    break;
                case 'courses_fail':
                    result.push(section.Fail.toString());
                    break;
                case 'courses_audit':
                    result.push(section.Audit.toString());
                    break;
                case 'courses_uuid':
                    result.push(section.id);
                default:
                    Log.error("Unexpected GET input");
                    throw new Error("Invalid Query");
            }
        }
        return result;
    }

    //return the filtered dataset , section should be Section[]
    public filter(query: QueryBody, sections: Section[]): Section[]
    {
        var filteredDs: Section[]=[];
        //var index = 0;
       if (Object.keys(query).length === 0) {
           return sections;
       }

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


    // Parameters:
    //      - preamble: columns to get
    //      - sections: an array of sections or grouped & applied sections
    //      - applyTerms: names of calculated values
    public getColumn(preamble: string[], sections: Array<any>, applyTerms: string[]): QueryResponse
    {
        var selectedDs: QueryResponse = { result:[], render:""};

        for (let section in sections)
        {
            var result:any = {};

            for (let p in preamble)
            {
                // Log.trace(preamble[p]);

                switch (preamble[p])
                {
                    case 'courses_dept':
                    case 'courses_id':
                    case 'courses_avg':
                    case 'courses_instructor':
                    case 'courses_title':
                    case 'courses_pass':
                    case 'courses_fail':
                    case 'courses_audit':
                    case 'courses_uuid':
                        result[preamble[p]] = sections[section][this.sectionTranslator(preamble[p])];
                        break;
                    default:
                         if(applyTerms.indexOf(preamble[p]) > -1) {
                            result[preamble[p]] = sections[section][preamble[p]];
                        } else {
                             Log.error("Unexpected GET input");
                             throw new Error("Invalid Query");
                         }
                }
            }
            selectedDs.result.push(result);
        }
        return selectedDs;
    }

    public order(query:QueryRequest, selectedDs: QueryResponse, applyTerms: string[]): QueryResponse {

        var result: QueryResponse;
        var orderKeys: string[] = [];
        var direction: string = '';

        if (typeof query.ORDER === 'string') {
            var orderKey = query.ORDER as string;
            orderKeys.push(orderKey);
            direction = 'UP'
        } else {
            var order = query.ORDER as NewOrder;
            orderKeys = order.keys;
            direction = order.dir;
        }

        var that = this;
        selectedDs.result.sort(function (a,b){
            for (var i = 0; i < orderKeys.length; i++){
                var res = that.basicOrder(orderKeys[i], a, b, direction, applyTerms);
                if (res === 0 ){
                    continue;
                }
                return res;
            }
        });

        result = selectedDs;
        return result;
    }


    public basicOrder (order: string, resultA:any, resultB:any, direction:string, applyTerms:string[]): number
    {
        var result: number;

        var position:number;

        if (direction === 'UP') {
            position = -1;
        } else {
            position = 1;
        }

        switch (order)
        {
            case 'courses_dept':
            case 'courses_id':
            case 'courses_instructor':
            case 'courses_title':
            case 'courses_uuid':
                    if (resultA[order] < resultB[order])
                    {
                        result = position;
                    }
                    if (resultA[order] > resultB[order])
                    {
                        result = position * -1;
                    }
                            result = 0;
                break;
            case 'courses_avg':
            case 'courses_pass':
            case 'courses_fail':
            case 'courses_audit':
                result = (direction === 'UP')? resultA[order]-resultB[order]
                                                : resultB[order]-resultA[order];
                break;
            default:
                if(applyTerms.indexOf(order) > -1) {
                    result = (direction === 'UP')? resultA[order]-resultB[order] : resultB[order]-resultA[order];
                } else {
                    throw new Error('QueryController::Invalid OrderKey');
                }
        }

        return result;
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
            // Todo: delete this because can't compare id with number
            // case 'courses_id':
            //     comparedVal = query.EQ.courses_id;
            //     compareField = "id";
            //     for (let section in sections)
            //     {
            //         var s:Section = sections[section];
            //         if (s.Course == comparedVal)
            //         {
            //             filteredDs.push(s);
            //             //Log.trace(compareField + " of " + s.Subject + s.Course + " is " + s.Audit + ", equal to " + comparedVal);
            //         }
            //     }
            //     break;
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
            case   'courses_uuid':
                comparedVal = query.IS.courses_uuid;
                compareField = "uuid";
                for (let section in sections)
                {
                    var s:Section = sections[section];

                    var ifContains: Boolean = this.compareStringHelper(s.id, comparedVal);
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

        var orderKeys:string[] = [];

        if (typeof query.ORDER === 'string'
            || query.GET instanceof String) {
            orderKeys.push(query.ORDER.toString());
        } else if (typeof query.ORDER === 'NewOrder') {
            var order = query.ORDER as NewOrder;

            if (order.dir !== 'UP' && order.dir !== 'DOWN') {
                return false;
            }

            orderKeys = order.keys;
        }

        for (var o in orderKeys) {
            if (query.GET instanceof Array) {
                var preamble = query.GET as string[];
                if (preamble.indexOf(orderKeys[o]) === -1) {
                    return false;
                }

            } else if (typeof query.GET === "string"
                || query.GET instanceof String) {
                if (query.GET.toString() !== orderKeys[o]) {
                    return false;
                }
            }
        }
        return true;
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

    private max(sections: Section[], key:string):number {
        var numArray : number[] = [];

        var transKey = this.sectionTranslator(key);

        for (var s in sections) {
            var section: any = sections[s];
            numArray.push(section[transKey]);
        }

        var maxNum = Math.max.apply(null, numArray);

        return maxNum;
    }

    private min(sections: Section[], key:string):number {
        var numArray : number[] = [];

        var transKey = this.sectionTranslator(key);

        for (var s in sections) {
            var section: any = sections[s];
            numArray.push(section[transKey]);
        }

        var mimNum = Math.min.apply(null, numArray);

        return mimNum;
    }

    private avg(sections: Section[], key:string):number {
        var sum: number = 0;

        var transKey = this.sectionTranslator(key);

        for (var s in sections) {
            var section: any = sections[s];
            sum += section[transKey];
        }

        var sectionNum = sections.length;
        var avg:number = sum/sectionNum;
        return Math.round(avg * 1e2) / 1e2;
    }

    private count(sections: Section[], key:string):number {
        var array: Array<any> = [];

        var transKey = this.sectionTranslator(key);

        for (var s in sections) {
            var section: any = sections[s];
            if( array.indexOf(section[transKey]) === -1) {
                array.push(section[transKey]);
            }
        }
        return array.length;
    }

    //Translate query to what section can understand
    private sectionTranslator(key: string) : string {

        var translated: string = key;

        switch (key) {
            case 'courses_dept':
                translated = "Subject";
                break;
            case 'courses_id':
                translated = "Course";
                break;
            case 'courses_avg':
                translated = "Avg";
                break;
            case 'courses_instructor':
                translated = "Professor";
                break;
            case 'courses_title':
                translated = "Title";
                break;
            case 'courses_pass':
                translated = "Pass";
                break;
            case 'courses_fail':
                translated = "Fail";
                break;
            case 'courses_audit':
                translated = "Audit";
                break;
            case 'courses_uuid':
                translated = "id";
                break;
            default:
                throw new Error('QueryController:: Invalid Query Key');
        }

        return translated;
    }

    private validGroup(query: QueryRequest): boolean {
        if (typeof query.GROUP === "undefined") {
            return true;
        }

        var keys = query.GROUP;
        if (keys.length === 0) {
            return false;
        }

        for (var k in keys){
            if (query.GET instanceof Array) {
                if (query.GET.indexOf(keys[k]) === -1){
                    return false;
                }
            } else {
                if (query.GET != keys[k]) {
                    return false;
                }
            }
        }
        return true;
    }

}