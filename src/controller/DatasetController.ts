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

    // return an array of nodes who's 'class' attribute matches arg
    private traverse(tree: parse5.ASTNode, arg: string, nodeArray: parse5.ASTNode[]): parse5.ASTNode[] {
        let that = this;

        // the class name we need to check is stored in the attrs[] of the node
        // so we need to compare arg to the values in that array
        // I traversed the tree by hand in the debugger and the item we want is the first entry in attrs[]

        if (tree.attrs != undefined) {
            for (let i in tree.attrs) {
                if (tree.attrs[i].name == 'class' && tree.attrs[i].value == arg) {
                    nodeArray.push(tree);
                }
            }
        }
        for (let child in tree.childNodes) {
            that.traverse(tree.childNodes[child], arg, nodeArray);
        }
        return nodeArray;
    }

    private getClassName(node: parse5.ASTNode): string {
        for (let i in node.attrs) {
            if (node.attrs[i].name == 'class') {
                return node.attrs[i].value;
            }
        }
    }

    // create an array of all the Rooms from the 'table' in a building html file
    private table2rooms(node: parse5.ASTNode): Room[] {
        let that = this;
        var rooms: Room[] = [];
        var nodeArray: parse5.ASTNode[] = [];
        console.log('Z - in table2rooms()');
        console.log('Z - node: ' + node.nodeName);

        // node is the root of the tree corresponding to the table with room info
        // traverse the tree to add all nodes that correspond to rooms in the table
        // the arguments here are all the possible class names for table elements
        that.traverse(node, 'even', nodeArray);
        that.traverse(node, 'odd', nodeArray);
        that.traverse(node, 'odd views-row-first', nodeArray);
        that.traverse(node, 'odd views-row-last', nodeArray);
        that.traverse(node, 'even views-row-last', nodeArray);

        // nodeArray contains a node for each row in the table

        console.log('Z - in table2rooms() - nodeArray = ' + nodeArray.length);

        for (let c in nodeArray) {
            // TODO: iterate through nodeArray - create a room for each entry, and populate it with theinfo in the node
            let room = new Room();

            // make a room from a node
            room = this.makeRoom(nodeArray[c]);

            // add new room to rooms[]
            rooms.push(room);
        }
        console.log('Z = in table2rooms() - rooms[] = ' + rooms.length);
        console.log('Z = in table2rooms() - rooms[] = ' + rooms[0].Furniture);
        return rooms;
    }

    // make a room from a 'table row' node
    private makeRoom(node: parse5.ASTNode): Room {
        let that = this;
        let room = new Room();

        let number = node.childNodes[1].childNodes[1].childNodes[0].value;
        room.Number = number;

        let capacity = node.childNodes[3].childNodes[0].value;
        // capacity = capacity.substr(2, capacity.length);
        // capacity = capacity.replace(' ', '');
        room.Seats = parseInt(capacity);

        let furniture = node.childNodes[5].childNodes[0].value;
        // furniture = furniture.substr(2, furniture.length);
        room.Furniture = furniture;

        let type = node.childNodes[7].value;
        // type = type.substr(2, type.length);
        room.Type = type;

        let url = node.childNodes[9].childNodes[1].attrs[0].value;
        room.href = url;

        console.log(this.printRoom(room));
        return room;
    }

    private printRoom(room: Room) {
        console.log('Room - ' + room.Name);
        console.log('   Number: ' + room.Number);
        console.log('   Capacity:' + room.Seats);
        console.log('   Furniture:' + room.Furniture);
        console.log('   Type:' + room.Type);
        console.log('   href:' + room.href);
        console.log('   Full name:' + room.FullName);
        console.log('   Address:' + room.Address);
        console.log('   Short name:' + room.ShortName);
        console.log('   Lat:' + room.Latitude);
        console.log('   Lon:' + room.Longitude);
    }
    
    // use traverse to get the table of rooms
    private getRooms(html: string, rooms: Room[]): any {
        var root = parse5.parse(html);
        console.log('Z - root is a ' + root.nodeName);
        console.log('Z - in getRooms');

        var shortName: string = '';
        var fullName: string = '';
        var address: string = '';
        var latitude: number = 0;
        var longitude: number = 0;

        var nodearray = this.traverse(root, 'views-table cols-5 table', []);

        console.log('Z - nodearray length = ' + nodearray.length);

        for (let node of nodearray) {
            console.log('Z - in for, nodeArray[i] = ' + node.nodeName);
            rooms.concat(this.table2rooms(node));
        }

        for (let x in rooms) {
            // TODO: add a building's name and address to each room here
            rooms[x].FullName = fullName;
            rooms[x].ShortName = shortName;
            rooms[x].Address = address;
            rooms[x].Latitude = latitude;
            rooms[x].Longitude = longitude;
        }

        console.log('Z - rooms[] length = ' + rooms.length);
    }

    public processHTML(zip: JSZip): Promise<Room[]> {
        let that = this;


        try {
           return new Promise(function (fulfill, reject) {

               let roomArray: Room[] = [];

               let promisesArray: any = [];
               var htmlArray : any = [];

               zip.folder('campus/').forEach(function (relativePath, file) {
                   console.log('Z - iterating over ' + relativePath);
                   console.log(file);

                   var promiseContent = file.async('string');
                   promisesArray.push(promiseContent);

               });

               Promise.all(promisesArray).then(function (data) {
                   console.log('There is some data');
                   for (var i = 0; i < data.length; i++) {
                       console.log(i);
                       var html = data[i] as string;
                       htmlArray.push(html);
                   }
               }).then(function () {
                   for (var h in htmlArray){
                       console.log('Z - htmlArray item ' + h);
                       that.getRooms(htmlArray[h], roomArray);
                   }
               }).then(function () {
                   fulfill(roomArray);
               }).catch(function (e) {
                   console.log(e);
                   reject(e);
               })


           });
        } catch (e){
           console.log(e);
        }
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

                    let processedDataset: Section[] = [];
                    // TODO: iterate through files in zip (zip.files)
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you should still be tolerant to errors.

                    var promisesArray: Promise<any>[] = [];

                    // console.log('Z - reading ZIP...');

                    for (var file in myZip.files) {
                        // console.log('Z - In ZIP-reading for loop...');
                        var promisedContent = myZip.files[file].async('string');
                        promisesArray.push(promisedContent);
                        // console.log('Z - added promise to array');
                    }

                    //console.log('Z - ' + promisesArray);


                    Promise.all(promisesArray).then(function (data) {
                        // console.log('Z - iterating through all Promises...');

                        for (let r = 0; r < data.length; r++) {

                            var jsonString:string = JSON.stringify(data[r]);
                            // Log.trace(jsonString);

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

                        if (processedDataset.length === 0)
                        {
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

                        // console.log('Z - save ID = ' + p);

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