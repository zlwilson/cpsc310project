/**
 * Created by rtholmes on 2016-06-14.
 */
import restify = require('restify');
import fs = require('fs');

import InsightFacade from "../controller/InsightFacade";
import Log from '../Util';

export default class RouteHandler {

    private static insightFacade = new InsightFacade();

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

                RouteHandler.insightFacade.addDataset(id, req.body).then(function (response) {
                    res.json(response.code, response.body);
                }).catch(function (response) {
                    res.json(response.code, response.body);
                })
            });

        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            res.send(400, {error: err.message});
        }
        return next();
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.params));
        try {

            if(RouteHandler.isJson(req.params)) {
                RouteHandler.insightFacade.performQuery(req.params).then(function (response) {
                    res.json(response.code, response.body);
                }).catch(function (response) {
                    res.json(response.code, response.body);
                });
            } else {
                res.json(400, {error: 'invalid query'});
            }

        } catch (err) {
            res.json(400,{error: err});
            Log.error('RouteHandler::postQuery(..) - ERROR: ' + err);
        }
        return next();
    }

    public static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next)
    {
        Log.trace('RouteHandler::deleteDataset(..) - params: ' + JSON.stringify(req.params));

        //let that = this;
        try {
            var id: string = req.params.id;

            console.log('Z - id = ' + id);

            RouteHandler.insightFacade.removeDataset(id).then(function (response) {
                res.json(response.code, response.body);
            }).catch(function (response) {
                res.json(response.code, response.body);
            });

        } catch (err) {
            Log.error('RouteHandler::deleteDataset(..) - ERROR: ' + err.message);
            res.send(404, {err: err.message});
        }
        return next();
    }

    public static isJson(query: any):boolean
    {
        try {

            JSON.parse(JSON.stringify(query));
        } catch (e) {
            return false;
        }
        return true;
    }
}
