/**
 * Created by pablo on 11/2/16.
 */
export default class Room {
    FullName:string;    // eg: Hugh Dempster Pavilion
    ShortName:string;   // eg: DMP
    Number:string;      // room number
    Name:string;        // room_id, should equal ShortName_Number (eg: DMP_110)
    Address:string;     // building address (eg: "6245 Agronomy Road V6T 1Z4")
    Latitude:number
    Longitude:number;
    Seats:number;       // number of seats in room
    Type:string;        // room type (eg: "Small Group")
    Furniture:string;   // room type and amenities (eg: "Classroom-Movable Tables & Chairs")
    href:string;        // link to full details online

    // constructor(fullname:string, shortname:string, number:string, name:string, address:string, lat:number, lon:number, seats:number, type:string, furniture:string, href:string) {
    //     this.FullName = fullname;
    //     this.ShortName = shortname;
    //     this.Number = number;
    //     this.Name = name;
    //     this.Address = address;
    //     this.Latitude = lat;
    //     this.Longitude = lon;
    //     this.Seats = seats;
    //     this.Type = type;
    //     this.Furniture = furniture;
    //     this.href = href;
    // };

    constructor() {
        
    }
}