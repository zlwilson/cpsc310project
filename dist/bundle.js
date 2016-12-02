/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(1);
	var ReactDOM = __webpack_require__(2);
	var QueryComponent_1 = __webpack_require__(3);
	var root = document.getElementById('root');
	var Main = (function (_super) {
	    __extends(Main, _super);
	    function Main(props) {
	        _super.call(this, props);
	    }
	    Main.prototype.render = function () {
	        return (React.createElement("div", null, React.createElement("p", null), React.createElement(QueryComponent_1.QueryComponent, {defaultQuery: '[no query yet]'})));
	    };
	    return Main;
	}(React.Component));
	ReactDOM.render(React.createElement(Main, null), root);


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = React;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = ReactDOM;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(1);
	var axios_1 = __webpack_require__(4);
	var ScheduleController_1 = __webpack_require__(30);
	var QueryComponent = (function (_super) {
	    __extends(QueryComponent, _super);
	    function QueryComponent(props) {
	        _super.call(this, props);
	        this.state = {
	            courseFilters_size_mod: "",
	            courseSearchResult: [],
	            courseFilterResult: [],
	            courseResult: [],
	            courseSearch: "",
	            courseFilters_size: -1,
	            courseFilters_dept: "",
	            courseFilters_num: "",
	            courseSearchEmpty: true,
	            courseFilterEmpty: true,
	            roomSearchResult: [],
	            roomFilterResult: [],
	            roomResult: [],
	            roomSearch: "",
	            roomFilters_size: -1,
	            roomFilters_size_mod: "",
	            roomFilters_building: "",
	            roomFilters_type: "",
	            nearBuilding: false,
	            roomSearchEmpty: true,
	            roomFilterEmpty: true,
	            schedule: []
	        };
	    }
	    QueryComponent.prototype.handleQueryResponse = function () {
	    };
	    QueryComponent.prototype.handleCourseSearch = function (event, input) {
	        var _this = this;
	        var that = this;
	        if (input === "**" || input === "") {
	            this.setState({ courseSearchEmpty: true });
	            this.setState({ courseSearchResult: [] });
	            this.mergeCourseResult();
	            return;
	        }
	        this.setState({ courseSearchEmpty: false });
	        var query = {
	            GET: ["courses_title", "courses_instructor", "courses_size", "courses_dept", "courses_id", "courses_avg", "courses_fail", "courses_pass"],
	            WHERE: {
	                "AND": [
	                    { "OR": [
	                            { "IS": { courses_title: input } },
	                            { "IS": { courses_instructor: input } },
	                        ] },
	                    { "EQ": { courses_year: 2014 } }] },
	            AS: 'TABLE' };
	        var queryJSON = JSON.stringify(query);
	        axios_1.default.post('http://localhost:4321/query', query).then(function (res) {
	            _this.setState({ courseSearchResult: res.data.result });
	            _this.mergeCourseResult();
	        }).catch(function (err) {
	            console.log(err);
	        });
	    };
	    QueryComponent.prototype.updateCourseSearch = function (event) {
	        this.setState({ courseSearchEmpty: false });
	        if (event.target.value === "") {
	            this.setState({ courseSearchEmpty: true });
	        }
	        this.setState({ courseSearch: "*" + event.target.value + "*" });
	    };
	    QueryComponent.prototype.updateCourseFilters = function (event, type) {
	        if (type == 1) {
	            if (event.target.value === "") {
	                this.setState({ courseFilters_size: -1 });
	            }
	            else {
	                this.setState({ courseFilters_size: event.target.value });
	            }
	        }
	        else if (type == 2) {
	            this.setState({ courseFilters_size_mod: event.target.value });
	        }
	        else if (type == 3) {
	            this.setState({ courseFilters_dept: event.target.value });
	        }
	        else {
	            this.setState({ courseFilters_num: event.target.value });
	        }
	    };
	    QueryComponent.prototype.applyCourseFilters = function (event) {
	        var _this = this;
	        var andQuery = { "AND": [
	                { "EQ": { courses_year: 2014 } }
	            ] };
	        this.setState({ courseFilterEmpty: false });
	        if (typeof this.state.courseFilters_size_mod === "" || typeof this.state.courseFilters_size === "undefined" || this.state.courseFilters_size === -1) {
	            if (typeof this.state.courseFilters_dept === "undefined" || this.state.courseFilters_dept === "") {
	                if (typeof this.state.courseFilters_num === "undefined" || this.state.courseFilters_num === "") {
	                    this.setState({ courseFilterEmpty: true });
	                    this.setState({ courseFilterResult: [] });
	                    console.log(this.state.courseSearchResult);
	                    this.mergeCourseResult();
	                    return;
	                }
	                else {
	                    andQuery["AND"].push({ "IS": { courses_id: this.state.courseFilters_num } });
	                }
	            }
	            else {
	                if (typeof this.state.courseFilters_num === "undefined" || this.state.courseFilters_num === "") {
	                    andQuery["AND"].push({ "IS": { courses_dept: this.state.courseFilters_dept } });
	                }
	                else {
	                    andQuery["AND"].push({ "IS": { courses_dept: this.state.courseFilters_dept } });
	                    andQuery["AND"].push({ "IS": { courses_id: this.state.courseFilters_num } });
	                }
	            }
	        }
	        else {
	            if (typeof this.state.courseFilters_dept === "undefined" || this.state.courseFilters_dept === "") {
	                if (typeof this.state.courseFilters_num === "undefined" || this.state.courseFilters_num === "") {
	                }
	                else {
	                    andQuery["AND"].push({ "IS": { courses_id: this.state.courseFilters_num } });
	                }
	            }
	            else {
	                if (typeof this.state.courseFilters_num === "undefined" || this.state.courseFilters_num === "") {
	                    andQuery["AND"].push({ "IS": { courses_dept: this.state.courseFilters_dept } });
	                }
	                else {
	                    andQuery["AND"].push({ "IS": { courses_dept: this.state.courseFilters_dept } });
	                    andQuery["AND"].push({ "IS": { courses_id: this.state.courseFilters_num } });
	                }
	            }
	            var sizeMode = this.state.courseFilters_size_mod;
	            switch (sizeMode) {
	                case 'GT':
	                    andQuery['AND'].push({ "GT": { courses_size: this.state.courseFilters_size } });
	                    break;
	                case 'LT':
	                    andQuery['AND'].push({ 'LT': { courses_size: this.state.courseFilters_size } });
	                    break;
	                case 'EQ':
	                    andQuery['AND'].push({ 'EQ': { courses_size: this.state.courseFilters_size } });
	                    break;
	                default:
	                    console.log("Error in filter course size");
	            }
	        }
	        console.log(andQuery);
	        var query = {
	            GET: ["courses_title", "courses_instructor", "courses_size", "courses_dept", "courses_id", "courses_avg", "courses_fail", "courses_pass"],
	            WHERE: andQuery,
	            AS: 'TABLE'
	        };
	        axios_1.default.post('http://localhost:4321/query', query).then(function (res) {
	            console.log(res.data);
	            _this.setState({ courseFilterResult: res.data.result });
	            _this.mergeCourseResult();
	        }).catch(function (err) {
	            console.log(err);
	        });
	    };
	    QueryComponent.prototype.updateCourseSorting = function (event) {
	    };
	    QueryComponent.prototype.updateBuilding = function (event) {
	    };
	    QueryComponent.prototype.toggleNearby = function (event) {
	        if (this.state.nearBuilding === true) {
	            this.setState({ nearbyBuilding: false });
	        }
	    };
	    QueryComponent.prototype.updateNearbyRooms = function (event) {
	        if (this.state.nearBuilding === false) {
	            return;
	        }
	    };
	    QueryComponent.prototype.handleRoomSearch = function (event, input) {
	        var _this = this;
	        if (input === "**" || input === "") {
	            this.setState({ roomSearchEmpty: true });
	            this.setState({ roomSearchResult: [] });
	            this.mergeRoomResult();
	            return;
	        }
	        this.setState({ roomSearchEmpty: false });
	        var query = {
	            GET: ["rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_seats", "rooms_type", "rooms_furniture"],
	            WHERE: {
	                "OR": [
	                    { "IS": { rooms_fullname: input } },
	                    { "IS": { rooms_shortname: input } },
	                    { "IS": { rooms_number: input } }
	                ] },
	            AS: 'TABLE' };
	        var queryJSON = JSON.stringify(query);
	        axios_1.default.post('http://localhost:4321/query', query).then(function (res) {
	            _this.setState({ roomSearchResult: res.data.result });
	            _this.mergeRoomResult();
	        }).catch(function (err) {
	            console.log(err);
	        });
	    };
	    QueryComponent.prototype.updateRoomSearch = function (event) {
	        this.setState({ roomSearchEmpty: false });
	        if (event.target.value === "") {
	            this.setState({ roomSearchEmpty: true });
	        }
	        this.setState({ roomSearch: "*" + event.target.value + "*" });
	    };
	    QueryComponent.prototype.applyRoomFilters = function (event, input) {
	        var _this = this;
	        var andQuery = { "AND": [
	                { "LT": { rooms_lat: 100 } }
	            ] };
	        this.setState({ roomFilterEmpty: false });
	        if (typeof this.state.roomFilters_size_mod === "" || typeof this.state.roomFilters_size === "undefined" || this.state.roomFilters_size === -1) {
	            if (typeof this.state.roomFilters_type === "undefined" || this.state.roomFilters_type === "") {
	                if (typeof this.state.roomFilters_furniture === "undefined" || this.state.roomFilters_furniture === "") {
	                    this.setState({ roomFilterEmpty: true });
	                    this.setState({ roomFilterResult: [] });
	                    this.mergeRoomResult();
	                    return;
	                }
	                else {
	                    andQuery["AND"].push({ "IS": { rooms_furniture: this.state.roomFilters_furniture } });
	                }
	            }
	            else {
	                if (typeof this.state.roomFilters_furniture === "undefined" || this.state.roomFilters_furniture === "") {
	                    andQuery["AND"].push({ "IS": { rooms_type: this.state.roomFilters_type } });
	                }
	                else {
	                    andQuery["AND"].push({ "IS": { rooms_type: this.state.roomFilters_type } });
	                    andQuery["AND"].push({ "IS": { rooms_furniture: this.state.roomFilters_furniture } });
	                }
	            }
	        }
	        else {
	            if (typeof this.state.roomFilters_type === "undefined" || this.state.roomFilters_type === "") {
	                if (typeof this.state.roomFilters_furniture === "undefined" || this.state.roomFilters_furniture === "") {
	                }
	                else {
	                    andQuery["AND"].push({ "IS": { rooms_furniture: this.state.roomFilters_furniture } });
	                }
	            }
	            else {
	                if (typeof this.state.roomFilters_furniture === "undefined" || this.state.roomFilters_furniture === "") {
	                    andQuery["AND"].push({ "IS": { rooms_type: this.state.roomFilters_type } });
	                }
	                else {
	                    andQuery["AND"].push({ "IS": { rooms_type: this.state.roomFilters_type } });
	                    andQuery["AND"].push({ "IS": { rooms_furniture: this.state.roomFilters_furniture } });
	                }
	            }
	            var sizeMode = this.state.roomFilters_size_mod;
	            switch (sizeMode) {
	                case 'GT':
	                    andQuery['AND'].push({ "GT": { rooms_seats: this.state.roomFilters_size } });
	                    break;
	                case 'LT':
	                    andQuery['AND'].push({ 'LT': { rooms_seats: this.state.roomFilters_size } });
	                    break;
	                case 'EQ':
	                    andQuery['AND'].push({ 'EQ': { rooms_seats: this.state.roomFilters_size } });
	                    break;
	                default:
	                    console.log("Error in filter room size");
	            }
	        }
	        console.log(andQuery);
	        var query = {
	            GET: ["rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_seats", "rooms_type", "rooms_furniture"],
	            WHERE: andQuery,
	            AS: 'TABLE'
	        };
	        axios_1.default.post('http://localhost:4321/query', query).then(function (res) {
	            _this.setState({ roomFilterResult: res.data.result });
	            _this.mergeRoomResult();
	        }).catch(function (err) {
	            console.log(err);
	        });
	    };
	    QueryComponent.prototype.updateRoomFilters = function (event, type) {
	        if (type == 1) {
	            this.setState({ roomFilters_size_mod: event.target.value });
	        }
	        else if (type == 2) {
	            if (event.target.value === "") {
	                this.setState({ roomFilters_size: -1 });
	            }
	            else {
	                this.setState({ roomFilters_size: event.target.value });
	            }
	        }
	        else if (type == 4) {
	            this.setState({ roomFilters_furniture: event.target.value });
	        }
	        else {
	            this.setState({ roomFilters_type: event.target.value });
	        }
	    };
	    QueryComponent.prototype.mergeCourseResult = function () {
	        var searchResult = this.state.courseSearchResult;
	        var filterResult = this.state.courseFilterResult;
	        var result = [];
	        if (this.state.courseFilterEmpty === true) {
	            if (this.state.courseSearchEmpty === true) {
	                this.setState({ courseResult: [] });
	            }
	            else {
	                this.setState({ courseResult: searchResult });
	            }
	        }
	        else {
	            if (this.state.courseSearchEmpty === true) {
	                this.setState({ courseResult: filterResult });
	            }
	            else {
	                for (var f in filterResult) {
	                    for (var s in searchResult) {
	                        if (filterResult[f].courses_title + filterResult[f].courses_instructor + filterResult[f].courses_size
	                            === searchResult[s].courses_title + searchResult[s].courses_instructor + searchResult[s].courses_size) {
	                            result.push(filterResult[f]);
	                        }
	                    }
	                }
	                this.setState({ courseResult: result });
	            }
	        }
	    };
	    QueryComponent.prototype.mergeRoomResult = function () {
	        var searchResult = this.state.roomSearchResult;
	        var filterResult = this.state.roomFilterResult;
	        var result = [];
	        if (this.state.roomFilterEmpty === true) {
	            if (this.state.roomSearchEmpty === true) {
	                this.setState({ roomResult: [] });
	            }
	            else {
	                this.setState({ roomResult: searchResult });
	            }
	        }
	        else {
	            if (this.state.roomSearchEmpty === true) {
	                this.setState({ roomResult: filterResult });
	            }
	            else {
	                for (var f in filterResult) {
	                    for (var s in searchResult) {
	                        if (filterResult[f].rooms_name
	                            === searchResult[s].rooms_name) {
	                            result.push(filterResult[f]);
	                        }
	                    }
	                }
	                this.setState({ roomResult: result });
	            }
	        }
	    };
	    QueryComponent.prototype.renderCourseTableRow = function () {
	        var array = this.state.courseResult;
	        for (var i = 1; i < array.length + 1; i++) {
	            array[i - 1]["key"] = i;
	        }
	        var rows = array.map(function (n) {
	            return (React.createElement("tr", {key: n.key}, React.createElement("th", null, " ", n.courses_title, " "), React.createElement("th", null, " ", n.courses_instructor, " "), React.createElement("th", null, " ", n.courses_id, " "), React.createElement("th", null, " ", n.courses_dept, " "), React.createElement("th", null, " ", n.courses_size, " ")));
	        });
	        return rows;
	    };
	    QueryComponent.prototype.renderCoursesTable = function () {
	        return (React.createElement("table", {id: "coursesTable"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "Title"), React.createElement("th", null, "Instructor"), React.createElement("th", null, "Course Number"), React.createElement("th", null, "Department"), React.createElement("th", null, "Section Size"))), React.createElement("tbody", null, this.renderCourseTableRow())));
	    };
	    QueryComponent.prototype.renderRoomsTableRow = function () {
	        var array = this.state.roomResult;
	        for (var i = 1; i < array.length + 1; i++) {
	            array[i - 1]["key"] = i;
	        }
	        var rows = array.map(function (n) {
	            return (React.createElement("tr", {key: n.key}, React.createElement("th", null, " ", n.rooms_fullname, " "), React.createElement("th", null, " ", n.rooms_number, " "), React.createElement("th", null, " ", n.rooms_seats, " "), React.createElement("th", null, " ", n.rooms_type, " "), React.createElement("th", null, " ", n.rooms_furniture, " ")));
	        });
	        return rows;
	    };
	    QueryComponent.prototype.renderRoomsTable = function () {
	        return (React.createElement("table", {id: "roomsTable"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "Building Name"), React.createElement("th", null, "Room Number"), React.createElement("th", null, "Room Size"), React.createElement("th", null, "Room Type"), React.createElement("th", null, "Room Furniture"))), React.createElement("tbody", null, this.renderRoomsTableRow())));
	    };
	    QueryComponent.prototype.handleScheduler = function (event, rooms, sections) {
	        var controller = new ScheduleController_1.default();
	        var schedule = controller.makeSchedule(rooms, sections);
	        var quality = controller.checkQuality(schedule);
	        console.log('Quality = ' + quality);
	        this.setState({ schedule: schedule });
	        this.render();
	    };
	    QueryComponent.prototype.renderScheduleTableRow = function () {
	        var array = this.state.schedule;
	        for (var i = 0; i < array.length; i++) {
	            array[i]["key"] = i + 1;
	        }
	        var rows = array.map(function (n) {
	            return (React.createElement("tr", {key: n.key}, React.createElement("th", null, " ", n.Section.courses_title, " "), React.createElement("th", null, " ", n.Section.courses_id, " "), React.createElement("th", null, " ", n.Room.rooms_name, " "), React.createElement("th", null, " ", n.time.time + n.time.days, " ")));
	        });
	        return rows;
	    };
	    QueryComponent.prototype.renderScheduleTable = function () {
	        return (React.createElement("table", {id: "scheduleTable"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "Title"), React.createElement("th", null, "Section"), React.createElement("th", null, "Room"), React.createElement("th", null, "Time"))), React.createElement("tbody", null, this.renderScheduleTableRow())));
	    };
	    QueryComponent.prototype.componentDidMount = function () {
	    };
	    QueryComponent.prototype.render = function () {
	        var _this = this;
	        var style1 = {
	            backgroundColor: 'rgb(240,250,255)',
	            float: 'left',
	            borderStyle: 'solid',
	            borderWidth: '1px',
	            width: '100%'
	        };
	        var style11 = {
	            backgroundColor: 'rgb(240,250,255)',
	            float: 'left',
	            width: '33%'
	        };
	        var style111 = {
	            backgroundColor: 'rgb(240,250,255)',
	            float: 'right',
	            width: '30%'
	        };
	        var style110 = {
	            backgroundColor: 'rgb(240,250,255)',
	            float: 'right',
	            width: '18%'
	        };
	        var style2 = {
	            backgroundColor: 'rgb(240,255,250)',
	            float: 'left',
	            borderStyle: 'solid',
	            borderWidth: '1px',
	            width: '100%'
	        };
	        var style21 = {
	            backgroundColor: 'rgb(240,255,250)',
	            float: 'left',
	            width: '33%'
	        };
	        var style215 = {
	            backgroundColor: 'rgb(240,255,250)',
	            float: 'left',
	            width: '50%'
	        };
	        var experiment = ['some', 'fake', 'options', 'to', 'test'];
	        var makeSelectItem = function (x) { return React.createElement("option", {value: x}, x); };
	        return (React.createElement("div", null, React.createElement("div", {id: 'title'}, React.createElement("h3", null, "UBC Course Catalog")), React.createElement("div", {id: 'searchbar'}, React.createElement("div", {style: style1}, React.createElement("h4", null, "Course Xplorer"), React.createElement("div", null, React.createElement("p", null, "Search the course catalog by course title or instructor:"), React.createElement("input", {onChange: function (e) { return _this.updateCourseSearch(e); }}), React.createElement("button", {name: "SearchCourses", onClick: function (e) { return _this.handleCourseSearch(e, _this.state.courseSearch); }}, "Search")), React.createElement("div", null, React.createElement("h4", null, "Filters"), React.createElement("div", null, React.createElement("div", {style: style11}, React.createElement("p", null, "Size:", React.createElement("select", {value: this.state.name, onChange: function (e) { return _this.updateCourseFilters(e, 2); }}, React.createElement("option", {value: ""}, " - "), React.createElement("option", {value: "GT"}, "Greater Than"), React.createElement("option", {value: "LT"}, "Less Than"), React.createElement("option", {value: "EQ"}, "Equal To")), React.createElement("input", {onChange: function (e) { return _this.updateCourseFilters(e, 1); }}))), React.createElement("div", {style: style11}, React.createElement("p", null, "Dept:", React.createElement("input", {onChange: function (e) { return _this.updateCourseFilters(e, 3); }}))), React.createElement("div", {style: style11}, React.createElement("p", null, "Number:", React.createElement("input", {onChange: function (e) { return _this.updateCourseFilters(e, 4); }}))))), React.createElement("div", {style: style110}, React.createElement("button", {name: "ApplyCourses", onClick: function (e) { return _this.applyCourseFilters(e); }}, "Apply")), React.createElement("div", null, React.createElement("h5", null, "Filters:"), React.createElement("p", null, "Size:  ", this.state.courseFilters_size_mod, " ", this.state.courseFilters_size), React.createElement("p", null, "Dept: ", this.state.courseFilters_dept), React.createElement("p", null, "Number: ", this.state.courseFilters_num), React.createElement("div", null, React.createElement("div", {style: style110}, React.createElement("p", null, React.createElement("input", {type: "checkbox", name: "sortAvg", value: "avg", onChange: function (e) { return _this.updateCourseSorting(e); }}), "average")), React.createElement("div", {style: style110}, React.createElement("p", null, React.createElement("input", {type: "checkbox", name: "sortFail", value: "fail", onChange: function (e) { return _this.updateCourseSorting(e); }}), "most failing")), React.createElement("div", {style: style111}, React.createElement("p", null, "Sort by:", React.createElement("input", {type: "checkbox", name: "sortPass", value: "pass", onChange: function (e) { return _this.updateCourseSorting(e); }}), "most passing")))), React.createElement("div", {id: 'courseResult'}, React.createElement("h4", null, "Results"), this.renderCoursesTable())), React.createElement("div", {style: style2}, React.createElement("h4", null, "Room Xplorer"), React.createElement("div", null, React.createElement("p", null, "Search the rooms of UBC by building (full name or abbreviation) or room number:"), React.createElement("input", {onChange: function (e) { return _this.updateRoomSearch(e); }}), React.createElement("button", {name: "SearchRooms", onClick: function (e) { return _this.handleRoomSearch(e, _this.state.roomSearch); }}, "Search")), React.createElement("div", null, React.createElement("h4", null, "Filters"), React.createElement("div", null, React.createElement("div", {style: style21}, React.createElement("p", null, "Size:", React.createElement("select", {value: this.state.name, onChange: function (e) { return _this.updateRoomFilters(e, 1); }}, React.createElement("option", {value: ""}, " - "), React.createElement("option", {value: "GT"}, "Greater Than"), React.createElement("option", {value: "LT"}, "Less Than"), React.createElement("option", {value: "EQ"}, "Equal To")), React.createElement("input", {onChange: function (e) { return _this.updateRoomFilters(e, 2); }}))), React.createElement("div", {style: style21}, React.createElement("p", null, "Type:", React.createElement("select", {value: this.state.name, onChange: function (e) { return _this.updateRoomFilters(e, 3); }}, React.createElement("option", {value: ""}, " - choose type - "), React.createElement("option", {value: "Small Group"}, "Small Group"), React.createElement("option", {value: "Tiered Large Group"}, "Tiered Large Group"), React.createElement("option", {value: "Open Design General Purpose"}, "Open Design General Purpose"), React.createElement("option", {value: "Case Style"}, "Case Style")))), React.createElement("div", {style: style21}, React.createElement("p", null, "Furniture:", React.createElement("select", {value: this.state.name, onChange: function (e) { return _this.updateRoomFilters(e, 4); }}, React.createElement("option", {value: ""}, " - choose furniture - "), React.createElement("option", {value: "Classroom-Movable Tables & Chairs"}, "Movable Tables & Chairs"), React.createElement("option", {value: "Classroom-Fixed Tables/Movable Chairs"}, "Fixed Tables/Movable Chairs"), React.createElement("option", {value: "Classroom-Movable Tablets"}, "Movable Tablets"), React.createElement("option", {value: "Classroom-Fixed Tablets"}, "Fixed Tablets"))))), React.createElement("button", {name: "ApplyRooms", onClick: function (e) { return _this.applyRoomFilters(e, _this.state.roomFilters); }}, "Apply")), React.createElement("div", null, React.createElement("h5", null, "Filters:"), React.createElement("p", null, "Size: ", this.state.roomFilters_size_mod, " ", this.state.roomFilters_size), React.createElement("p", null, "Furniture: ", this.state.roomFilters_furniture), React.createElement("p", null, "Type: ", this.state.roomFilters_type)), React.createElement("div", {id: 'roomResult'}, React.createElement("h4", null, "Results"), this.renderRoomsTable()))), React.createElement("div", {id: "scheduler", style: style1}, React.createElement("h4", null, "Scheduler"), React.createElement("p", null, "Click to schedule the selected courses into the selected rooms"), React.createElement("button", {name: "makeSchedule", onClick: function (e) { return _this.handleScheduler(e, _this.state.roomResult, _this.state.courseResult); }}, "Create!"), this.renderScheduleTable())));
	    };
	    return QueryComponent;
	}(React.Component));
	exports.QueryComponent = QueryComponent;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(5);

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(6);
	var bind = __webpack_require__(7);
	var Axios = __webpack_require__(8);
	var defaults = __webpack_require__(9);
	
	/**
	 * Create an instance of Axios
	 *
	 * @param {Object} defaultConfig The default config for the instance
	 * @return {Axios} A new instance of Axios
	 */
	function createInstance(defaultConfig) {
	  var context = new Axios(defaultConfig);
	  var instance = bind(Axios.prototype.request, context);
	
	  // Copy axios.prototype to instance
	  utils.extend(instance, Axios.prototype, context);
	
	  // Copy context to instance
	  utils.extend(instance, context);
	
	  return instance;
	}
	
	// Create the default instance to be exported
	var axios = createInstance(defaults);
	
	// Expose Axios class to allow class inheritance
	axios.Axios = Axios;
	
	// Factory for creating new instances
	axios.create = function create(instanceConfig) {
	  return createInstance(utils.merge(defaults, instanceConfig));
	};
	
	// Expose Cancel & CancelToken
	axios.Cancel = __webpack_require__(27);
	axios.CancelToken = __webpack_require__(28);
	axios.isCancel = __webpack_require__(24);
	
	// Expose all/spread
	axios.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios.spread = __webpack_require__(29);
	
	module.exports = axios;
	
	// Allow use of default import syntax in TypeScript
	module.exports.default = axios;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bind = __webpack_require__(7);
	
	/*global toString:true*/
	
	// utils is a library of generic helper functions non-specific to axios
	
	var toString = Object.prototype.toString;
	
	/**
	 * Determine if a value is an Array
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Array, otherwise false
	 */
	function isArray(val) {
	  return toString.call(val) === '[object Array]';
	}
	
	/**
	 * Determine if a value is an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
	 */
	function isArrayBuffer(val) {
	  return toString.call(val) === '[object ArrayBuffer]';
	}
	
	/**
	 * Determine if a value is a FormData
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an FormData, otherwise false
	 */
	function isFormData(val) {
	  return (typeof FormData !== 'undefined') && (val instanceof FormData);
	}
	
	/**
	 * Determine if a value is a view on an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	 */
	function isArrayBufferView(val) {
	  var result;
	  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
	    result = ArrayBuffer.isView(val);
	  } else {
	    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
	  }
	  return result;
	}
	
	/**
	 * Determine if a value is a String
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a String, otherwise false
	 */
	function isString(val) {
	  return typeof val === 'string';
	}
	
	/**
	 * Determine if a value is a Number
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Number, otherwise false
	 */
	function isNumber(val) {
	  return typeof val === 'number';
	}
	
	/**
	 * Determine if a value is undefined
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if the value is undefined, otherwise false
	 */
	function isUndefined(val) {
	  return typeof val === 'undefined';
	}
	
	/**
	 * Determine if a value is an Object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Object, otherwise false
	 */
	function isObject(val) {
	  return val !== null && typeof val === 'object';
	}
	
	/**
	 * Determine if a value is a Date
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Date, otherwise false
	 */
	function isDate(val) {
	  return toString.call(val) === '[object Date]';
	}
	
	/**
	 * Determine if a value is a File
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	function isFile(val) {
	  return toString.call(val) === '[object File]';
	}
	
	/**
	 * Determine if a value is a Blob
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Blob, otherwise false
	 */
	function isBlob(val) {
	  return toString.call(val) === '[object Blob]';
	}
	
	/**
	 * Determine if a value is a Function
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Function, otherwise false
	 */
	function isFunction(val) {
	  return toString.call(val) === '[object Function]';
	}
	
	/**
	 * Determine if a value is a Stream
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Stream, otherwise false
	 */
	function isStream(val) {
	  return isObject(val) && isFunction(val.pipe);
	}
	
	/**
	 * Determine if a value is a URLSearchParams object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
	 */
	function isURLSearchParams(val) {
	  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
	}
	
	/**
	 * Trim excess whitespace off the beginning and end of a string
	 *
	 * @param {String} str The String to trim
	 * @returns {String} The String freed of excess whitespace
	 */
	function trim(str) {
	  return str.replace(/^\s*/, '').replace(/\s*$/, '');
	}
	
	/**
	 * Determine if we're running in a standard browser environment
	 *
	 * This allows axios to run in a web worker, and react-native.
	 * Both environments support XMLHttpRequest, but not fully standard globals.
	 *
	 * web workers:
	 *  typeof window -> undefined
	 *  typeof document -> undefined
	 *
	 * react-native:
	 *  typeof document.createElement -> undefined
	 */
	function isStandardBrowserEnv() {
	  return (
	    typeof window !== 'undefined' &&
	    typeof document !== 'undefined' &&
	    typeof document.createElement === 'function'
	  );
	}
	
	/**
	 * Iterate over an Array or an Object invoking a function for each item.
	 *
	 * If `obj` is an Array callback will be called passing
	 * the value, index, and complete array for each item.
	 *
	 * If 'obj' is an Object callback will be called passing
	 * the value, key, and complete object for each property.
	 *
	 * @param {Object|Array} obj The object to iterate
	 * @param {Function} fn The callback to invoke for each item
	 */
	function forEach(obj, fn) {
	  // Don't bother if no value provided
	  if (obj === null || typeof obj === 'undefined') {
	    return;
	  }
	
	  // Force an array if not already something iterable
	  if (typeof obj !== 'object' && !isArray(obj)) {
	    /*eslint no-param-reassign:0*/
	    obj = [obj];
	  }
	
	  if (isArray(obj)) {
	    // Iterate over array values
	    for (var i = 0, l = obj.length; i < l; i++) {
	      fn.call(null, obj[i], i, obj);
	    }
	  } else {
	    // Iterate over object keys
	    for (var key in obj) {
	      if (Object.prototype.hasOwnProperty.call(obj, key)) {
	        fn.call(null, obj[key], key, obj);
	      }
	    }
	  }
	}
	
	/**
	 * Accepts varargs expecting each argument to be an object, then
	 * immutably merges the properties of each object and returns result.
	 *
	 * When multiple objects contain the same key the later object in
	 * the arguments list will take precedence.
	 *
	 * Example:
	 *
	 * ```js
	 * var result = merge({foo: 123}, {foo: 456});
	 * console.log(result.foo); // outputs 456
	 * ```
	 *
	 * @param {Object} obj1 Object to merge
	 * @returns {Object} Result of all merge properties
	 */
	function merge(/* obj1, obj2, obj3, ... */) {
	  var result = {};
	  function assignValue(val, key) {
	    if (typeof result[key] === 'object' && typeof val === 'object') {
	      result[key] = merge(result[key], val);
	    } else {
	      result[key] = val;
	    }
	  }
	
	  for (var i = 0, l = arguments.length; i < l; i++) {
	    forEach(arguments[i], assignValue);
	  }
	  return result;
	}
	
	/**
	 * Extends object a by mutably adding to it the properties of object b.
	 *
	 * @param {Object} a The object to be extended
	 * @param {Object} b The object to copy properties from
	 * @param {Object} thisArg The object to bind function to
	 * @return {Object} The resulting value of object a
	 */
	function extend(a, b, thisArg) {
	  forEach(b, function assignValue(val, key) {
	    if (thisArg && typeof val === 'function') {
	      a[key] = bind(val, thisArg);
	    } else {
	      a[key] = val;
	    }
	  });
	  return a;
	}
	
	module.exports = {
	  isArray: isArray,
	  isArrayBuffer: isArrayBuffer,
	  isFormData: isFormData,
	  isArrayBufferView: isArrayBufferView,
	  isString: isString,
	  isNumber: isNumber,
	  isObject: isObject,
	  isUndefined: isUndefined,
	  isDate: isDate,
	  isFile: isFile,
	  isBlob: isBlob,
	  isFunction: isFunction,
	  isStream: isStream,
	  isURLSearchParams: isURLSearchParams,
	  isStandardBrowserEnv: isStandardBrowserEnv,
	  forEach: forEach,
	  merge: merge,
	  extend: extend,
	  trim: trim
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function bind(fn, thisArg) {
	  return function wrap() {
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    return fn.apply(thisArg, args);
	  };
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var defaults = __webpack_require__(9);
	var utils = __webpack_require__(6);
	var InterceptorManager = __webpack_require__(21);
	var dispatchRequest = __webpack_require__(22);
	var isAbsoluteURL = __webpack_require__(25);
	var combineURLs = __webpack_require__(26);
	
	/**
	 * Create a new instance of Axios
	 *
	 * @param {Object} instanceConfig The default config for the instance
	 */
	function Axios(instanceConfig) {
	  this.defaults = instanceConfig;
	  this.interceptors = {
	    request: new InterceptorManager(),
	    response: new InterceptorManager()
	  };
	}
	
	/**
	 * Dispatch a request
	 *
	 * @param {Object} config The config specific for this request (merged with this.defaults)
	 */
	Axios.prototype.request = function request(config) {
	  /*eslint no-param-reassign:0*/
	  // Allow for axios('example/url'[, config]) a la fetch API
	  if (typeof config === 'string') {
	    config = utils.merge({
	      url: arguments[0]
	    }, arguments[1]);
	  }
	
	  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);
	
	  // Support baseURL config
	  if (config.baseURL && !isAbsoluteURL(config.url)) {
	    config.url = combineURLs(config.baseURL, config.url);
	  }
	
	  // Hook up interceptors middleware
	  var chain = [dispatchRequest, undefined];
	  var promise = Promise.resolve(config);
	
	  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
	    chain.unshift(interceptor.fulfilled, interceptor.rejected);
	  });
	
	  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
	    chain.push(interceptor.fulfilled, interceptor.rejected);
	  });
	
	  while (chain.length) {
	    promise = promise.then(chain.shift(), chain.shift());
	  }
	
	  return promise;
	};
	
	// Provide aliases for supported request methods
	utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url
	    }));
	  };
	});
	
	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, data, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url,
	      data: data
	    }));
	  };
	});
	
	module.exports = Axios;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var utils = __webpack_require__(6);
	var normalizeHeaderName = __webpack_require__(11);
	
	var PROTECTION_PREFIX = /^\)\]\}',?\n/;
	var DEFAULT_CONTENT_TYPE = {
	  'Content-Type': 'application/x-www-form-urlencoded'
	};
	
	function setContentTypeIfUnset(headers, value) {
	  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
	    headers['Content-Type'] = value;
	  }
	}
	
	function getDefaultAdapter() {
	  var adapter;
	  if (typeof XMLHttpRequest !== 'undefined') {
	    // For browsers use XHR adapter
	    adapter = __webpack_require__(12);
	  } else if (typeof process !== 'undefined') {
	    // For node use HTTP adapter
	    adapter = __webpack_require__(12);
	  }
	  return adapter;
	}
	
	var defaults = {
	  adapter: getDefaultAdapter(),
	
	  transformRequest: [function transformRequest(data, headers) {
	    normalizeHeaderName(headers, 'Content-Type');
	    if (utils.isFormData(data) ||
	      utils.isArrayBuffer(data) ||
	      utils.isStream(data) ||
	      utils.isFile(data) ||
	      utils.isBlob(data)
	    ) {
	      return data;
	    }
	    if (utils.isArrayBufferView(data)) {
	      return data.buffer;
	    }
	    if (utils.isURLSearchParams(data)) {
	      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
	      return data.toString();
	    }
	    if (utils.isObject(data)) {
	      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
	      return JSON.stringify(data);
	    }
	    return data;
	  }],
	
	  transformResponse: [function transformResponse(data) {
	    /*eslint no-param-reassign:0*/
	    if (typeof data === 'string') {
	      data = data.replace(PROTECTION_PREFIX, '');
	      try {
	        data = JSON.parse(data);
	      } catch (e) { /* Ignore */ }
	    }
	    return data;
	  }],
	
	  timeout: 0,
	
	  xsrfCookieName: 'XSRF-TOKEN',
	  xsrfHeaderName: 'X-XSRF-TOKEN',
	
	  maxContentLength: -1,
	
	  validateStatus: function validateStatus(status) {
	    return status >= 200 && status < 300;
	  }
	};
	
	defaults.headers = {
	  common: {
	    'Accept': 'application/json, text/plain, */*'
	  }
	};
	
	utils.forEach(['delete', 'get', 'head'], function forEachMehtodNoData(method) {
	  defaults.headers[method] = {};
	});
	
	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
	});
	
	module.exports = defaults;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10)))

/***/ },
/* 10 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(6);
	
	module.exports = function normalizeHeaderName(headers, normalizedName) {
	  utils.forEach(headers, function processHeader(value, name) {
	    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
	      headers[normalizedName] = value;
	      delete headers[name];
	    }
	  });
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var utils = __webpack_require__(6);
	var settle = __webpack_require__(13);
	var buildURL = __webpack_require__(16);
	var parseHeaders = __webpack_require__(17);
	var isURLSameOrigin = __webpack_require__(18);
	var createError = __webpack_require__(14);
	var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || __webpack_require__(19);
	
	module.exports = function xhrAdapter(config) {
	  return new Promise(function dispatchXhrRequest(resolve, reject) {
	    var requestData = config.data;
	    var requestHeaders = config.headers;
	
	    if (utils.isFormData(requestData)) {
	      delete requestHeaders['Content-Type']; // Let the browser set it
	    }
	
	    var request = new XMLHttpRequest();
	    var loadEvent = 'onreadystatechange';
	    var xDomain = false;
	
	    // For IE 8/9 CORS support
	    // Only supports POST and GET calls and doesn't returns the response headers.
	    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
	    if (process.env.NODE_ENV !== 'test' &&
	        typeof window !== 'undefined' &&
	        window.XDomainRequest && !('withCredentials' in request) &&
	        !isURLSameOrigin(config.url)) {
	      request = new window.XDomainRequest();
	      loadEvent = 'onload';
	      xDomain = true;
	      request.onprogress = function handleProgress() {};
	      request.ontimeout = function handleTimeout() {};
	    }
	
	    // HTTP basic authentication
	    if (config.auth) {
	      var username = config.auth.username || '';
	      var password = config.auth.password || '';
	      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
	    }
	
	    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);
	
	    // Set the request timeout in MS
	    request.timeout = config.timeout;
	
	    // Listen for ready state
	    request[loadEvent] = function handleLoad() {
	      if (!request || (request.readyState !== 4 && !xDomain)) {
	        return;
	      }
	
	      // The request errored out and we didn't get a response, this will be
	      // handled by onerror instead
	      // With one exception: request that using file: protocol, most browsers
	      // will return status as 0 even though it's a successful request
	      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
	        return;
	      }
	
	      // Prepare the response
	      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
	      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
	      var response = {
	        data: responseData,
	        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
	        status: request.status === 1223 ? 204 : request.status,
	        statusText: request.status === 1223 ? 'No Content' : request.statusText,
	        headers: responseHeaders,
	        config: config,
	        request: request
	      };
	
	      settle(resolve, reject, response);
	
	      // Clean up request
	      request = null;
	    };
	
	    // Handle low level network errors
	    request.onerror = function handleError() {
	      // Real errors are hidden from us by the browser
	      // onerror should only fire if it's a network error
	      reject(createError('Network Error', config));
	
	      // Clean up request
	      request = null;
	    };
	
	    // Handle timeout
	    request.ontimeout = function handleTimeout() {
	      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED'));
	
	      // Clean up request
	      request = null;
	    };
	
	    // Add xsrf header
	    // This is only done if running in a standard browser environment.
	    // Specifically not if we're in a web worker, or react-native.
	    if (utils.isStandardBrowserEnv()) {
	      var cookies = __webpack_require__(20);
	
	      // Add xsrf header
	      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
	          cookies.read(config.xsrfCookieName) :
	          undefined;
	
	      if (xsrfValue) {
	        requestHeaders[config.xsrfHeaderName] = xsrfValue;
	      }
	    }
	
	    // Add headers to the request
	    if ('setRequestHeader' in request) {
	      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
	        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
	          // Remove Content-Type if data is undefined
	          delete requestHeaders[key];
	        } else {
	          // Otherwise add header to the request
	          request.setRequestHeader(key, val);
	        }
	      });
	    }
	
	    // Add withCredentials to request if needed
	    if (config.withCredentials) {
	      request.withCredentials = true;
	    }
	
	    // Add responseType to request if needed
	    if (config.responseType) {
	      try {
	        request.responseType = config.responseType;
	      } catch (e) {
	        if (request.responseType !== 'json') {
	          throw e;
	        }
	      }
	    }
	
	    // Handle progress if needed
	    if (typeof config.onDownloadProgress === 'function') {
	      request.addEventListener('progress', config.onDownloadProgress);
	    }
	
	    // Not all browsers support upload events
	    if (typeof config.onUploadProgress === 'function' && request.upload) {
	      request.upload.addEventListener('progress', config.onUploadProgress);
	    }
	
	    if (config.cancelToken) {
	      // Handle cancellation
	      config.cancelToken.promise.then(function onCanceled(cancel) {
	        if (!request) {
	          return;
	        }
	
	        request.abort();
	        reject(cancel);
	        // Clean up request
	        request = null;
	      });
	    }
	
	    if (requestData === undefined) {
	      requestData = null;
	    }
	
	    // Send the request
	    request.send(requestData);
	  });
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10)))

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var createError = __webpack_require__(14);
	
	/**
	 * Resolve or reject a Promise based on response status.
	 *
	 * @param {Function} resolve A function that resolves the promise.
	 * @param {Function} reject A function that rejects the promise.
	 * @param {object} response The response.
	 */
	module.exports = function settle(resolve, reject, response) {
	  var validateStatus = response.config.validateStatus;
	  // Note: status is not exposed by XDomainRequest
	  if (!response.status || !validateStatus || validateStatus(response.status)) {
	    resolve(response);
	  } else {
	    reject(createError(
	      'Request failed with status code ' + response.status,
	      response.config,
	      null,
	      response
	    ));
	  }
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var enhanceError = __webpack_require__(15);
	
	/**
	 * Create an Error with the specified message, config, error code, and response.
	 *
	 * @param {string} message The error message.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 @ @param {Object} [response] The response.
	 * @returns {Error} The created error.
	 */
	module.exports = function createError(message, config, code, response) {
	  var error = new Error(message);
	  return enhanceError(error, config, code, response);
	};


/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Update an Error with the specified config, error code, and response.
	 *
	 * @param {Error} error The error to update.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 @ @param {Object} [response] The response.
	 * @returns {Error} The error.
	 */
	module.exports = function enhanceError(error, config, code, response) {
	  error.config = config;
	  if (code) {
	    error.code = code;
	  }
	  error.response = response;
	  return error;
	};


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(6);
	
	function encode(val) {
	  return encodeURIComponent(val).
	    replace(/%40/gi, '@').
	    replace(/%3A/gi, ':').
	    replace(/%24/g, '$').
	    replace(/%2C/gi, ',').
	    replace(/%20/g, '+').
	    replace(/%5B/gi, '[').
	    replace(/%5D/gi, ']');
	}
	
	/**
	 * Build a URL by appending params to the end
	 *
	 * @param {string} url The base of the url (e.g., http://www.google.com)
	 * @param {object} [params] The params to be appended
	 * @returns {string} The formatted url
	 */
	module.exports = function buildURL(url, params, paramsSerializer) {
	  /*eslint no-param-reassign:0*/
	  if (!params) {
	    return url;
	  }
	
	  var serializedParams;
	  if (paramsSerializer) {
	    serializedParams = paramsSerializer(params);
	  } else if (utils.isURLSearchParams(params)) {
	    serializedParams = params.toString();
	  } else {
	    var parts = [];
	
	    utils.forEach(params, function serialize(val, key) {
	      if (val === null || typeof val === 'undefined') {
	        return;
	      }
	
	      if (utils.isArray(val)) {
	        key = key + '[]';
	      }
	
	      if (!utils.isArray(val)) {
	        val = [val];
	      }
	
	      utils.forEach(val, function parseValue(v) {
	        if (utils.isDate(v)) {
	          v = v.toISOString();
	        } else if (utils.isObject(v)) {
	          v = JSON.stringify(v);
	        }
	        parts.push(encode(key) + '=' + encode(v));
	      });
	    });
	
	    serializedParams = parts.join('&');
	  }
	
	  if (serializedParams) {
	    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
	  }
	
	  return url;
	};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(6);
	
	/**
	 * Parse headers into an object
	 *
	 * ```
	 * Date: Wed, 27 Aug 2014 08:58:49 GMT
	 * Content-Type: application/json
	 * Connection: keep-alive
	 * Transfer-Encoding: chunked
	 * ```
	 *
	 * @param {String} headers Headers needing to be parsed
	 * @returns {Object} Headers parsed into an object
	 */
	module.exports = function parseHeaders(headers) {
	  var parsed = {};
	  var key;
	  var val;
	  var i;
	
	  if (!headers) { return parsed; }
	
	  utils.forEach(headers.split('\n'), function parser(line) {
	    i = line.indexOf(':');
	    key = utils.trim(line.substr(0, i)).toLowerCase();
	    val = utils.trim(line.substr(i + 1));
	
	    if (key) {
	      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
	    }
	  });
	
	  return parsed;
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(6);
	
	module.exports = (
	  utils.isStandardBrowserEnv() ?
	
	  // Standard browser envs have full support of the APIs needed to test
	  // whether the request URL is of the same origin as current location.
	  (function standardBrowserEnv() {
	    var msie = /(msie|trident)/i.test(navigator.userAgent);
	    var urlParsingNode = document.createElement('a');
	    var originURL;
	
	    /**
	    * Parse a URL to discover it's components
	    *
	    * @param {String} url The URL to be parsed
	    * @returns {Object}
	    */
	    function resolveURL(url) {
	      var href = url;
	
	      if (msie) {
	        // IE needs attribute set twice to normalize properties
	        urlParsingNode.setAttribute('href', href);
	        href = urlParsingNode.href;
	      }
	
	      urlParsingNode.setAttribute('href', href);
	
	      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
	      return {
	        href: urlParsingNode.href,
	        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
	        host: urlParsingNode.host,
	        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
	        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
	        hostname: urlParsingNode.hostname,
	        port: urlParsingNode.port,
	        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
	                  urlParsingNode.pathname :
	                  '/' + urlParsingNode.pathname
	      };
	    }
	
	    originURL = resolveURL(window.location.href);
	
	    /**
	    * Determine if a URL shares the same origin as the current location
	    *
	    * @param {String} requestURL The URL to test
	    * @returns {boolean} True if URL shares the same origin, otherwise false
	    */
	    return function isURLSameOrigin(requestURL) {
	      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
	      return (parsed.protocol === originURL.protocol &&
	            parsed.host === originURL.host);
	    };
	  })() :
	
	  // Non standard browser envs (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return function isURLSameOrigin() {
	      return true;
	    };
	  })()
	);


/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';
	
	// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js
	
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	
	function E() {
	  this.message = 'String contains an invalid character';
	}
	E.prototype = new Error;
	E.prototype.code = 5;
	E.prototype.name = 'InvalidCharacterError';
	
	function btoa(input) {
	  var str = String(input);
	  var output = '';
	  for (
	    // initialize result and counter
	    var block, charCode, idx = 0, map = chars;
	    // if the next str index does not exist:
	    //   change the mapping table to "="
	    //   check if d has no fractional digits
	    str.charAt(idx | 0) || (map = '=', idx % 1);
	    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
	    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
	  ) {
	    charCode = str.charCodeAt(idx += 3 / 4);
	    if (charCode > 0xFF) {
	      throw new E();
	    }
	    block = block << 8 | charCode;
	  }
	  return output;
	}
	
	module.exports = btoa;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(6);
	
	module.exports = (
	  utils.isStandardBrowserEnv() ?
	
	  // Standard browser envs support document.cookie
	  (function standardBrowserEnv() {
	    return {
	      write: function write(name, value, expires, path, domain, secure) {
	        var cookie = [];
	        cookie.push(name + '=' + encodeURIComponent(value));
	
	        if (utils.isNumber(expires)) {
	          cookie.push('expires=' + new Date(expires).toGMTString());
	        }
	
	        if (utils.isString(path)) {
	          cookie.push('path=' + path);
	        }
	
	        if (utils.isString(domain)) {
	          cookie.push('domain=' + domain);
	        }
	
	        if (secure === true) {
	          cookie.push('secure');
	        }
	
	        document.cookie = cookie.join('; ');
	      },
	
	      read: function read(name) {
	        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
	        return (match ? decodeURIComponent(match[3]) : null);
	      },
	
	      remove: function remove(name) {
	        this.write(name, '', Date.now() - 86400000);
	      }
	    };
	  })() :
	
	  // Non standard browser env (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return {
	      write: function write() {},
	      read: function read() { return null; },
	      remove: function remove() {}
	    };
	  })()
	);


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(6);
	
	function InterceptorManager() {
	  this.handlers = [];
	}
	
	/**
	 * Add a new interceptor to the stack
	 *
	 * @param {Function} fulfilled The function to handle `then` for a `Promise`
	 * @param {Function} rejected The function to handle `reject` for a `Promise`
	 *
	 * @return {Number} An ID used to remove interceptor later
	 */
	InterceptorManager.prototype.use = function use(fulfilled, rejected) {
	  this.handlers.push({
	    fulfilled: fulfilled,
	    rejected: rejected
	  });
	  return this.handlers.length - 1;
	};
	
	/**
	 * Remove an interceptor from the stack
	 *
	 * @param {Number} id The ID that was returned by `use`
	 */
	InterceptorManager.prototype.eject = function eject(id) {
	  if (this.handlers[id]) {
	    this.handlers[id] = null;
	  }
	};
	
	/**
	 * Iterate over all the registered interceptors
	 *
	 * This method is particularly useful for skipping over any
	 * interceptors that may have become `null` calling `eject`.
	 *
	 * @param {Function} fn The function to call for each interceptor
	 */
	InterceptorManager.prototype.forEach = function forEach(fn) {
	  utils.forEach(this.handlers, function forEachHandler(h) {
	    if (h !== null) {
	      fn(h);
	    }
	  });
	};
	
	module.exports = InterceptorManager;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(6);
	var transformData = __webpack_require__(23);
	var isCancel = __webpack_require__(24);
	var defaults = __webpack_require__(9);
	
	/**
	 * Throws a `Cancel` if cancellation has been requested.
	 */
	function throwIfCancellationRequested(config) {
	  if (config.cancelToken) {
	    config.cancelToken.throwIfRequested();
	  }
	}
	
	/**
	 * Dispatch a request to the server using the configured adapter.
	 *
	 * @param {object} config The config that is to be used for the request
	 * @returns {Promise} The Promise to be fulfilled
	 */
	module.exports = function dispatchRequest(config) {
	  throwIfCancellationRequested(config);
	
	  // Ensure headers exist
	  config.headers = config.headers || {};
	
	  // Transform request data
	  config.data = transformData(
	    config.data,
	    config.headers,
	    config.transformRequest
	  );
	
	  // Flatten headers
	  config.headers = utils.merge(
	    config.headers.common || {},
	    config.headers[config.method] || {},
	    config.headers || {}
	  );
	
	  utils.forEach(
	    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
	    function cleanHeaderConfig(method) {
	      delete config.headers[method];
	    }
	  );
	
	  var adapter = config.adapter || defaults.adapter;
	
	  return adapter(config).then(function onAdapterResolution(response) {
	    throwIfCancellationRequested(config);
	
	    // Transform response data
	    response.data = transformData(
	      response.data,
	      response.headers,
	      config.transformResponse
	    );
	
	    return response;
	  }, function onAdapterRejection(reason) {
	    if (!isCancel(reason)) {
	      throwIfCancellationRequested(config);
	
	      // Transform response data
	      if (reason && reason.response) {
	        reason.response.data = transformData(
	          reason.response.data,
	          reason.response.headers,
	          config.transformResponse
	        );
	      }
	    }
	
	    return Promise.reject(reason);
	  });
	};


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(6);
	
	/**
	 * Transform the data for a request or a response
	 *
	 * @param {Object|String} data The data to be transformed
	 * @param {Array} headers The headers for the request or response
	 * @param {Array|Function} fns A single function or Array of functions
	 * @returns {*} The resulting transformed data
	 */
	module.exports = function transformData(data, headers, fns) {
	  /*eslint no-param-reassign:0*/
	  utils.forEach(fns, function transform(fn) {
	    data = fn(data, headers);
	  });
	
	  return data;
	};


/***/ },
/* 24 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function isCancel(value) {
	  return !!(value && value.__CANCEL__);
	};


/***/ },
/* 25 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Determines whether the specified URL is absolute
	 *
	 * @param {string} url The URL to test
	 * @returns {boolean} True if the specified URL is absolute, otherwise false
	 */
	module.exports = function isAbsoluteURL(url) {
	  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
	  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
	  // by any combination of letters, digits, plus, period, or hyphen.
	  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
	};


/***/ },
/* 26 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Creates a new URL by combining the specified URLs
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} relativeURL The relative URL
	 * @returns {string} The combined URL
	 */
	module.exports = function combineURLs(baseURL, relativeURL) {
	  return baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '');
	};


/***/ },
/* 27 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * A `Cancel` is an object that is thrown when an operation is canceled.
	 *
	 * @class
	 * @param {string=} message The message.
	 */
	function Cancel(message) {
	  this.message = message;
	}
	
	Cancel.prototype.toString = function toString() {
	  return 'Cancel' + (this.message ? ': ' + this.message : '');
	};
	
	Cancel.prototype.__CANCEL__ = true;
	
	module.exports = Cancel;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Cancel = __webpack_require__(27);
	
	/**
	 * A `CancelToken` is an object that can be used to request cancellation of an operation.
	 *
	 * @class
	 * @param {Function} executor The executor function.
	 */
	function CancelToken(executor) {
	  if (typeof executor !== 'function') {
	    throw new TypeError('executor must be a function.');
	  }
	
	  var resolvePromise;
	  this.promise = new Promise(function promiseExecutor(resolve) {
	    resolvePromise = resolve;
	  });
	
	  var token = this;
	  executor(function cancel(message) {
	    if (token.reason) {
	      // Cancellation has already been requested
	      return;
	    }
	
	    token.reason = new Cancel(message);
	    resolvePromise(token.reason);
	  });
	}
	
	/**
	 * Throws a `Cancel` if cancellation has been requested.
	 */
	CancelToken.prototype.throwIfRequested = function throwIfRequested() {
	  if (this.reason) {
	    throw this.reason;
	  }
	};
	
	/**
	 * Returns an object that contains a new `CancelToken` and a function that, when called,
	 * cancels the `CancelToken`.
	 */
	CancelToken.source = function source() {
	  var cancel;
	  var token = new CancelToken(function executor(c) {
	    cancel = c;
	  });
	  return {
	    token: token,
	    cancel: cancel
	  };
	};
	
	module.exports = CancelToken;


/***/ },
/* 29 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Syntactic sugar for invoking a function and expanding an array for arguments.
	 *
	 * Common use case would be to use `Function.prototype.apply`.
	 *
	 *  ```js
	 *  function f(x, y, z) {}
	 *  var args = [1, 2, 3];
	 *  f.apply(null, args);
	 *  ```
	 *
	 * With `spread` this example can be re-written.
	 *
	 *  ```js
	 *  spread(function(x, y, z) {})([1, 2, 3]);
	 *  ```
	 *
	 * @param {Function} callback
	 * @returns {Function}
	 */
	module.exports = function spread(callback) {
	  return function wrap(arr) {
	    return callback.apply(null, arr);
	  };
	};


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Time_1 = __webpack_require__(31);
	var Scheduled_1 = __webpack_require__(32);
	var ScheduleController = (function () {
	    function ScheduleController() {
	        this.schedule = [];
	    }
	    ScheduleController.prototype.scheduleIsFree = function (array, room, time) {
	        for (var i = 0; i < array.length; i++) {
	            console.log(array[i].Room);
	            if (array[i].Room.rooms_name == room.rooms_name && array[i].time.time === time.time && array[i].time.days === time.days) {
	                return false;
	            }
	        }
	        return true;
	    };
	    ScheduleController.prototype.roomIsFree = function (room, time) {
	        var that = this;
	        if (this.schedule.length == 0) {
	            return true;
	        }
	        else {
	            return this.scheduleIsFree(that.schedule, room, time);
	        }
	    };
	    ScheduleController.prototype.findTime = function (section, possibleRooms, time) {
	        var that = this;
	        for (var _i = 0, possibleRooms_1 = possibleRooms; _i < possibleRooms_1.length; _i++) {
	            var r = possibleRooms_1[_i];
	            var flag = false;
	            if (that.schedule.length == 0) {
	                var timeslot = new Scheduled_1.default();
	                timeslot.time = time;
	                timeslot.Room = r;
	                timeslot.Section = section;
	                that.schedule.push(timeslot);
	                return timeslot;
	            }
	            else {
	                for (var _a = 0, _b = that.schedule; _a < _b.length; _a++) {
	                    var slot = _b[_a];
	                    var s = void 0;
	                    s = slot;
	                    if (slot.time.time === time.time && slot.time.days === time.days) {
	                        if (s.Room.rooms_shortname === r.rooms_shortname && s.Room.rooms_shortname === r.rooms_shortname) {
	                            flag = true;
	                            break;
	                        }
	                        else if (s.Section.courses_instructor == section.courses_instructor) {
	                            flag = true;
	                            break;
	                        }
	                        else {
	                            flag = false;
	                        }
	                    }
	                    else {
	                        flag = false;
	                    }
	                }
	                if (!flag) {
	                    var timeslot = new Scheduled_1.default();
	                    timeslot.time = time;
	                    timeslot.Room = r;
	                    timeslot.Section = section;
	                    that.schedule.push(timeslot);
	                    return timeslot;
	                }
	                else {
	                }
	            }
	        }
	        var newTime = time.getNext();
	        return that.findTime(section, possibleRooms, newTime);
	    };
	    ScheduleController.prototype.getRooms = function (size, rooms) {
	        var array = [];
	        for (var r in rooms) {
	            if (rooms[r].rooms_seats >= size) {
	                if (rooms[r].rooms_seats < 3 * size) {
	                    array.push(rooms[r]);
	                }
	            }
	        }
	        array.sort(function (obj1, obj2) {
	            return obj1.Seats - obj2.Seats;
	        });
	        return array;
	    };
	    ScheduleController.prototype.makeSchedule = function (rooms, sections) {
	        var that = this;
	        for (var j in sections) {
	            if (sections[j].courses_instructor == '') {
	                sections.splice(j, 1);
	            }
	        }
	        for (var i in sections) {
	            var time = new Time_1.default('MWF', 8);
	            var possibleRooms = that.getRooms(sections[i].courses_size, rooms);
	            if (possibleRooms.length == 0) {
	                if (that.isBigEnough(rooms, sections[i].courses_size)) {
	                    possibleRooms = rooms;
	                }
	                else {
	                    console.log('No room big enough');
	                    throw 'No room big enough';
	                }
	            }
	            var timeslot = that.findTime(sections[i], possibleRooms, time);
	        }
	        return that.schedule;
	    };
	    ScheduleController.prototype.checkQuality = function (schedule) {
	        var counter = 0;
	        for (var i in schedule) {
	            if (schedule[i].time.time > 17) {
	                counter++;
	            }
	        }
	        var quality = (counter / (schedule.length - 1));
	        return quality;
	    };
	    ScheduleController.prototype.isBigEnough = function (rooms, size) {
	        for (var r in rooms) {
	            if (rooms[r].rooms_seats >= size) {
	                return true;
	            }
	        }
	        return false;
	    };
	    return ScheduleController;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = ScheduleController;


/***/ },
/* 31 */
/***/ function(module, exports) {

	"use strict";
	var Time = (function () {
	    function Time(days, time) {
	        this.days = days;
	        this.time = time;
	    }
	    Time.prototype.validTime = function () {
	        if (this.days != 'MWF' || this.days != 'T/Th') {
	            return false;
	        }
	        else if (this.time % .5 != 0) {
	            return false;
	        }
	        else if (this.time >= 24 || this.time < 0) {
	            return false;
	        }
	        else {
	            return true;
	        }
	    };
	    Time.prototype.getNext = function () {
	        if (this.days == 'T/Th') {
	            if (this.time > 22) {
	                return new Time('MWF', 8);
	            }
	            else {
	                return new Time('T/Th', this.time + 1.5);
	            }
	        }
	        else if (this.time > 16) {
	            return new Time('T/Th', 8);
	        }
	        else {
	            return new Time('MWF', this.time + 1);
	        }
	    };
	    return Time;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Time;


/***/ },
/* 32 */
/***/ function(module, exports) {

	"use strict";
	var Scheduled = (function () {
	    function Scheduled() {
	    }
	    return Scheduled;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Scheduled;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map