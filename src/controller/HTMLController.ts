/**
 * Created by pablo on 11/4/16.
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

export default class HTMLController {
    public processHTML(zip: JSZip): Room[] {
        let that = this;
        let roomArray: Room[] = [];

        let promisesArray: Promise<any>[] = [];

        zip.folder('contents').forEach(function (relativePath, file) {
            console.log('Z - iterating over ' + relativePath);
            fs.readFile(relativePath, 'utf-8', function (err, data) {
                var buildingTree = parse5.parse(data);

                // create a Room from each one specified in buildingTree
                // add each Room to the array
                that.getRooms(buildingTree, roomArray);
            })
        });
        return roomArray;
    }

    private traverse(tree: parse5.ASTNode, arg: string, rooms: Room[]): any {
        let that = this;
        if (tree.nodeName == arg) {
            rooms.concat(that.table2rooms(tree));
        } else {
            for (let child in tree.childNodes) {
                that.traverse(tree.childNodes[child], arg, rooms);
            }
        }
    }

    // create an array of all the Rooms from a building html file
    // all the Rooms are contained in one div so this iterates through that
    private table2rooms(node: parse5.ASTNode): Room[] {
        let that = this;
        var rooms: Room[] = [];

        if (node.nodeName == 'even' ||
            node.nodeName == 'odd' ||
            node.nodeName == 'odd views-row-first' ||
            node.nodeName == 'odd views-row-last' ||
            node.nodeName == 'even views-row-last') {

            // create a new Room
            let room = new Room();

            for (let c in node.childNodes) {
                let name = node.childNodes[c].nodeName;

                // fill all the fields of the new Room
                switch (name) {
                    case 'views-field views-field-field-room-capacity':
                        room.Seats = parseInt(node.childNodes[c].data);
                        break;
                    case 'views-field views-field-field-room-furniture':
                        room.Furniture = node.childNodes[c].data;
                        break;
                    case 'views-field views-field-field-room-type':
                        room.Type = node.childNodes[c].data;
                        break;
                    case 'views-field views-field-nothing':
                        room.href = node.childNodes[c].data;
                        break;
                    default:
                        break;
                }
            }

            // add the room that was just created to the array of rooms
            rooms.push(room);
        } else {
            for (let i in node.childNodes) {
                that.table2rooms(node.childNodes[i]);
            }
        }

        return rooms;
    }

    private getRooms(root: parse5.ASTNode, rooms: Room[]): any {
        this.traverse(root, 'views-table cols-5 table', rooms);
    }
}