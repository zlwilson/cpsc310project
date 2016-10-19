/**
 * Created by Lo on 2016-10-16.
 */
import fs = require('fs');
import Log from "../src/Util";
import {expect} from 'chai';
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import {QueryRequest} from "../src/controller/QueryController";

describe("InsightController", function () {

    var zipFileContents: string = null;
    var facade: InsightFacade = null;
    before(function () {
        Log.info('InsightController::before() - start');
        // this zip might be in a different spot for you
        zipFileContents = new Buffer(fs.readFileSync('310courses.1.0.zip')).toString('base64');
        try {
            // what you delete here is going to depend on your impl, just make sure
            // all of your temporary files and directories are deleted
            fs.unlinkSync('./id.json');
        } catch (err) {
            // silently fail, but don't crash; this is fine
            Log.warn('InsightController::before() - id.json not removed (probably not present)');
        }
        Log.info('InsightController::before() - done');
    });

    beforeEach(function () {
        facade = new InsightFacade();
    });

    // Dataset tests

    it("Should be able to add a add a new dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', zipFileContents).then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
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

    // Query tests of math functions over courses_avg

    it("Should be able to answer a valid GT query (200)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
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
            ORDER: 'course_avg',
            VIEW: {
                AS: 'table'
            }
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
            ORDER: 'course_avg',
            VIEW: {
                AS: 'table'
            }
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
            ORDER: 'course_avg',
            VIEW: {
                AS: 'table'
            }
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
            ORDER: 'course_avg',
            VIEW: {
                AS: 'table'
            }
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
                    'LT': {'courses_avg': 50}
                }
            },
            ORDER: 'course_avg',
            VIEW: {
                AS: 'table'
            }
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
            ORDER: 'course_avg',
            VIEW: {
                AS: 'table'
            }
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
            ORDER: 'course_avg',
            VIEW: {
                AS: 'table'
            }
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
            VIEW: {
                AS: "TABLE"
            }
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    // Invalid query tests

    it("Should return a list of all missing datasets (424)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query: QueryRequest = {
            GET:  ['missing_dept', 'other_avg'],
            WHERE: {
                'GT': {'courses_avg': 90}
            },
            ORDER: 'missing_avg',
            VIEW: {
                AS: 'table'
            }
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
            expect(response.body).to.be("{missing: ['missing.json', 'other.json']}");
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
            VIEW: {
                AS: 'table'
            }
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });
});