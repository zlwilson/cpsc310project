/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');

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

        return {"result":[{"tier_eighty_five":4,"tier_ninety":4,"Title":"managerl decisns","Section":"001","Detail":"","tier_seventy_two":4,"Other":0,"Low":50,"tier_sixty_four":0,"id":41239,"tier_sixty_eight":1,"tier_zero":0,"tier_seventy_six":3,"tier_thirty":0,"tier_fifty":1,"Professor":"shechter, steven","Audit":0,"tier_g_fifty":0,"tier_forty":0,"Withdrew":1,"Year":"2014","tier_twenty":0,"Stddev":12.09,"Enrolled":22,"tier_fifty_five":0,"tier_eighty":3,"tier_sixty":1,"tier_ten":0,"High":99,"Course":"523","Session":"w","Pass":21,"Fail":0,"Avg":80.19,"Campus":"ubc","Subject":"bams"},{"tier_eighty_five":6,"tier_ninety":8,"Title":"managerl decisns","Section":"002","Detail":"","tier_seventy_two":4,"Other":0,"Low":60,"tier_sixty_four":2,"id":41240,"tier_sixty_eight":4,"tier_zero":0,"tier_seventy_six":1,"tier_thirty":0,"tier_fifty":0,"Professor":"shechter, steven","Audit":0,"tier_g_fifty":0,"tier_forty":0,"Withdrew":0,"Year":"2014","tier_twenty":0,"Stddev":10.93,"Enrolled":31,"tier_fifty_five":0,"tier_eighty":4,"tier_sixty":2,"tier_ten":0,"High":99,"Course":"523","Session":"w","Pass":31,"Fail":0,"Avg":80.32,"Campus":"ubc","Subject":"bams"},{"tier_eighty_five":4,"tier_ninety":4,"Title":"managerl decisns","Section":"301","Detail":"","tier_seventy_two":0,"Other":0,"Low":60,"tier_sixty_four":0,"id":41241,"tier_sixty_eight":0,"tier_zero":0,"tier_seventy_six":3,"tier_thirty":0,"tier_fifty":0,"Professor":"shechter, steven","Audit":0,"tier_g_fifty":0,"tier_forty":0,"Withdrew":0,"Year":"2014","tier_twenty":0,"Stddev":8.26,"Enrolled":17,"tier_fifty_five":0,"tier_eighty":5,"tier_sixty":1,"tier_ten":0,"High":95,"Course":"523","Session":"w","Pass":17,"Fail":0,"Avg":83.35,"Campus":"ubc","Subject":"bams"},{"tier_eighty_five":14,"tier_ninety":16,"Title":"managerl decisns","Section":"overall","Detail":"","tier_seventy_two":8,"Other":0,"Low":50,"tier_sixty_four":2,"id":41242,"tier_sixty_eight":5,"tier_zero":0,"tier_seventy_six":7,"tier_thirty":0,"tier_fifty":1,"Professor":"","Audit":0,"tier_g_fifty":0,"tier_forty":0,"Withdrew":1,"Year":"2014","tier_twenty":0,"Stddev":10.65,"Enrolled":70,"tier_fifty_five":0,"tier_eighty":12,"tier_sixty":4,"tier_ten":0,"High":99,"Course":"523","Session":"w","Pass":69,"Fail":0,"Avg":81.03,"Campus":"ubc","Subject":"bams"},{"tier_eighty_five":2,"tier_ninety":8,"Title":"managerl decisns","Section":"001","Detail":"","tier_seventy_two":4,"Other":0,"Low":60,"tier_sixty_four":2,"id":44848,"tier_sixty_eight":3,"tier_zero":0,"tier_seventy_six":1,"tier_thirty":0,"tier_fifty":0,"Professor":"shechter, steven","Audit":0,"tier_g_fifty":0,"tier_forty":0,"Withdrew":0,"Year":"2013","tier_twenty":0,"Stddev":13.04,"Enrolled":26,"tier_fifty_five":0,"tier_eighty":3,"tier_sixty":3,"tier_ten":0,"High":100,"Course":"523","Session":"w","Pass":26,"Fail":0,"Avg":79.81,"Campus":"ubc","Subject":"bams"},{"tier_eighty_five":6,"tier_ninety":6,"Title":"managerl decisns","Section":"002","Detail":"","tier_seventy_two":4,"Other":0,"Low":56,"tier_sixty_four":2,"id":44849,"tier_sixty_eight":1,"tier_zero":0,"tier_seventy_six":1,"tier_thirty":0,"tier_fifty":0,"Professor":"shechter, steven","Audit":0,"tier_g_fifty":0,"tier_forty":0,"Withdrew":1,"Year":"2013","tier_twenty":0,"Stddev":10.54,"Enrolled":26,"tier_fifty_five":1,"tier_eighty":4,"tier_sixty":0,"tier_ten":0,"High":97,"Course":"523","Session":"w","Pass":25,"Fail":0,"Avg":81.44,"Campus":"ubc","Subject":"bams"},{"tier_eighty_five":8,"tier_ninety":14,"Title":"managerl decisns","Section":"overall","Detail":"","tier_seventy_two":8,"Other":0,"Low":56,"tier_sixty_four":4,"id":44850,"tier_sixty_eight":4,"tier_zero":0,"tier_seventy_six":2,"tier_thirty":0,"tier_fifty":0,"Professor":"","Audit":0,"tier_g_fifty":0,"tier_forty":0,"Withdrew":1,"Year":"2013","tier_twenty":0,"Stddev":11.79,"Enrolled":52,"tier_fifty_five":1,"tier_eighty":7,"tier_sixty":3,"tier_ten":0,"High":100,"Course":"523","Session":"w","Pass":51,"Fail":0,"Avg":80.61,"Campus":"ubc","Subject":"bams"}],"rank":0};
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
    }
}
