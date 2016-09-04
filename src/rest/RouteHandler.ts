/**
 * Created by rtholmes on 2016-06-14.
 */

import restify = require('restify');

import EchoController from '../controller/EchoController';
import QueryController from '../controller/QueryController';
import DatasetController from '../controller/DatasetController';

import Log from '../Util';
import {QueryRequest} from "../controller/QueryController";

export default class RouteHandler {

    static getEcho(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::getEcho(..) - params: ' + JSON.stringify(req.params));

        if (typeof req.params.message !== 'undefined') {
            let val = req.params.message;
            let controller = new EchoController();
            let ret = controller.echo(val);
            res.json(200, {msg: ret});
        } else {
            res.json(400, {error: 'No message provided'});
        }

        return next();
    }

    static postDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postDataset(..) - params: ' + JSON.stringify(req.params));
        try {
            let id: string = req.params.id;
            let dataset: any = req.body;
            Log.trace('RouteHandler::postDataset(..) - body: ' + dataset);

            let controller = new DatasetController();
            controller.process(id, dataset.zip).then(function (result) {

                Log.trace('RouteHandler::postDataset(..) - processed');
                res.json(200, result);
            }).catch(function (err: Error) {
                Log.trace('RouteHandler::postDataset(..) - ERROR: ' + err.message);
                res.json(400, {err: err.message});
            });
        } catch (err) {
            console.log('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            res.send(400, {err: err.message});
        }
        return next();
    }

    static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.params));
        try {
            let query: QueryRequest = req.params;

            let controller = new QueryController();
            let isValid = controller.isValid(query);

            if (isValid === true) {
                let result = controller.query(query);
                res.json(200, result);
            } else {
                res.json(400, {status: 'invalid query'});
            }

        } catch (err) {
            console.log('RouteHandler::postQuery(..) - ERROR: ' + err.message);
            res.send(403);
        }
        return next();
    }
}

