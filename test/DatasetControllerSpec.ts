/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../src/Util";
import DatasetController from "../src/controller/DatasetController";

import JSZip = require('jszip');

var expect = require('chai').expect;
describe("DatasetController", function () {

    beforeEach(function () {

    });

    afterEach(function () {

    });

    it("Should be able to receive a Dataset", function () {
        Log.test('Creating dataset');
        let content = {key: 'value'};
        let zip = new JSZip();
        zip.file('content.obj', JSON.stringify(content));
        var opts = {
            type: 'base64', compression: 'deflate', compressionOptions: {level: 2}
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            let controller = new DatasetController();
            return controller.process('setA', data);
        }).then(function (result) {
            Log.test('Dataset processed; result: ' + result);
            expect(result).to.be.true;
        });

    });

});