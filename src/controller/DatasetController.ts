/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from '../Util';
import JSZip = require('jszip');
import Section from '../model/Section';
import fs = require('fs');
import {stringify} from "querystring";
import {error} from "util";
import parse5 = require('parse5');
import forEach = require("core-js/fn/array/for-each");
import Room from "../model/Room";

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: Section[]|Room[];
}

export interface File {
    result: Array<any>;
    rank: any;
}

export interface GeoLocation {
    lat?: number;
    lon?: number;
    error?: string;
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

    private traverseASYNC(tree: parse5.ASTNode, arg: string, nodeArray: parse5.ASTNode[]): Promise<parse5.ASTNode[]> {
        let that = this;

        return new Promise(function (fulfill, reject) {
           try {
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
               fulfill(nodeArray);
           } catch (err) {
               reject(err);
           }
        });
    }

    private getClassName(node: parse5.ASTNode): string {
        for (let i in node.attrs) {
            if (node.attrs[i].name == 'class') {
                return node.attrs[i].value;
            }
        }
    }



    public parseIndexASYNC(zip: JSZip): Promise<string[]> {
        let that = this;
        // console.log('Z - in parseIndex()...');
        // console.log('Z - index.html exists = ' + zip.file('index.htm') != null);

        return new Promise(function (fulfill, reject) {
            var indexRooms: string[] = [];
            var buildingNodes: parse5.ASTNode[] = [];

            zip.file('index.html').async('string').then(function (result) {
                var html = parse5.parse(result);

                // ASYNC version
                that.traverseASYNC(html, 'odd views-row-first', buildingNodes).then(function (result) {
                    buildingNodes.concat(result);
                    that.traverseASYNC(html, 'even', buildingNodes).then(function (result) {
                        buildingNodes.concat(result);
                        that.traverseASYNC(html, 'odd', buildingNodes).then(function (result) {
                            buildingNodes.concat(result);
                            that.traverseASYNC(html, 'even views-row-last', buildingNodes).then(function (result) {
                                buildingNodes.concat(result);
                                that.traverseASYNC(html, 'odd views-row-last', buildingNodes).then(function (result) {
                                    buildingNodes.concat(result);
                                    console.log('Z - parse Index(), bNodes length = ' + buildingNodes.length);
                                    for (let i in buildingNodes) {
                                        // add the short name of the building to the array of buildings in the index file
                                        let name = buildingNodes[i].childNodes[3].childNodes[0].value;
                                        indexRooms.push(name);
                                    }
                                    for (let j in indexRooms) {
                                        indexRooms[j] = indexRooms[j].substr(2);
                                        indexRooms[j] = indexRooms[j].replace(/\s+/g, '');
                                    }
                                    console.log('Z - parse Index(), about to fulfill...');
                                    fulfill(indexRooms);
                                });
                            });
                        });
                    });
                });

                console.log('Z - parse Index(), about to fulfill...');

            }).catch(function (err) {
                console.log('ERROR in parse Index()');
                reject(err);
            });
        });
    }

    // public parseIndex(zip: JSZip): string[] {
    //     let that = this;
    //     // console.log('Z - in parseIndex()...');
    //     // console.log('Z - index.html exists = ' + zip.file('index.htm') != null);
    //
    //     var indexRooms: string[] = [];
    //     var buildingNodes: parse5.ASTNode[] = [];
    //
    //     zip.file('index.htm').async('string').then(function (result) {
    //         var html = parse5.parse(result);
    //
    //         that.traverse(html, 'odd views-row-first', buildingNodes);
    //         that.traverse(html, 'even', buildingNodes);
    //         that.traverse(html, 'odd', buildingNodes);
    //         that.traverse(html, 'even views-row-last', buildingNodes);
    //         that.traverse(html, 'odd views-row-last', buildingNodes);
    //         console.log('Z - parse Index(), bNodes length = ' + buildingNodes.length);
    //         for (let i in buildingNodes) {
    //             // add the short name of the building to the array of buildings in the index file
    //             let name = buildingNodes[i].childNodes[3].childNodes[0].value;
    //             indexRooms.push(name);
    //         }
    //         for (let j in indexRooms) {
    //             indexRooms[j] = indexRooms[j].substr(2);
    //             indexRooms[j] = indexRooms[j].replace(/\s+/g, '');
    //         }
    //         console.log('Z - parse Index(), about to fulfill...');
    //     }).then(function () {
    //         return indexRooms;
    //     }).catch(function (err) {
    //         console.log('ERROR in parse index');
    //         return null;
    //     });
    // }



    // create an array of all the Rooms from the 'table' in a building html file
    private table2rooms(node: parse5.ASTNode): Room[] {
        let that = this;
        var roomsT2R: Room[] = [];
        var nodeArray: parse5.ASTNode[] = [];
        //console.log('Z - in table2rooms()');
        //console.log('Z - node: ' + node.nodeName);

        // node is the root of the tree corresponding to the table with room info
        // traverse the tree to add all nodes that correspond to rooms in the table
        // the arguments here are all the possible class names for table elements
        that.traverse(node, 'even', nodeArray);
        that.traverse(node, 'odd', nodeArray);
        that.traverse(node, 'odd views-row-first', nodeArray);
        that.traverse(node, 'odd views-row-last', nodeArray);
        that.traverse(node, 'even views-row-last', nodeArray);

        // nodeArray contains a node for each row in the table

        //console.log('Z - in table2rooms() - nodeArray = ' + nodeArray.length);

        for (let c in nodeArray) {
            let room = new Room();

            room = this.makeRoom(nodeArray[c]);

            roomsT2R.push(room);
        }
        //console.log('Z = in table2rooms() - rooms[] = ' + roomsT2R.length);
        return roomsT2R;
    }

    // make a room from a 'table row' node
    private makeRoom(node: parse5.ASTNode): Room {
        let that = this;
        let room = new Room();

        let number = node.childNodes[1].childNodes[1].childNodes[0].value;
        room.Number = number;

        let capacity = node.childNodes[3].childNodes[0].value;
        room.Seats = parseInt(capacity);

        let furniture = node.childNodes[5].childNodes[0].value;
        room.Furniture = furniture;

        let type = node.childNodes[7].childNodes[0].value;
        room.Type = type;

        let url = node.childNodes[9].childNodes[1].attrs[0].value;
        room.href = url;

        let shortName = url.split('/').slice(-1)[0];
        shortName = shortName.split('-')[0];
        room.ShortName = shortName;

        // room.formatRoom();
        // room.printRoom();
        return room;
    }

    private table2roomsASYNC(node: parse5.ASTNode, rooms: Array<any>): Promise<Room[]> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                var nodeArray: parse5.ASTNode[] = [];
                //console.log('Z - in table2roomsASYNC()');
                //console.log('Z - node: ' + node.nodeName);

                // node is the root of the tree corresponding to the table with room info
                // traverse the tree to add all nodes that correspond to rooms in the table
                // the arguments here are all the possible class names for table elements

                that.traverseASYNC(node, 'even', nodeArray).then(function () {
                    //console.log(nodeArray);
                    that.traverseASYNC(node, 'odd', nodeArray);
                }).then(function () {
                    //console.log(nodeArray);
                    that.traverseASYNC(node, 'odd views-row-first', nodeArray);
                }).then(function () {
                    //console.log(nodeArray);
                    that.traverseASYNC(node , 'odd views-row-last', nodeArray);
                }).then(function () {
                    //console.log(nodeArray);
                    that.traverseASYNC(node, 'even views-row-last', nodeArray);
                }).then(function () {
                    // nodeArray contains a node for each row in the table

                    //console.log('Z - in table2roomsASYNC() - nodeArray = ' + nodeArray.length);

                    for (let c in nodeArray) {
                        let room = new Room();

                        room = that.makeRoom(nodeArray[c]);

                        rooms.push(room);
                    }

                }).then(function () {
                    //console.log('Z = in table2roomsASYNC() - rooms[] = ' + rooms.length);
                    //console.log('Z = in table2roomsASYNC() - rooms[] = ' + rooms[0].Furniture);
                    fulfill(rooms);
                }).catch(function (err) {
                    console.log('Error in t2rASYNC - ' + err);
                });


            } catch (err) {
                reject(err);
            }
        })
    }

    // use traverse to get the table of rooms
    private getRooms(html: string, rooms: Room[]): any {
        let that = this;
        var root = parse5.parse(html);
        //console.log('Z - root is a ' + root.nodeName);
        //console.log('Z - in getRooms');

        // get div where all info about building is
        var buildingInfoTable = this.traverse(root, 'views-row views-row-1 views-row-odd views-row-first views-row-last', []);

        // get address, hours (will be first 2 elements in buildingInfo[])
        var buildingInfo = this.traverse(root, 'field-content', []);

        var shortName: string = '';

        var nodearray = this.traverse(root, 'views-table cols-5 table', []);

        //console.log('Z - nodearray length = ' + nodearray.length);

        var fullName: string = buildingInfo[0].childNodes[0].value;
        var address: string = buildingInfo[1].childNodes[0].value;
        // var hours: string = buildingInfo[2].childNodes[0].value;
        var latitude: number = 0;
        var longitude: number = 0;

        /*  rooms[] is empty when the for loop runs to populate it, need to fix control flow
            solution 1: would be to change everything to async calls, but those methods aren't working too well right now
            solution 2: force the program to wait a couple milliseconds for rooms[] to get elements
        */

        for (let node of nodearray) {
            //console.log('Z - in for, nodeArray[i] = ' + node.nodeName);
            rooms.concat(that.table2rooms(node));
        }


        for (let x in rooms) {
            rooms[x].FullName = fullName;
            rooms[x].ShortName = shortName;
            rooms[x].Address = address;
            rooms[x].Latitude = latitude;
            rooms[x].Longitude = longitude;
        }


    }

    private getRoomsASYNC(html: string, rooms: Room[]): Promise<any> {
        let that = this;

        try {
            return new Promise(function (fulfill, reject) {
                var root = parse5.parse(html);
                var table: any;
                var localRooms: any = [];
                var promiseArray: any = [];
                //console.log('Z - root is a ' + root.nodeName);
                //console.log('Z - in getRoomsASYNC()');

                var fullName: string = '';
                var address: string = '';
                var hours: string = '';
                var latitude: number = 0;
                var longitude: number = 0;

                // get div where all info about building is
                // var buildingInfoTable = this.traverse(root, 'views-row views-row-1 views-row-odd views-row-first views-row-last', []);

                // get address, hours (will be first 2 elements in buildingInfo[])
                that.traverseASYNC(root, 'field-content', []).then(function (buildingInfo) {
                    fullName = buildingInfo[0].childNodes[0].value;
                    address = buildingInfo[1].childNodes[0].value;
                    latitude = 0;
                    longitude = 0;
                    that.httpGetGeolocation(address).then(function (result) {
                        if (result.error != null){
                            reject(result.error);
                        } else {
                            latitude = result.lat;
                            longitude = result.lon;
                        }
                    });
                }).catch(function (err) {
                    console.log('error in getrooms - ' + err)
                });

                that.traverseASYNC(root, 'views-table cols-5 table', []).then(function (result) {
                    //console.log('Z - nodearray length = ' + result.length);
                    table = result;
                }).then(function () {
                    //for (let node of table) {
                        that.table2roomsASYNC(table[0], rooms).then(function (result) {
                            //console.log('Z - rooms[] length = ' + result.length);
                            for (let x in result) {
                                result[x].FullName = fullName;
                                result[x].Address = address;
                                result[x].Latitude = latitude;
                                result[x].Longitude = longitude;

                                localRooms.push(result[x]);
                            }
                        }).then(function () {
                            //console.log('Z - rooms[] length = ' + localRooms.length);
                            //console.log(localRooms);
                            fulfill(localRooms);
                        }).catch(function (err) {
                            console.log('error in table2room' + err);
                        });
                    //}

                }).catch(function (err) {
                    reject(err);
                })
            });
        }catch (err){
            console.log(err);
        }

    }



    public httpGetGeolocation(address: string) : Promise<any> {
        let http = require('http');
        //console.log('Z - in getLocation');
        return new Promise(function(fulfill, reject) {
            http.get('http://skaha.cs.ubc.ca:8022/api/v1/team78/' + encodeURIComponent(address), function(res: any) {
                //console.log(`STATUS: ${res.statusCode}`);
                //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

                res.setEncoding('utf8');

                let rawData: any = {};

                res.on('data', (chunk: any) => {
                    rawData += chunk;
                });

                res.on('end', () => {
                    try {
                        let parsedData: GeoLocation = JSON.parse(JSON.stringify(rawData));
                        //console.log(parsedData);
                        fulfill(parsedData);
                    } catch (e) {
                        console.log(e.message);
                    }
                });

            }).on('error', function(e:any) {
                console.log('DatasetController::getLatLong: ' + e);
                reject(e);
            })
        });

    }



    public processJSON(id: string, zip: JSZip): Promise<Room[]> {
        let that = this;

        try {
            return new Promise(function (fulfill, reject) {

                let processedDataset: Section[] = [];
                // TODO: iterate through files in zip (zip.files)
                // The contents of the file will depend on the id provided. e.g.,
                // some zips will contain .html files, some will contain .json files.
                // You can depend on 'id' to differentiate how the zip should be handled,
                // although you should still be tolerant to errors.

                var promisesArray: Promise<any>[] = [];

                // console.log('Z - reading ZIP...');

                for (var file in zip.files) {
                    // console.log('Z - In ZIP-reading for loop...');
                    var promisedContent = zip.files[file].async('string');
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

                    var p = that.save(id, processedDataset, '.json');

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

            });
        } catch (e) {
            throw 400;
        }
    }

    // Process the dataset if it contains HTML files
    public processHTML(id: string, zip: JSZip): Promise<Room[]> {
        let that = this;

        try {
            return new Promise(function (fulfill, reject) {

                let roomArray: Room[] = [];

                let promisesArray: any = [];
                var htmlArray : any = [];

                that.parseIndexASYNC(zip).then(function (result) {
                    //console.log('Z - processHTML(), before zip.folder...');

                    //console.log('Z - processHTML(), result = ' + result.length);


                   zip.folder('campus/').forEach(function (relativePath, file) {


                       let name = relativePath.substr(34);
                       console.log('Z - adding building: ' + name);


                       //if (result.indexOf(name) > -1) {
                           console.log('Z - processHTML(), in push to promised array...');
                           // Building with 'name' is in the array (index.html)

                           var promisedContent = file.async('string');
                           promisesArray.push(promisedContent);
                       //}
                    });


                    Promise.all(promisesArray).then(function (data) {

                        console.log('Z - promises all pushed, length = ' + promisesArray.length);


                        for (var i = 0; i < data.length; i++) {
                            var html = data[i] as string;
                            htmlArray.push(html);
                        }

                        console.log('Z - html array: ' + htmlArray.length);
                    }).then(function () {
                        for (var h in htmlArray){
                            //console.log('Z - NEW HTML FILE - htmlArray item ' + h);
                            // change this method to regular or ASYNC version
                            that.getRoomsASYNC(htmlArray[h], roomArray).then(function (result) {
                                var p = that.save(id, roomArray, '.html');

                                p.then(function (result) {
                                    // console.log('Z - save() result: ' + result);
                                    Log.trace('DatasetController::process(..) - saved with code: ' + result);
                                    if (result === 204) {
                                        fulfill(result);
                                    }
                                }).catch(function (result) {
                                    // console.log('Z - error in this.save()');
                                    throw 400;
                                });
                            });
                        }
                    }).catch(function (e) {
                        console.log(e);
                        reject(e);
                    })

                });


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

                    //check if it is a JSON file or HTML file here
                    if (zip.file(/index/) instanceof Array && zip.file(/index/).length != 0) {
                        console.log('It is a html file.');
                        that.processHTML(id, zip).then(function (rooms) {
                            console.log('HTML processed successfully, should be saved to disk/memory ' + rooms.length);
                            fulfill(100);
                        }).catch(function (err) {
                            console.log('Problems when processing HTML');
                            reject(400);
                        })
                    } else {
                        console.log('It is a json file.');
                        that.processJSON(id,zip).then(function (result) {
                            fulfill(result);
                        }).catch(function (err) {
                            reject(err);
                        })
                    }
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

    private save(id: string, processedDataset: Section[]|Room[], filetype: string): Promise<Number> {
        // console.log('Z - in save()...');
        this.datasets[id] = processedDataset;

        // TODO: actually write to disk in the ./data directory
        // use fs to write JSON string to  disk dir
        // console.log('Z - fs.write() now!');

        var that = this;
        return new Promise(function (fulfill, reject) {
            try {
                try {
                    fs.mkdirSync('data');
                } catch (err) {
                    // console.log('Z - ./ data already exists');
                }

                fs.open('data/' + id + filetype, 'wx', function (err, fileDestination) {
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
                             console.log('Z - file saved!!!!');
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