 /**
 * Created by Lo on 2016-10-16.
 */

import fs = require('fs');
import Log from "../src/Util";
import {expect} from 'chai';
import JSZip = require('jszip');
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import {QueryRequest} from "../src/controller/QueryController";

describe("InsightController", function () {

    var zipFileContents: string = null;
    var zipHtmlContents: string = null;
    var facade: InsightFacade = null;

    before(function () {
        Log.info('InsightController::before() - start');
        // this zip might be in a different spot for you
        zipFileContents = new Buffer(fs.readFileSync('310courses.1.0.zip')).toString('base64');
        zipHtmlContents = new Buffer(fs.readFileSync('310rooms.1.1.zip')).toString('base64');
        try {
            // what you delete here is going to depend on your impl, just make sure
            // all of your temporary files and directories are deleted
            fs.rmdirSync('data/');
        } catch (err) {
            // silently fail, but don't crash; this is fine
            Log.warn('InsightController::before() - /data not removed (probably not present)');
        }

        Log.info('InsightController::before() - done');
    });

    beforeEach(function () {
        facade = new InsightFacade();
    });

    // Dataset tests

    it("Should be able to delete a dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.removeDataset('courses').then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('This should not happen');
        });
    });

    it("Should be able to add a new dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', zipFileContents).then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('This should not happen');
        });
    });

    it("Should be able to add a new dataset with html content (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('rooms', zipHtmlContents).then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightFacade) {
            expect.fail('This should not happen');
        });
    });

    it("Should be able to update an existing dataset (201)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', zipFileContents).then(function (response: InsightResponse) {
            expect(response.code).to.equal(201);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should not be able to add an invalid dataset (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', 'some random bytes').then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should not be able to add a dataset without id (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('', zipFileContents).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should not be able to delete a dataset without id (404)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.removeDataset('').then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(404);
        });
    });

    // Query tests of math functions over courses_avg

    it("Should be able to answer a valid GT query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_avg'],
            WHERE: {
                'GT': {'courses_avg': 90}
            },
            ORDER: 'courses_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid LT query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_avg'],
            WHERE: {
                'GT': {'courses_avg': 50}
            },
            ORDER: 'courses_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid EQ query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_avg'],
            WHERE: {
                'EQ': {'courses_avg': 90}
            },
            ORDER: 'courses_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    // Extra tests for coverage

    it("Should be able to query on courses_pass EQ (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_pass'],
            WHERE: {
                'EQ': {'courses_pass': 90}
            },
            ORDER: 'courses_pass',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on courses_pass LT (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_pass'],
            WHERE: {
                'LT': {'courses_pass': 50}
            },
            ORDER: 'courses_pass',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on courses_pass GT (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_pass'],
            WHERE: {
                'GT': {'courses_pass': 90}
            },
            ORDER: 'courses_pass',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on courses_fail EQ (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_fail'],
            WHERE: {
                'EQ': {'courses_fail': 50}
            },
            ORDER: 'courses_fail',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on courses_fail LT (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_fail'],
            WHERE: {
                'LT': {'courses_fail': 40}
            },
            ORDER: 'courses_fail',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on courses_fail GT (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_fail'],
            WHERE: {
                'GT': {'courses_fail': 50}
            },
            ORDER: 'courses_fail',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on courses_audit GT (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_audit'],
            WHERE: {
                'GT': {'courses_audit': 8}
            },
            ORDER: 'courses_audit',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on courses_audit LT (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_audit'],
            WHERE: {
                'LT': {'courses_audit': 2}
            },
            ORDER: 'courses_audit',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on courses_audit EQ (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_audit'],
            WHERE: {
                'EQ': {'courses_audit': 2}
            },
            ORDER: 'courses_audit',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on courses_dept (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_avg'],
            WHERE: {
                'IS': {'courses_dept': 'cpsc'}
            },
            ORDER: 'courses_dept',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on courses_uuid IS (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_uuid'],
            WHERE: {
                'IS': {'courses_uuid': ''}
            },
            ORDER: 'courses_uuid',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on courses_year EQ (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_year'],
            WHERE: {
                'EQ': {'courses_year': 2012}
            },
            ORDER: 'courses_year',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    // Todo: make this test more robust
    it("Should be able to query on courses_instructor (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_instructor'],
            WHERE: {
                'IS': {'courses_instructor': 'Murphy, Gail '}
            },
            ORDER: 'courses_instructor',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    // Todo: make this test more robust
    it("Should be able to query on courses_title (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_title'],
            WHERE: {
                'IS': {'courses_title': 'intro'}
            },
            ORDER: 'courses_title',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on courses_id (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_id'],
            WHERE: {
                'IS': {'courses_id': '100'}
            },
            ORDER: 'courses_id',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    // Query tests of NOT math functions over courses_avg

    it("Should be able to answer a valid NOT EQ query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_avg'],
            WHERE: {
                NOT: {
                    'EQ': {'courses_avg': 90}
                }
            },
            ORDER: 'courses_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid NOT LT query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_avg'],
            WHERE: {
                NOT: {
                    'LT': {'courses_avg': 90}
                }
            },
            ORDER: 'courses_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid NOT GT query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_avg'],
            WHERE: {
                NOT: {
                    'GT': {'courses_avg': 50}
                }
            },
            ORDER: 'courses_avg',
                AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    // Query tests for logical operators

    it("Should be able to answer a valid OR query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_avg'],
            WHERE: {
                OR: [
                    {"EQ": {"courses_avg": 60}},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            ORDER: 'courses_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid AND query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept', 'courses_avg'],
            WHERE: {
                AND: [
                    {"IS": {"courses_dept": "adhe"}},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            ORDER: 'courses_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    // Other complex query tests

    it("Should be able to answer the complex query from D1 (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_dept", "courses_id", "courses_avg"],
            WHERE: {
                OR: [
                    { AND: [
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "adhe"}}
                    ]},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            ORDER: "courses_avg",
            AS: "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    //Commented out, as in the instruction, it says no two different datasets will be given in one query
    // it("Should be able to query across two datasets (200)", function () {
    //     var that = this;
    //     Log.trace("Starting test: " + that.test.title);
    //     let query: QueryRequest = {
    //         GET:  ['sections_dept', 'sections_avg', 'courses_dept', 'courses_avg'],
    //         WHERE: {
    //             'GT': {'courses_avg': 90}
    //         },
    //         ORDER: 'courses_avg',
    //         AS: 'table'
    //     };
    //     return facade.performQuery(query).then(function (response: InsightResponse) {
    //         expect(response.code).to.equal(200);
    //     }).catch(function (response: InsightResponse) {
    //         expect.fail('Should not happen');
    //     });
    // });

    // Invalid query tests

    it("Should return 424 when dataset(s) missing (424)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['missing_dept', 'missing_avg'],
            WHERE: {
                'GT': {'courses_avg': 90}
            },
            ORDER: 'missing_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
        });
    });

    it("Should return a list of all missing datasets (424)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['missing_dept', 'other_avg'],
            WHERE: {
                'GT': {'courses_avg': 90}
            },
            ORDER: 'other_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.body).to.equal("{ missing: " + [' missing', 'other'] + "}");
        });
    });

    it("Should invalidate an invalid query (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['invalid querry', 'other_avg'],
            WHERE: {
                'GT': {'courses_avg': 90}
            },
            ORDER: 'missing_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should invalidate a null query (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: any = null;
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should invalidate an query with invalid order(400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_dept'],
            WHERE: {
                OR: [
                    {"EQ": {"courses_avg": 60}},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            ORDER: 'courses_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should invalidate an query with random string(400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: any = "haha"
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should invalidate an query without GET(400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: any =  {
            WHERE: {
                'GT': {'courses_avg': 90}
            },
            ORDER: 'courses_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should invalidate an query without WHERE(400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: any =  {
            GET:  ['courses_dept', 'courses_avg'],
            ORDER: 'courses_avg',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should invalidate an query without AS(400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: any = {
            GET:  ['courses_dept', 'courses_avg'],
            WHERE: {
                'GT': {'courses_avg': 90}
            },
            ORDER: 'courses_avg',
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should invalidate an query with empty GET (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: any = {
            GET: null,
            WHERE: {
                'GT': {'courses_avg': 90}
            },
            ORDER: 'courses_avg',
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should invalidate an query with invalid GET (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: any = {
            GET: ['coursesdept', 'coursesavg'],
            WHERE: {
                'GT': {'courses_avg': 90}
            },
            ORDER: 'courses_avg',
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    // More valid query tests

    it("Should be able to answer a valid OR query with a string inside GET(200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  'courses_dept',
            WHERE: {
                OR: [
                    {"EQ": {"courses_avg": 60}},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            ORDER: 'courses_dept',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid OR query without ORDER (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  'courses_dept',
            WHERE: {
                OR: [
                    {"EQ": {"courses_avg": 60}},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid IS query without * (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  'courses_dept',
            WHERE: {
                IS: {"courses_dept": "adhe"}
            },
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid IS query with * at the beginning (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  'courses_dept',
            WHERE: {
                IS: {"courses_dept": "*sc"}
            },
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid IS query with * at the end(200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  'courses_dept',
            WHERE: {
                IS: {"courses_dept": "cp*"}
            },
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid IS query with * at both the beginning and the end(200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  'courses_dept',
            WHERE: {
                IS: {"courses_dept": "*ps*"}
            },
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    // Deliverable 2 tests

    it("Should invalidate an query with GROUP but no APPLY (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: any = {
            GET:  ['courses_id', 'courses_avg'],
            WHERE: {
                IS: {"courses_dept": "cpsc"}
            },
            GROUP: ['courses_id'],
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should be able to answer a valid APPLY MAX courses_avg (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_id', 'maxAvg'],
            WHERE: {
                IS: {"courses_dept": "cpsc"}
            },
            GROUP: ['courses_id'],
            APPLY: [{'maxAvg':{'MAX':"courses_avg"}}],
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid GROUP & APPLY MIN courses_id query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_id', 'minAvg'],
            WHERE: {
                IS: {"courses_dept": "cpsc"}
            },
            GROUP: ['courses_id'],
            APPLY: [{'minAvg':{'MIN':"courses_avg"}}],
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid GROUP BY courses_dept and courses_avg and APPLY COUNT query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_id', 'courses_avg', 'courses_dept', 'countProf'],
            WHERE: {
                IS: {"courses_dept": "cpsc"}
            },
            GROUP: ['courses_dept', 'courses_avg'],
            APPLY: [{'countProf':{'COUNT':"courses_instructor"}}],
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid GROUP BY courses_dept and courses_avg and APPLY COUNT query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET: ["courses_id", "courseAverage"],
            WHERE: {
                IS: {"courses_dept": "cpsc"}
            },
            GROUP: [ "courses_id" ],
            APPLY: [ {"courseAverage": {"AVG": "courses_avg"}} ],
            ORDER: { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            AS:"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid GROUP BY courses_instructor query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_instructor', 'courses_avg', 'countProf'],
            WHERE: {
                IS: {"courses_dept": "cpsc"}
            },
            GROUP: ['courses_instructor'],
            APPLY: [{'countProf':{'COUNT':"courses_instructor"}}],
            AS: 'TABLE'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid GROUP BY courses_pass (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_pass', 'minPass'],
            WHERE: {
                IS: {"courses_dept": "cpsc"}
            },
            GROUP: ['courses_pass'],
            APPLY: [{'minPass':{'MIN':"courses_pass"}}],
            AS: 'TABLE'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid GROUP BY courses_fail (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_fail', 'minFail'],
            WHERE: {
                IS: {"courses_dept": "cpsc"}
            },
            GROUP: ['courses_fail'],
            APPLY: [{'minFail':{'MIN':"courses_fail"}}],
            AS: 'TABLE'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid GROUP BY courses_audit (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['courses_audit', 'minAudit'],
            WHERE: {
                IS: {"courses_dept": "cpsc"}
            },
            GROUP: ['courses_audit'],
            APPLY: [{'minAudit':{'MIN':"courses_audit"}}],
            AS: 'TABLE'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    // D3 tests on room keys

    it("Should be able to query on rooms_seats GT (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_fullname", "rooms_number"],
            WHERE: {
                'GT': {'rooms_seats': 100}
            },
            ORDER: 'rooms_number',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on rooms_seats LT (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_fullname", "rooms_number"],
            WHERE: {
                'LT': {'rooms_seats': 30}
            },
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on rooms_seats EQ (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_fullname", "rooms_number"],
            WHERE: {
                'EQ': {'rooms_seats': 20}
            },
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to answer a valid NOT EQ query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_fullname", "rooms_number"],
            WHERE: {
                NOT: {
                    'EQ': {'rooms_seats': 90}
                }
            },
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    // valid lat lon data for tests: lat: 49.26973, lon: -123.25504

    it("Should be able to query on rooms_lat EQ (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_fullname", "rooms_number", 'rooms_lat'],
            WHERE: {
                'EQ': {'rooms_lat': 49.26973}
            },
            ORDER: 'rooms_lat',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on rooms_lat GT (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_fullname", "rooms_number", 'rooms_lat'],
            WHERE: {
                'GT': {'rooms_lat': 49.26973}
            },
            ORDER: 'rooms_lat',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on rooms_lat LT (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_fullname", "rooms_number", 'rooms_lat'],
            WHERE: {
                'LT': {'rooms_lat': 49.26973}
            },
            ORDER: 'rooms_lat',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on rooms_lon GT (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_fullname", "rooms_number", 'rooms_lon'],
            WHERE: {
                'GT': {'rooms_lon': -123.25504}
            },
            ORDER: 'rooms_lon',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on rooms_lon LT (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_fullname", "rooms_number", 'rooms_lon'],
            WHERE: {
                'LT': {'rooms_lon': -123.25504}
            },
            ORDER: 'rooms_lon',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on rooms_lon EQ (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_fullname", "rooms_number", 'rooms_lon'],
            WHERE: {
                'EQ': {'rooms_lon': -123.25504}
            },
            ORDER: 'rooms_lon',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on rooms_fullname (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_fullname", "rooms_number"],
            WHERE: {
                'IS': {'rooms_fullname': 'Hugh Dempster Pavilion'}
            },
            ORDER: 'rooms_number',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on rooms_number (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_fullname", "rooms_number"],
            WHERE: {
                'IS': {'rooms_number': '100'}
            },
            ORDER: 'rooms_fullname',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on rooms_shortname (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_shortname", "rooms_number"],
            WHERE: {
                'IS': {'rooms_shortname': 'DMP'}
            },
            ORDER: 'rooms_number',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on rooms_name (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_name", "rooms_furniture"],
            WHERE: {
                'IS': {'rooms_name': 'DMP_110'}
            },
            ORDER: 'rooms_name',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on rooms_address (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_address", "rooms_name"],
            WHERE: {
                'IS': {'rooms_address': '2202 Main Mall'}
            },
            ORDER: 'rooms_name',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on rooms_furniture (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_name", "rooms_furniture"],
            WHERE: {
                'IS': {'rooms_furniture': 'Classroom-Movable Tables & Chairs'}
            },
            ORDER: 'rooms_name',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on rooms_type (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_name", "rooms_type"],
            WHERE: {
                'IS': {'rooms_type': 'Open Design General Purpose'}
            },
            ORDER: 'rooms_name',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query on rooms_href (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ["rooms_name", "rooms_type", "rooms_href"],
            WHERE: {
                'IS': {'rooms_href': 'http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ALRD-112'}
            },
            ORDER: 'rooms_href',
            AS: 'table'
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });
});