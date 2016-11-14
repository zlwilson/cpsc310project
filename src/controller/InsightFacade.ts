/**
 * Created by Lo on 2016-10-16.
 */

/*
 * This should be in the same namespace as your controllers
 */

import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import {QueryRequest, default as QueryController} from "./QueryController";
import DatasetController from '../controller/DatasetController';
import Log from "../Util";
import {Datasets} from "./DatasetController";

export default class InsightFacade implements IInsightFacade {

    private static datasetController = new DatasetController();

    addDataset(id: string, content: string): Promise<InsightResponse> {
        // Log.trace('InsightFacade::addDataset(..) - params: ' + id);

        return new Promise(function (fullfill, reject) {
            //set the initial code to be 400
            var response = {code:400, body:{}};
            try {
                let controller = InsightFacade.datasetController;
                controller.process(id, content).then(function (result) {
                    // Log.trace('InsightFacade::addDataset(..) - processed');
                    response.code = result;
                    fullfill(response);
                }).catch(function (err: Error) {
                    // Log.trace('InsightFacad::addDataset(..) - ERROR: ' + err.message);
                    response.body = {error:err.message};
                    reject(response);
                });

            } catch (err) {
                // Log.trace('InsightFacad::addDataset(..) - ERROR: ' + err.message);
                response.body = {error:err.message};
                reject(response);
            }
        });
    }

    removeDataset(id: string): Promise<InsightResponse> {
        return new Promise(function (fullfill, reject) {
            // Log.trace('InsightFacade::removeDataset(..) - params: ' + id);
            //set the initial code to be 400
            var response = {code:404, body:{}};
            try {
               InsightFacade.datasetController.delete(id).then(function (result) {
                    // console.log('Deleted ' + id + ' from ./data');
                    response.code = result;
                    fullfill(response);
                }).catch(function (err) {
                   // Log.trace('InsightFacad::removeDataset(..) - ERROR: ' + err.message);
                   response.body = {error:err.message};
                   reject(response);
                });

            } catch (err) {
                //Todo: Is ther any other error that might not due to inexisting file?
                // Log.trace('InsightFacad::removeDataset(..) - ERROR: ' + err.message);
                response.body = {error:err.message};
                reject(response);
            }

        });
    }

    performQuery(query: QueryRequest): Promise<InsightResponse> {
        return new Promise(function (fullfill, reject) {
            Log.trace('InsightFacade::performQuery(..) - params: ' + query);
            try {
                //set the initial code to be 400
                var response = {code:400, body:{}};

                    let datasets: Datasets = InsightFacade.datasetController.getDatasets();
                    let controller = new QueryController(datasets);
                    let isValid = controller.isValid(query);
                    let idList = controller.getId(query);

                    if (isValid === true) {
                        // Log.trace('InsightFacades::performQuery(..) - isValid = true');
                        var isPut:boolean;
                        var missedId: string[] = [];

                        var promisedArray: Promise<any>[] = [];

                        for (var e in idList) {
                            let p = InsightFacade.datasetController.getDataset(idList[e]);
                            promisedArray.push(p);
                        }

                        Promise.all(promisedArray).then(function (result) {
                            for (var x in result) {
                                if (!result[x]) {
                                    missedId.push(idList[x]);
                                }
                                console.log('Z - ' + idList[x] + ' exists: ' + result[x]);
                            }
                        }).then(function () {
                            if (typeof missedId === "undefined" || missedId.length == 0) {
                                if (idList.length > 1){
                                    response.code = 400;
                                    response.body = {error: 'Should not query on two datasets'};
                                    reject(response);
                                }

                                let result = controller.query(query, idList[0]);
                                // Log.trace('InsightFacades::performQuery(..) - processedQuery');
                                response.code = 200;
                                response.body = result;
                                fullfill(response);
                            }  else {
                                // Log.trace('InsightFacade::performQuery(..) - missing files, about to throw 424');
                                Log.trace('InsightFacade::performQuery(..) - missing: ' + missedId);
                                response.code = 424;
                                response.body = {missing: JSON.stringify(missedId)};
                                reject(response);
                            }
                        }).catch(function (err: Error) {
                            // Log.trace('InsightFacad::performQuery(..) - ERROR: ' + err.message);
                            response.body = {error: err.message};
                            reject(response);
                        });
                    } else {
                        // Log.trace('InsightFacades::performQuery(..) - isValid = false');
                        response.body = {error: 'invalid query'};
                        reject(response);
                    }

            } catch (err) {
                Log.trace('InsightFacad::performQuery(..) - ERROR: ' + err.message);
                response.body = {error: err.message};
                reject(response);
            }
        });
    }

}