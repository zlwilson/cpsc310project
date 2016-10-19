/**
 * Created by rtholmes on 2016-10-31.
 */

import {Datasets, default as DatasetController} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";
import JSZip = require('jszip');

import {expect} from 'chai';
describe("QueryController", function () {

    beforeEach(function () {
        Log.test('Creating dataset - sections');
        let content = {key: 'value'};
        let zip = new JSZip();
        var section1 = JSON.stringify({ "result": [{
            "tier_eighty_five": 9,
            "tier_ninety": 4,
            "Title": "adul educ",
            "Section": "63a",
            "Detail": "",
            "tier_seventy_two": 0,
            "Other": 0,
            "Low": 78,
            "tier_sixty_four": 0,
            "id": 245,
            "tier_sixty_eight": 0,
            "tier_zero": 0,
            "tier_seventy_six": 1,
            "tier_thirty": 0,
            "tier_fifty": 0,
            "Professor": "palacios, carolina",
            "Audit": 0,
            "tier_g_fifty": 0,
            "tier_forty": 0,
            "Withdrew": 1,
            "Year": "2011",
            "tier_twenty": 0,
            "Stddev": 3.71,
            "Enrolled": 25,
            "tier_fifty_five": 0,
            "tier_eighty": 10,
            "tier_sixty": 0,
            "tier_ten": 0,
            "High": 91,
            "Course": "412",
            "Session": "w",
            "Pass": 24,
            "Fail": 0,
            "Avg": 85.29,
            "Campus": "ubc",
            "Subject": "adhe"
        }, {
            "tier_eighty_five": 4,
            "tier_ninety": 3,
            "Title": "adul educ",
            "Section": "63c",
            "Detail": "",
            "tier_seventy_two": 3,
            "Other": 0,
            "Low": 64,
            "tier_sixty_four": 1,
            "id": 246,
            "tier_sixty_eight": 2,
            "tier_zero": 0,
            "tier_seventy_six": 3,
            "tier_thirty": 0,
            "tier_fifty": 0,
            "Professor": "palacios, carolina",
            "Audit": 0,
            "tier_g_fifty": 0,
            "tier_forty": 0,
            "Withdrew": 1,
            "Year": "2011",
            "tier_twenty": 0,
            "Stddev": 7.68,
            "Enrolled": 24,
            "tier_fifty_five": 0,
            "tier_eighty": 6,
            "tier_sixty": 0,
            "tier_ten": 0,
            "High": 93,
            "Course": "412",
            "Session": "w",
            "Pass": 22,
            "Fail": 0,
            "Avg": 80.55,
            "Campus": "ubc",
            "Subject": "adhe"
        }, {
            "tier_eighty_five": 13,
            "tier_ninety": 7,
            "Title": "adul educ",
            "Section": "overall",
            "Detail": "",
            "tier_seventy_two": 3,
            "Other": 0,
            "Low": 64,
            "tier_sixty_four": 1,
            "id": 247,
            "tier_sixty_eight": 2,
            "tier_zero": 0,
            "tier_seventy_six": 4,
            "tier_thirty": 0,
            "tier_fifty": 0,
            "Professor": "",
            "Audit": 0,
            "tier_g_fifty": 0,
            "tier_forty": 0,
            "Withdrew": 2,
            "Year": "2011",
            "tier_twenty": 0,
            "Stddev": 6.35,
            "Enrolled": 49,
            "tier_fifty_five": 0,
            "tier_eighty": 16,
            "tier_sixty": 0,
            "tier_ten": 0,
            "High": 93,
            "Course": "412",
            "Session": "w",
            "Pass": 46,
            "Fail": 0,
            "Avg": 83.02,
            "Campus": "ubc",
            "Subject": "adhe"
        }, {
            "tier_eighty_five": 2,
            "tier_ninety": 2,
            "Title": "adul educ",
            "Section": "63a",
            "Detail": "",
            "tier_seventy_two": 0,
            "Other": 0,
            "Low": 81,
            "tier_sixty_four": 0,
            "id": 15010,
            "tier_sixty_eight": 0,
            "tier_zero": 0,
            "tier_seventy_six": 0,
            "tier_thirty": 0,
            "tier_fifty": 0,
            "Professor": "falk, clifford",
            "Audit": 0,
            "tier_g_fifty": 0,
            "tier_forty": 0,
            "Withdrew": 2,
            "Year": "2010",
            "tier_twenty": 0,
            "Stddev": 5.32,
            "Enrolled": 11,
            "tier_fifty_five": 0,
            "tier_eighty": 5,
            "tier_sixty": 0,
            "tier_ten": 0,
            "High": 95,
            "Course": "412",
            "Session": "w",
            "Pass": 9,
            "Fail": 0,
            "Avg": 86.33,
            "Campus": "ubc",
            "Subject": "adhe"
        }],
            "rank": 376
        });
        var section2 = JSON.stringify({
            "result": [{
                "tier_eighty_five": 9,
                "tier_ninety": 4,
                "Title": "adul educ",
                "Section": "63a",
                "Detail": "",
                "tier_seventy_two": 0,
                "Other": 0,
                "Low": 78,
                "tier_sixty_four": 0,
                "id": 245,
                "tier_sixty_eight": 0,
                "tier_zero": 0,
                "tier_seventy_six": 1,
                "tier_thirty": 0,
                "tier_fifty": 0,
                "Professor": "palacios, carolina",
                "Audit": 0,
                "tier_g_fifty": 0,
                "tier_forty": 0,
                "Withdrew": 1,
                "Year": "2011",
                "tier_twenty": 0,
                "Stddev": 3.71,
                "Enrolled": 25,
                "tier_fifty_five": 0,
                "tier_eighty": 10,
                "tier_sixty": 0,
                "tier_ten": 0,
                "High": 91,
                "Course": "412",
                "Session": "w",
                "Pass": 24,
                "Fail": 0,
                "Avg": 85.29,
                "Campus": "ubc",
                "Subject": "adhe"
            }],
            "rank": 376
        });
        zip.file('section1.obj', section1);
        zip.file('section2.obj', section2);
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            let controller = new DatasetController();
            return controller.process('sections', data);
        }).then(function (result) {
            Log.test('Dataset processed; result: ' + result);
        });
    });

    afterEach(function () {
    });

    it("Should be able to invalidate an invalid query", function () {
        let query: any = null;
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    it("Should be able to validate the simple example query from D1", function () {
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_avg'],
            WHERE: {
                'GT': {'courses_avg': 90}
            },
            ORDER: 'course_avg',
            VIEW: {
                AS: 'table'
            }
        };
        // let datasets: Datasets = DatasetController.getDataset();
        let datasets: Datasets = {};
        let controller = new QueryController(datasets);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });
});
