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

                    // TODO: iterate through files in zip  (zip.files)
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.

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
