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

    constructor() {
        
    }

    // print out a room
    public printRoom() {
        console.log('Room - ' + this.Name);
        console.log('   Number: ' + this.Number);
        console.log('   Capacity:' + this.Seats);
        console.log('   Furniture:' + this.Furniture);
        console.log('   Type:' + this.Type);
        console.log('   href:' + this.href);
        console.log('   Full name:' + this.FullName);
        console.log('   Address:' + this.Address);
        console.log('   Short name:' + this.ShortName);
        console.log('   Lat:' + this.Latitude);
        console.log('   Lon:' + this.Longitude);
    }

    // clean up the format of a Room (remove spaces etc)
    public formatRoom() {
        // TODO: format the values of each entry in the Room (remove spaces and things)
        this.ShortName = this.ShortName.replace(' ', '');
        this.Number = this.Number.replace(' ', '');
        this.Type = this.Type.substr(11); // subtract \n and leading 9 spaces

    }
}