/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from '../Util';
import JSZip = require('jszip');
import Section from '../model/Section';
import Room from '../model/Room';
import fs = require('fs');
import {stringify} from "querystring";
import {error} from "util";
import parse5 = require('parse5');
import forEach = require("core-js/fn/array/for-each");

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: Section[];
}

export interface File {
    result: Array<any>;
    rank: any;
}

export default class DatasetController {

    private datasets: Datasets = {};

    private returnCode: Number;

    constructor() {
        Log.trace('DatasetController::init()');
    }
    /**
     * Returns the referenced dataset. If the dataset is not in memory, it should be
     * loaded from disk and put in memory. If it is not in disk, then it should return
     * null.
     *
     * @param id
     * @returns {{}}
     */

    // return a promise of an array of all the missing id's

    public getDataset(id: string): Promise<boolean> { 
        // TODO: this should check if the dataset is on disk in ./data if it is not already in memory. 
        return new Promise (function (fulfill, reject) {
            try {
                fs.readFile('data/' + id + '.json', 'utf8', function (err, data) {
                    if (err) {
                        // console.log('Z - in getDatasets(id), no such file: ' + id + '.json in ./data');
                        fulfill(false);
                    } else {
                        // console.log('Z - ' + id + '.json exists in ./data');
                        fulfill(true);
                    }
                });
            } catch (err) {
                // console.log('Z - error in getDatasets(id): ' + err)
                fulfill(false);
            }
        });
    }

    public getDatasets(): Datasets {
        // TODO: if datasets is empty, load all dataset files in ./data from disk
        let that = this;

        try {
            let dir = fs.readdirSync('data/');

            if (Object.keys(this.datasets).length == 0) {
                dir.forEach(function (data, err) {
                    var name = data.substring(0, data.length-5);

                    // console.log('Z - name(0,1) = ' + name.substr(0,1));

                    if (name.substr(0,1) !== '.') {
                        var sectionArray: Section[] = [];

                        // console.log('Z - name of file: ' + name);

                        var jsonString: string = (fs.readFileSync('data/' + data, 'utf8'));

                        jsonString = '{"result": ' + jsonString + '}';
                        // console.log('Z - got jsonString: ' + jsonString);

                        var dataParsed = JSON.parse(jsonString);

                        if (dataParsed.result.length > 0) {
                            var innersectionArray = dataParsed.result;

                            for (var s in innersectionArray) {
                                var instanceSection: Section = innersectionArray[s];
                                sectionArray.push(instanceSection);
                                // console.log('Z - just finished reading dir: ' + Object.keys(that.datasets).length);
                            }
                        }
                        that.datasets[name] = sectionArray;
                    }
                })
            }
            // console.log('Z - just finished reading /data, size = ' + Object.keys(this.datasets).length);
        } catch (err) {
            console.log(err)
        }

        // console.log('Z - this.datasets = ' + that.datasets);
        return that.datasets;
    }

    public processZip(id: string, data: any): Promise<any> {
        // check if html or json file
        return new Promise(function (fulfill, reject) {
            try {
                if (id == '') {
                    throw 400;
                } else {
                    let myZip = new JSZip;
                    myZip.loadAsync(data, {base64: true}).then(function (zip:JSZip) {
                        if (zip.file('index.html').name != null) {
                            console.log('Z - processedZip = html');
                            fulfill('html');
                        } else {
                            console.log('Z - processedZip = json');
                            fulfill('json');
                        }
                    });
                }
            } catch (err) {
                reject(err);
            }
        })
    }

    /**
     * Process the dataset; save it to disk when complete.
     *
     * @param id
     * @param data base64 representation of a zip file
     * @returns {Promise<boolean>} returns true if successful; false if the dataset was invalid (for whatever reason)
     */

    public process(id: string, data: any): Promise<number> {

        Log.trace('DatasetController::process( ' + id + '... )');

        let that = this;
        return new Promise(function (fulfill, reject) {
            try {

                if (id === "")
                {
                    throw 400;
                }

                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');

                    // TODO: iterate through files in zip (zip.files)
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you should still be tolerant to errors.

                    let processedDataset: Section[] = [];
                    var promisesArray: Promise<any>[] = [];

                    for (var file in myZip.files) {
                            // console.log('Z - In ZIP-reading for loop...');
                            var promisedContent = myZip.files[file].async('string');
                            promisesArray.push(promisedContent);
                            // console.log('Z - added promise to array');
                        }

                    Promise.all(promisesArray).then(function (data) {
                        // console.log('Z - iterating through all Promises...');
                        for (let r = 0; r < data.length; r++) {
                            var jsonString:string = JSON.stringify(data[r]);

                            // Parse out file.rank here, if needed
                            if( jsonString.indexOf("result") !== -1) {
                                var dataParsed = JSON.parse(JSON.parse(jsonString));
                                if (dataParsed.result.length > 0) {
                                    var sectionArray = dataParsed.result;
                                    for (var s in sectionArray) {
                                        var instanceSection: Section = sectionArray[s];
                                        processedDataset.push(instanceSection);
                                        // console.log('Z - this should be a section object: ' + instanceSection);
                                    }
                                }
                            }
                        }

                        if (processedDataset.length === 0) {
                            throw 400;
                        }
                        // console.log('Z - heading to save sections[], id = ' + id);

                        var p = that.save(id, processedDataset);

                        p.then(function (result) {
                            // console.log('Z - save() result: ' + result);
                            Log.trace('DatasetController::process(..) - saved with code: ' + result);
                            fulfill(result);
                        }).catch(function (result) {
                            // console.log('Z - error in this.save()');
                            throw 400;
                        });
                    }).catch(function (err) {
                        // console.log('Z - Error in Promise.all() ' + err);
                        reject(400);
                    });
                }).catch(function (err) {
                    Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
                    reject(400);
                });
            } catch (err) {
                Log.trace('DatasetController::process(..) - ERROR: ' + err);
                reject(400);
            }
        });
    }

    /**
     * Writes the processed dataset to disk as 'id.json'. The function should overwrite
     * any existing dataset with the same name.
     *
     * @param id
     * @param processedDataset
     */

    private save(id: string, processedDataset: Section[]): Promise<Number> {
        // console.log('Z - in save()...');
        this.datasets[id] = processedDataset;

        // TODO: actually write to disk in the ./data directory
        // use fs to write JSON string to  disk dir
        // console.log('Z - fs.write() now!');

        return new Promise(function (fulfill, reject) {
            try {
                try {
                    fs.mkdirSync('data');
                } catch (err) {
                    // console.log('Z - ./ data already exists');
                }

                fs.open('data/' + id + '.json', 'wx', function (err, fileDestination) {
                    if (err) {
                        if (err.code === "EEXIST") {
                            // console.error(id + '.json already exists');
                            // returnCode = 201;
                            fulfill(201);
                        } else {
                            console.error('Z - error in save(): ' + err);
                            reject(400);
                        }
                    } else {
                        // writeMyData(fd); 
                        fs.write(fileDestination, JSON.stringify(processedDataset), function (err) {
                            if (err) {
                                console.log('Z - error in open().write()');
                                throw err;
                            }
                            // console.log('Z - file saved!!!!');
                            // returnCode = 204;
                            fulfill(204);
                        })
                    }
                });
            } catch (err) {
                // console.log('Z - error saving');
                // returnCode = 400;
                reject(400);
            }
        });


    }

    public delete(id: string): Promise<number> {

        // console.log('Z - in delete(), id = ' + id);

        return new Promise(function (fulfill, reject) {

            try {
                fs.unlink('data/' + id + '.json', function (err) {
                    if (err) {
                        // console.log('Z - no such file ' + id + '.json in ./data');
                        reject(404);
                    } else {
                        // console.log('Z - successfully deleted data/' + id + '.json');
                        fulfill(204);
                    }
                });
            } catch (err) {
                try {
                    fs.unlink('data/' + id + '.html', function (err) {
                        if (err) {
                            // console.log('Z - no such file ' + id + '.json in ./data');
                            reject(404);
                        } else {
                            // console.log('Z - successfully deleted data/' + id + '.json');
                            fulfill(204);
                        }
                    });
                } catch (err) {
                    console.log('Z - unsuccessful delete' + err);
                    reject(400);
                }
            }
        });
    }

}