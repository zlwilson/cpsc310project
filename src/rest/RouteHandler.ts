/**
 * Created by rtholmes on 2016-06-14.
 */
import restify = require('restify');
import fs = require('fs');

import DatasetController from '../controller/DatasetController';
import {Datasets} from '../controller/DatasetController';
import QueryController from '../controller/QueryController';

import {QueryRequest} from "../controller/QueryController";
import Log from '../Util';

export default class RouteHandler {

    private static datasetController = new DatasetController();

    public static getHomepage(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getHomepage(..)');
        fs.readFile('./src/rest/views/index.html', 'utf8', function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }

    public static  putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postDataset(..) - params: ' + JSON.stringify(req.params));
        try {
            var id: string = req.params.id;

            // stream bytes from request into buffer and convert to base64
            // adapted from: https://github.com/restify/node-restify/issues/880#issuecomment-133485821
            let buffer: any = [];
            req.on('data', function onRequestData(chunk: any) {
                //Log.trace('RouteHandler::postDataset(..) on data; chunk length: ' + chunk.length);
                buffer.push(chunk);
            });

            req.once('end', function () {
                let concated = Buffer.concat(buffer);
                req.body = concated.toString('base64');
                Log.trace('RouteHandler::postDataset(..) on end; total length: ' + req.body.length);

                let controller = RouteHandler.datasetController;
                controller.process(id, req.body).then(function (result) {
                    Log.trace('RouteHandler::postDataset(..) - processed');
                    console.log('Z - code from process() in RouteController: ' + result);
                    res.json(result);
                }).catch(function (err: Error) {
                    Log.trace('RouteHandler::postDataset(..) - ERROR: ' + err.message);
                    res.json(400, {err: err.message});
                });
            });

        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            res.send(400, {err: err.message});
        }
        return next();
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.params));
        try {
            let query: QueryRequest = req.params;
            let datasets: Datasets = RouteHandler.datasetController.getDatasets();
            let controller = new QueryController(datasets);
            let isValid = controller.isValid(query);
            let idList = controller.getId(query);

            if (isValid === true) {
                var isPut:boolean;
                var missedId: string[] = [];
                for(var i = 0; i < idList.length; i++) {
                    console.log('Z - checking if dataset ' + idList[i] + ' exists');
                    // p is Promise<boolean>
                    let p = RouteHandler.datasetController.getDataset(idList[i]).then(function (result) {
                        isPut = result;
                    }).then(function () {
                        console.log('Z - isPut? ' + idList[i] + " " + isPut);
                        if (isPut === false) {
                            missedId.push(idList[i]);
                        }
                    }).then(function () {
                        if (typeof missedId === "undefined" || missedId.length == 0) {
                            let result = controller.query(query, idList[0]);
                            res.json(200, result);
                        }
                        else {
                            res.json(424, {missing: JSON.stringify(missedId)});
                        }
                    });
                }
            } else {
                res.json(400, {status: 'invalid query'});
            }
        } catch (err) {
            res.json(400,{status: err});
            Log.error('RouteHandler::postQuery(..) - ERROR: ' + err);
        }
        return next();
    }

    public static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next)
    {
        Log.trace('RouteHandler::deleteDataset(..) - params: ' + JSON.stringify(req.params));

        let that = this;
        try {
            var id: string = req.params.id;

            console.log('Z - id = ' + id);

            //Todo: DeleteDataset
            RouteHandler.datasetController.delete(id).then(function (result) {
                console.log('Deleted ' + id + ' from ./data');
                res.json(result);
            }).catch(function (err) {
                console.log('Error in delete, no such file: ' + err);
                res.json(err);
            });

        } catch (err) {
            Log.error('RouteHandler::deleteDataset(..) - ERROR: ' + err.message);
            res.send(404, {err: err.message});
        }
        return next();
    }
}
