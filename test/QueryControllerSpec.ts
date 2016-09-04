/**
 * Created by rtholmes on 2016-10-31.
 */

import Log from "../src/Util";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";

var expect = require('chai').expect;
describe("QueryController", function () {

    beforeEach(function () {

    });

    afterEach(function () {

    });

    it("Should be able to validate a valid query", function () {
        let query: QueryRequest = {GET: 'food', WHERE: {IS: 'apple'}, AS: 'table'};
        let controller = new QueryController();
        let isValid = controller.isValid(query);

        expect(isValid).to.be.true;
    });

    it("Should be able to invalidate an invalid query", function () {
        let query: any = null;
        let controller = new QueryController();
        let isValid = controller.isValid(query);

        expect(isValid).to.be.false;
    });

    it("Should be able to query", function () {
        let d = new Date();
        let query: QueryRequest = {GET: 'food', WHERE: {IS: 'apple'}, AS: 'table'};
        let controller = new QueryController();
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        // should check that the value is meaningful
    });

});