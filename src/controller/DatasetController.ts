/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');
import Course from "../model/Course";
import Section from "../model/Section";


/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: {};
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

        return this.datasets[id];
    }

    public getDatasets(): Datasets {
        // TODO: if datasets is empty, load all dataset files in ./data from disk
        return this.datasets;
    }

    /**
     * Process the dataset; save it to disk when complete.
     *
     * @param id
     * @param data base64 representation of a zip file
     * @returns {Promise<boolean>} returns true if successful; false if the dataset was invalid (for whatever reason)
     */
    public process(id: string, data: any): Promise<boolean> {
        Log.trace('DatasetController::process( ' + id + '... )');

        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');

                    let processedDataset = {};
                    // TODO: iterate through files in zip (zip.files)
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you should still be tolerant to errors.
                    let courses: Course[];
                    var promisedArray: Promise<any>[];

                    console.log("reading ZIP...");

                    for (var file in myZip.files) {
                        console.log("In ZIP-reading for loop...");
                        let file_name = myZip.file(file).name;
                        let course = new Course;
                        course = course.createCourse(file_name);
                        var dataParsed: any;

                        var promisedContent = myZip.file(file).async("string");
                        promisedArray.concat(promisedContent);
                        console.log("added promise to array");

                        //     .then(function (filetext) {
                        //     dataParsed = JSON.parse(filetext);
                        //     promisedArray.concat(promisedContent);
                        //     console.log("added promise to promisedArray");
                        //     let sections: Section[] = JSON.parse(dataParsed.result);
                        //     // processedDataset.add(sections);
                        // }).catch(function () {
                        //     console.log("JSON parsing failed");
                        // });
                    }

                    Promise.all(promisedArray).then(function (result) {
                        for (var content in result) {
                            console.log(content);
                        }
                    }).catch(function () {
                        console.log("Error in Promise.all()");
                    });

                    that.save(id, processedDataset);

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

    /**
     * Writes the processed dataset to disk as 'id.json'. The function should overwrite
     * any existing dataset with the same name.
     *
     * @param id
     * @param processedDataset
     */
    private save(id: string, processedDataset: any) {
        // add it to the memory model
        this.datasets[id] = processedDataset;

        // TODO: actually write to disk in the ./data directory
        // use fs to write JSON string to  disk dir
    }
}
