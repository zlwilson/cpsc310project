/**
 * Created by rtholmes on 2016-06-19.
 */

import restify = require('restify');

import Log from "../Util";
import RouteHandler from './RouteHandler';

/**
 * This configures the REST endpoints for the server.
 */
export default class Server {

    private port: number;
    private rest: restify.Server;

    constructor(port: number) {
        Log.info("Server::<init>( " + port + " )");
        this.port = port;
    }

    /**
     * Stops the server. Again returns a promise so we know when the connections have
     * actually been fully closed and the port has been released.
     *
     * @returns {Promise<T>}
     */
    public stop(): Promise<boolean> {
        Log.info('Server::close()');
        let that = this;
        return new Promise(function (fulfill, reject) {
            that.rest.close(function () {
                fulfill(true);
            })
        });
    }

    /**
     * Starts the server. Returns a promise with a boolean value. Promises are used
     * here because starting the server takes some time and we want to know when it
     * is done (and if it worked).
     *
     * @returns {Promise<T>}
     */
    public start(): Promise<boolean> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                that.rest = restify.createServer({
                    name: 'classPortal'
                });

                // that.rest.use(restify.bodyParser());

                // clear; curl -is  http://localhost:4321/echo/foo
                // Sends an echo message (for testing). No body.
                that.rest.get('/echo/:message', RouteHandler.getEcho);

                // Sends a dataset. Is idempotent and can create or update a dataset id.
                that.rest.put('/dataset/:id', RouteHandler.putDataset);

                // Receives queries. Although these queries never change the server (and thus could be GETs)
                // they are formed by sending JSON bodies, which is not standard for normal GET requests.
                that.rest.post('/query', restify.bodyParser(), RouteHandler.postQuery);

                that.rest.listen(that.port, function () {
                    Log.info('Server::start() - restify listening: ' + that.rest.url);
                    fulfill(true);
                });
            } catch (err) {
                Log.error('Server::start() - ERROR: ' + err);
                reject(err);
            }
        });
    }
}
