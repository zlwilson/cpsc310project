/**
 * Created by rtholmes on 2016-10-31.
 */

import {Datasets, default as DatasetController} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";

import {expect} from 'chai';
describe("QueryController", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    // it("Should be able to validate a valid query", function () {
    //     // NOTE: this is not actually a valid query for D1
    //     let query: QueryRequest = {GET: 'food', WHERE: {IS: 'apple'}, ORDER: 'food', AS: 'table'};
    //     let dataset: Datasets = {};
    //     let controller = new QueryController(dataset);
    //     let isValid = controller.isValid(query);
    //
    //     expect(isValid).to.equal(true);
    // });
    //
    // it("Should be able to invalidate an invalid query", function () {
    //     let query: any = null;
    //     let dataset: Datasets = {};
    //     let controller = new QueryController(dataset);
    //     let isValid = controller.isValid(query);
    //
    //     expect(isValid).to.equal(false);
    // });

});
