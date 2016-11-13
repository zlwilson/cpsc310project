/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets, default as DatasetController} from "./DatasetController";
import Log from "../Util";
import Section from "../model/Section";
import {error} from "util";
import {type} from "os";
import sort = require("core-js/fn/array/sort");
import Room from "../model/Room";

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

            rooms_lat?: number;
            rooms_lon?: number;
            rooms_seats?: number;
        }

        MIN?: {
            courses_avg?: number;
            courses_pass?: number;
            courses_fail?: number;
            courses_audit?: number;

            rooms_lat?: number;
            rooms_lon?: number;
            rooms_seats?: number;
        }

        AVG?: {
            courses_avg?: number;
            courses_pass?: number;
            courses_fail?: number;
            courses_audit?: number;

            rooms_lat?: number;
            rooms_lon?: number;
            rooms_seats?: number;
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

            rooms_fullname?: string;
            rooms_shortname?: string;
            rooms_number?: string;
            rooms_name?: string;
            rooms_address?: string;
            rooms_lat?: number;
            rooms_lon?: number;
            rooms_seats?: number;
            rooms_type?: string;
            rooms_furniture?: string;
            rooms_href?: string;
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

        rooms_fullname?: string;
        rooms_shortname?: string;
        rooms_number?: string;
        rooms_name?: string;
        rooms_address?: string;
        rooms_type?: string;
        rooms_furniture?: string;
        rooms_href?: string;
    }

    OR?:QueryBody[];
    AND?:QueryBody[];
    GT?: {
        courses_avg?: number;
        courses_pass?: number;
        courses_fail?: number;
        courses_audit?: number;

        rooms_lat?: number;
        rooms_lon?: number;
        rooms_seats?: number;

    };
    LT?: {
        courses_avg?: number;
        courses_pass?: number;
        courses_fail?: number;
        courses_audit?: number;

        rooms_lat?: number;
        rooms_lon?: number;
        rooms_seats?: number;
    };
    EQ?:{
        courses_avg?: number;
        courses_pass?: number;
        courses_fail?: number;
        courses_audit?: number;
        courses_id?: string;

        rooms_lat?: number;
        rooms_lon?: number;
        rooms_seats?: number;
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

    rooms_fullname?: string;
    rooms_shortname?: string;
    rooms_number?: string;
    rooms_name?: string;
    rooms_address?: string;
    rooms_type?: string;
    rooms_furniture?: string;
    rooms_href?: string;
}

export interface GroupByDictionary {
    [id: string]: Result[];
}

export default class QueryController {
    private datasets: Datasets = null;
    private static datasetController = new DatasetController();
    private queryData: Section[]|Room[] = [];
    private datesetId: string;

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

        //Todo:
        this.datesetId = id;
        if (id === 'courses') {
            var sections: Section[] = this.datasets[id] as Section[];

            this.queryData = sections;

        } else if (id === 'rooms') {
            var rooms: Room[] = this.datasets[id] as Room[];

            this.queryData = rooms;

        } else {
            console.log('QueryController - performing dataset is neither course sections nor building rooms');
            throw 400;
        }

        //WHERE
        var jsonwhere = query.WHERE;
        var filteredDs: Section[]|Room[]  = this.filter(jsonwhere, sections);

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
    public groupBy(query: QueryRequest, array: Section[]|Room[]): {} {
        var groups: any = {};

        Log.info('QueryController::groupBy()...');

        Log.info('QueryController::groupBy() - array size = ' + array.length);

        var keys: string[] = this.getKeys(query);
        Log.info('QueryController::groupBy() - keys = ' + keys);


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
            for(var gk in query.GROUP) {
                var groupKey:string;
                if (this.datesetId === 'courses') {
                    groupKey = this.sectionTranslator(query.GROUP[gk]);
                } else if (this.datesetId === 'rooms') {
                    groupKey = this.roomTranslator(query.GROUP[gk]);
                } else {
                    throw 400;
                }
                var groupValue = groups[g][0][groupKey];
                groupResult[groupKey] = groupValue;
            }

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

            result.push(dictionary[key]);
        }

        Log.info('QueryController::dictToResults - result = ' + result.length);

        return result;
    }

    public getValues(preamble: string[], data: any): Array<any> {
        var result: any = [];

        if (this.datesetId === 'courses') {
            for (let p in preamble) {
                var key = this.sectionTranslator(preamble[p]);
                result.push(data[key]);
            }
        } else if (this.datesetId === 'rooms'){
            for (let p in preamble) {
                var key = this.roomTranslator(preamble[p]);
                result.push(data[key]);
            }
        } else {
            throw 400;
        }
        return result;
    }


    //Todo:
    //return the filtered dataset , section should be Section[]
    public filter(query: QueryBody, queryData: Section[]|Room[]): any
    {
        var filteredDs: Section[]|Room[] = [];
        var dataWithType:any;
        if (this.datesetId === 'courses'){
            dataWithType = queryData as Section[];
        } else if (this.datesetId === 'rooms'){
            dataWithType = queryData as Room[];
        } else {
            throw 400;
        }

        //var index = 0;
        if (Object.keys(query).length === 0) {
            return queryData;
        }

        for (let q in query)
        {
            Log.trace(q);
            switch (q)
            {
                case 'IS':
                    filteredDs = this.compareString(query, dataWithType);
                    break;
                case 'OR':
                    filteredDs = this.logicOr(query, dataWithType);
                    break;
                case 'AND':
                    filteredDs = this.logicAnd(query, dataWithType);
                    break;
                case 'GT':
                    filteredDs = this.greaterThan(query, dataWithType);
                    break;
                case 'LT':
                    filteredDs = this.lessThan(query, dataWithType);
                    break;
                case 'EQ':
                    filteredDs = this.equalTo(query, dataWithType);
                    break;
                case 'NOT':
                    filteredDs = this.negation(query, dataWithType);
                    break;
                default:
                    Log.trace("Undefined EBNF in WHERE");
                    throw new Error('Invalid Query');
            }
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
                    case 'rooms_fullname':
                    case 'rooms_shortname':
                    case 'rooms_number':
                    case 'rooms_name':
                    case 'rooms_address':
                    case 'rooms_type':
                    case 'rooms_furniture':
                    case 'rooms_href':
                    case 'rooms_lat':
                    case 'rooms_lon':
                    case 'rooms_seats':
                        result[preamble[p]] = sections[section][this.roomTranslator(preamble[p])];
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
            return that.basicOrder(orderKeys, a, b, direction, applyTerms);
        });

        result = selectedDs;
        return result;
    }

    //Todo: Add valid keys
    public basicOrder (order: string[], resultA:any, resultB:any, direction:string, applyTerms:string[]): number
    {
        //Log.trace('Comparing ' + resultA[order[0]] + " and " + resultB[order[0]]);

        var result: number;

        var position:number;

        if (direction === 'UP') {
            position = -1;
        } else {
            position = 1;
        }

        switch (order[0])
        {
            case 'courses_dept':
            case 'courses_id':
            case 'courses_instructor':
            case 'courses_title':
            case 'courses_uuid':
            case 'rooms_fullname':
            case 'rooms_shortname':
            case 'rooms_number':
            case 'rooms_name':
            case 'rooms_address':
            case 'rooms_type':
            case 'rooms_furniture':
            case 'rooms_href':

                if (resultA[order[0]] < resultB[order[0]])
                {
                    result = position;
                }
                if (resultA[order[0]] > resultB[order[0]])
                {
                    result = position * -1;
                }
                if (resultA[order[0]] === resultB[order[0]]) {
                    if (order.length > 1) {
                        var subOrder = order;
                        subOrder.splice(0, 1);
                        if (this.basicOrder(subOrder, resultA, resultB, direction, applyTerms) > 0) {
                            result = 1;
                        }
                        if (this.basicOrder(subOrder, resultA, resultB, direction, applyTerms) < 0) {
                            result = -1;
                        }
                        if (this.basicOrder(subOrder, resultA, resultB, direction, applyTerms) === 0){
                            result = 0;
                        }
                    } else {
                        result = 0;
                    }
                }
                break;
            case 'courses_avg':
            case 'courses_pass':
            case 'courses_fail':
            case 'courses_audit':
            case 'rooms_lat':
            case 'rooms_lon':
            case 'rooms_seats':
                result = (direction === 'UP')? resultA[order[0]]-resultB[order[0]]
                    : resultB[order[0]]-resultA[order[0]];

                if (result === 0 && order.length > 1) {
                    var subOrder = order;
                    subOrder.splice(0,1);
                    if (this.basicOrder(subOrder, resultA, resultB, direction, applyTerms) > 0){
                        result = 1;
                    }
                    if (this.basicOrder(subOrder, resultA, resultB, direction, applyTerms) < 0){
                        result = -1
                    }
                    if (this.basicOrder(subOrder, resultA, resultB, direction, applyTerms) === 0){
                        result = 0;
                    }
                }
                break;
            default:
                if(applyTerms.indexOf(order[0]) > -1) {
                    result = (direction === 'UP')? resultA[order[0]]-resultB[order[0]] : resultB[order[0]]-resultA[order[0]];

                    if (result === 0 && order.length > 1) {
                        var subOrder = order;
                        subOrder.splice(0,1)
                        if (this.basicOrder(subOrder, resultA, resultB, direction, applyTerms) > 0){
                            result = 1;
                        }
                        if (this.basicOrder(subOrder, resultA, resultB, direction, applyTerms) < 0){
                            result = -1
                        }
                        if (this.basicOrder(subOrder, resultA, resultB, direction, applyTerms) === 0){
                            result = 0;
                        }
                    }

                } else {
                    throw new Error('QueryController::Invalid OrderKey');
                }
        }

        return result;
    }


    //Todo: Change sections
    public logicOr (query: QueryBody, sections: Section[]|Room[]): Section[]|Room[]
    {
        var or: any = [];
        if (this.datesetId === 'courses') {
            or = or as Section[];
        } else if(this.datesetId === 'rooms') {
            or = or as Room[];
        } else {
            throw 400;
        }

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

    public logicAnd (query: QueryBody, sections: Section[]|Room[]): any
    {
        var and: Section[]|Room[] = sections;
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


    //get the object inseide GT, use key to iterate through sections to find targeted value and compare
    //if value is greater, add it to filteredData.
    //return filteredData
    public greaterThan (query: QueryBody, sections:Section[]|Room[]):any {

        var gtToken : any = query.GT;
        var comparedKey = Object.keys(gtToken);
        var comparedVal: number;

        var filteredDs:any = [];

        switch (comparedKey[0]) {
            case 'courses_avg':
            case 'courses_pass':
            case 'courses_fail':
            case 'courses_audit':
                var sectionKey = this.sectionTranslator(comparedKey[0]);

                comparedVal = gtToken[comparedKey[0]];

                for (var s in sections) {
                    var section : any = sections[s];
                    if (section[sectionKey] > comparedVal) {
                        filteredDs.push(section);
                    }
                }
                break;
            case 'rooms_lat':
            case 'rooms_lon':
            case 'rooms_seats':
                var sectionKey = this.roomTranslator(comparedKey[0]);

                comparedVal = gtToken[comparedKey[0]];

                for (var s in sections) {
                    var section : any = sections[s];
                    if (section[sectionKey] > comparedVal) {
                        filteredDs.push(section);
                    }
                }
                break;
            default:
                Log.error("Unexpected compare value");
                throw new Error('Invalid Query');
        }

        return filteredDs;
    }

    public lessThan (query: QueryBody, sections:Section[]|Room[]):any
    {
        var ltToken : any = query.LT;
        var comparedKey = Object.keys(ltToken);
        var comparedVal: number;

        var filteredDs:any = [];

        switch (comparedKey[0])
        {
            case 'courses_avg':
            case 'courses_pass':
            case 'courses_fail':
            case 'courses_audit':
                var sectionKey = this.sectionTranslator(comparedKey[0]);

                comparedVal = ltToken[comparedKey[0]];

                for (var s in sections) {
                    var section : any = sections[s];
                    if (section[sectionKey] < comparedVal) {
                        filteredDs.push(section);
                    }
                }
                break;
            case 'rooms_lat':
            case 'rooms_lon':
            case 'rooms_seats':
                var sectionKey = this.roomTranslator(comparedKey[0]);

                comparedVal = ltToken[comparedKey[0]];

                for (var s in sections) {
                    var section : any = sections[s];
                    if (section[sectionKey] < comparedVal) {
                        filteredDs.push(section);
                    }
                }
                break;
            default:
                Log.error("Unexpected compare value");
                throw new Error('Invalid Query');
        }

        return filteredDs;
    }

    public equalTo (query: QueryBody, sections:Section[]|Room[]):any
    {
        var eqToken : any = query.EQ;
        var comparedKey = Object.keys(eqToken);
        var comparedVal: string | number;

        var filteredDs:Section[] = [];
        switch (comparedKey[0])
        {
            case 'courses_avg':
            case 'courses_pass':
            case 'courses_fail':
            case  'courses_audit':
                var sectionKey = this.sectionTranslator(comparedKey[0]);

                comparedVal = eqToken[comparedKey[0]];

                for (var s in sections) {
                    var section : any = sections[s];
                    if (section[sectionKey] == comparedVal) {
                        filteredDs.push(section);
                    }
                }
                break;
            case 'rooms_lat':
            case 'rooms_lon':
            case 'rooms_seats':
                var sectionKey = this.roomTranslator(comparedKey[0]);

                comparedVal = eqToken[comparedKey[0]];

                for (var s in sections) {
                    var section : any = sections[s];
                    if (section[sectionKey] == comparedVal) {
                        filteredDs.push(section);
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

        return filteredDs;
    }

    public compareString(query: QueryBody, sections:Section[]|Room[]): Section[]|Room[]
    {
        var isToken : any = query.IS;
        var comparedKey = Object.keys(isToken);
        var comparedVal: string;

        var filteredDs:any = [];

        switch (comparedKey[0])
        {
            case 'courses_dept':
            case 'courses_title':
            case 'courses_instructor':
            case 'courses_id':
            case 'courses_uuid':
                var sectionKey = this.sectionTranslator(comparedKey[0]);

                comparedVal = isToken[comparedKey[0]];

                for (var s in sections) {
                    var section : any = sections[s];
                    var ifContains: Boolean = this.compareStringHelper(section[sectionKey], comparedVal);

                    if (ifContains) {
                        filteredDs.push(section);
                    }
                }
                break;
            case 'rooms_fullname':
            case 'rooms_shortname':
            case 'rooms_number':
            case 'rooms_name':
            case 'rooms_address':
            case 'rooms_type':
            case 'rooms_furniture':
            case 'rooms_href':
                var sectionKey = this.roomTranslator(comparedKey[0]);

                comparedVal = isToken[comparedKey[0]];

                for (var s in sections) {
                    var section : any = sections[s];
                    var ifContains: Boolean = this.compareStringHelper(section[sectionKey], comparedVal);

                    if (ifContains) {
                        filteredDs.push(section);
                    }
                }
                break;
            default:
                Log.error("Unexpected compare value");
                throw new Error('Invalid Query');
        }

        return filteredDs;
    }

    public negation (query: QueryBody, sections:Section[]|Room[]): Section[]|Room[]
    {
        var filteredDs = this.filter(query.NOT, sections);
        var filteredId: string[] = [];
        var result: any;

        if (this.datesetId === 'courses'){
            for (var s in filteredDs) {
                var sectionType = filteredDs[s] as Section;
                filteredId.push(sectionType.id);
            }
            var tempSection = sections as Section[];
            var negatedSection =  tempSection.filter(function (el:any) {
                return filteredId.indexOf(el['id']) > -1;
            });
            result = negatedSection;

        } else if (this.datesetId === 'rooms') {
            for (var s in filteredDs) {
                var roomType = filteredDs[s] as Room;
                filteredId.push(roomType.Number);
            }
            var tempRooms = sections as Room[];
            var negatedRoom = tempRooms.filter(function (el:any) {
                return filteredId.indexOf(el['Number']) > -1;
            });

            result = negatedRoom;
        } else {
                throw 400;
        }

        return result;
    }

    public removeDuplicate (dupArray: Array<any>):Array<any>
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

    //Todo: Change sections
    private max(sections: Section[]|Room[], key:string):number {
        var numArray : number[] = [];
        var transKey : string;
        if (this.datesetId === 'courses') {
            transKey = this.sectionTranslator(key);
        } else if (this.datesetId === 'rooms') {
            transKey = this.roomTranslator(key);
        } else {
            throw 400;
        }

        for (var s in sections) {
            var section: any = sections[s];
            numArray.push(section[transKey]);
        }

        var maxNum = Math.max.apply(null, numArray);

        return maxNum;
    }

    private min(sections: Section[]|Room[], key:string):number {
        var numArray : number[] = [];

        var transKey : string;
        if (this.datesetId === 'courses') {
            transKey = this.sectionTranslator(key);
        } else if (this.datesetId === 'rooms') {
            transKey = this.roomTranslator(key);
        } else {
            throw 400;
        }

        for (var s in sections) {
            var section: any = sections[s];
            numArray.push(section[transKey]);
        }

        var mimNum = Math.min.apply(null, numArray);

        return mimNum;
    }

    private avg(sections: Section[]|Room[], key:string):number {
        var sum: number = 0;

        var transKey : string;
        if (this.datesetId === 'courses') {
            transKey = this.sectionTranslator(key);
        } else if (this.datesetId === 'rooms') {
            transKey = this.roomTranslator(key);
        } else {
            throw 400;
        }

        for (var s in sections) {
            var section: any = sections[s];
            sum += section[transKey];
        }

        var sectionNum = sections.length;
        var avg = Math.round((sum/sectionNum) * 1e2) /1e2;
        return avg;
    }

    private count(sections: Section[]|Room[], key:string):number {
        var array: Array<any> = [];

        var transKey : string;
        if (this.datesetId === 'courses') {
            transKey = this.sectionTranslator(key);
        } else if (this.datesetId === 'rooms') {
            transKey = this.roomTranslator(key);
        } else {
            throw 400;
        }

        for (var s in sections) {
            var section: any = sections[s];
            if( array.indexOf(section[transKey]) === -1) {
                array.push(section[transKey]);
            }
        }
        return array.length;
    }

    //Translate query to what section can understand
    private roomTranslator(key: string) : string {

        var translated: string = key;

        switch (key) {
            case 'rooms_fullname':
                translated = "FullName";
                break;
            case 'rooms_shortname':
                translated = "ShortName";
                break;
            case 'rooms_number':
                translated = "Number";
                break;
            case 'rooms_name':
                translated = "Name";
                break;
            case 'rooms_address':
                translated = "Address";
                break;
            case 'rooms_lat':
                translated = "Latitude";
                break;
            case 'rooms_lon':
                translated = "Longitude";
                break;
            case 'rooms_seats':
                translated = "Seats";
                break;
            case 'rooms_type':
                translated = "Type";
                break;
            case 'rooms_furniture':
                translated = "Furniture";
                break;
            case 'rooms_href':
                translated = "href";
                break;
            default:
                throw new Error('QueryController:: Invalid Query Key');
        }

        return translated;
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