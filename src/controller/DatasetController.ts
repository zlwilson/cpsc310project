/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');

export default class DatasetController {

    public process(id: string, data: any): Promise<boolean> {
        Log.trace('DatasetController::process( ' + id + '... )');

        return new Promise(function (fulfill, reject) {
            try {
                let zip = new JSZip();
                zip.loadAsync(data, {base64: true}).then(function (done) {
                    Log.trace('DatasetController::process(..) - unzipped');
                    // TODO: process zip (zip.file)
                    fulfill(true);
                }).catch(function (err) {
                    Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
                    reject(err);
                });
            } catch (err) {
                Log.trace('DatasetController::process(..) - ERROR: ' + err);
                reject(err);
            }
        });
    }
}
