/**
 * Created by rtholmes on 15-10-31.
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
        let query:QueryRequest = {query: 'my question', ts: new Date().getTime()};
        let controller = new QueryController();
        let isValid = controller.isValid(query);

        expect(isValid).to.be.true;
    });

    it("Should be able to invalidate an invalid query", function () {
        let query:any = {query: 'my question'}; // missing ts
        let controller = new QueryController();
        let isValid = controller.isValid(query);

        expect(isValid).to.be.false;
    });

    it("Should be able to query", function () {
        let d = new Date();
        let query:QueryRequest = {query: 'my question', ts: d.getTime()};
        let controller = new QueryController();
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        expect(ret.ts).to.be.equal(d.getTime());
    });

    /*
    it("Should be able to handle null", function () {
        let txt:string = null;
        let ret = EchoController.echo(txt);
        Log.test('In: ' + txt + ', out: ' + ret);
        expect(ret).not.to.be.equal(null);
        expect(ret).to.equal('');
    });

    it("Should be able to handle silence", function () {
        let txt = '';
        let ret = EchoController.echo(txt);
        Log.test('In: ' + txt + ', out: ' + ret);
        expect(ret).not.to.be.equal(null);
        expect(ret).to.equal('');
    });
    */
});