/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from '../Util';
import JSZip = require('jszip');
import Section from '../model/Section';
import fs = require('fs');

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: Section[];
}

export default class DatasetController {

    private datasets: Datasets = {};

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

    public getDataset(id: string): any { 
        // TODO: this should check if the dataset is on disk in ./data if it is not already in memory. 
        fs.readFile('data/' + id, 'string', function (err, data) { 
            if (err) {
                console.log('Z - Error in getDatasets(id): ' + err);
                throw err;
            } 
            console.log('Z - Read data in getDatasets(id): ' + data); 
            return data;
        }); 
        return this.datasets[id];
     }

    public getDatasets(): Datasets {
        // TODO: if datasets is empty, load all dataset files in ./data from disk
        var allFiles:any = [];
        console.log('Z - in getDatasets()...');

        fs.readdir('data/', function (err, files) {
            console.log('Z - reading ./data...');
            if (err) {
                console.log('Z - Error reading ./data: ' + err);
                throw err;
            }

            allFiles = files;
            console.log('Z - list of existing datasets in ./data: ' + files);
        });

        for (var file in allFiles) {
            var dataset = allFiles[file];
            this.datasets = (dataset);
        }

        return this.datasets;
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
                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');

                    let processedDataset: Section[] = [];
                    // TODO: iterate through files in zip (zip.files)
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you should still be tolerant to errors.

                    var promisesArray: Promise<any>[] = [];

                    console.log('Z - reading ZIP...');

                    for (var file in myZip.files) {
                        // console.log('Z - In ZIP-reading for loop...');
                        console.log('Z - In ZIP-reading for loop...');
                        var promisedContent = myZip.files[file].async('string');
                        promisesArray.push(promisedContent);
                        // console.log('Z - added promise to array');
                    }

                    console.log('Z - ' + promisesArray);

                    Promise.all(promisesArray).then(function (result) {
                        console.log('Z - iterating through all Promises...');
                        for (var section in result) {
                            let jsonString = JSON.stringify(result[section]);
                            var instanceSection: Section = JSON.parse(jsonString);
                            processedDataset.push(instanceSection);
                            console.log('Z - this should be a section object: ' + result[section]);
                        }
                        console.log('Z - heading to save sections[]');

                        var saveID = that.save(id, processedDataset);

                        fulfill(saveID);
                    }).then(function() {
                        console.log('Z - fulfilling true');
                    }).catch(function (err) {
                        console.log('Z - Error in Promise.all()' + err);
                    });

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

    /**
     * Writes the processed dataset to disk as 'id.json'. The function should overwrite
     * any existing dataset with the same name.
     *
     * @param id
     * @param processedDataset
     */
     private save(id: string, processedDataset: any): number {
        // add it to the memory model
        this.datasets[id] = processedDataset;
        console.log('Z - in save()...');

        // TODO: actually write to disk in the ./data directory
        // use fs to write JSON string to  disk dir

        console.log('Z - fs.write() now!'); 
        // return new Promise<Number> {};  
        // var fd = fs.openSync('data/' + id, 'wx'); 
        // fs.writeSync(fd, processedDataset);  
        fs.open('data/' + id, 'wx', (err, fileDestination) => { 
            if (err) {
                if (err.code === "EEXIST") { 
                    console.error(id + ' already exists'); 
                    return 201; 
                } else {
                    throw err; 
                }
            }   

            // writeMyData(fd); 
            fs.write(fileDestination, processedDataset, function (err) { 
                if (err) { 
                    console.log('Z - error in open().write()'); 
                    throw err;
                } 
                console.log('Z - file saved!!!!');
                return 204;
            });
        });
        return 400;
    }
}
