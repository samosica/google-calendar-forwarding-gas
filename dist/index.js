function TitleFilter() {
}
function getApplicationDirectory() {
}
function getLastRetrievedEventListFile() {
}
function getLastRetrievedEventList() {
}
function saveLastRetrievedEventList() {
}
function getEventUpdates() {
}
function copyEvent() {
}
function syncEventUpdate() {
}
function sync() {
}/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// UNUSED EXPORTS: SimplifiedCalendarEvent, TitleFilter, compareCalendarEvent, copyEvent, getApplicationDirectory, getEventUpdates, getLastRetrievedEventList, getLastRetrievedEventListFile, saveLastRetrievedEventList, simplifyCalendarEvent, sync, syncEventUpdate

;// CONCATENATED MODULE: ./src/SimplifiedCalendarEvent.ts
// A quite simple version of GoogleAppsScript.Calendar.CalendarEvent
// This type is used to store the last retrieved events and
// detect the change from the events to the current events
var SimplifiedCalendarEvent = /** @class */ (function () {
    function SimplifiedCalendarEvent(_a) {
        var id = _a.id, title = _a.title, startTime = _a.startTime, endTime = _a.endTime, description = _a.description, location = _a.location, lastUpdated = _a.lastUpdated;
        this.id = id;
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.description = description;
        this.location = location;
        this.lastUpdated = lastUpdated;
    }
    SimplifiedCalendarEvent.prototype.getId = function () { return this.id; };
    SimplifiedCalendarEvent.prototype.getTitle = function () { return this.title; };
    SimplifiedCalendarEvent.prototype.getStartTime = function () { return this.startTime; };
    SimplifiedCalendarEvent.prototype.getEndTime = function () { return this.endTime; };
    SimplifiedCalendarEvent.prototype.getDescription = function () { return this.description; };
    SimplifiedCalendarEvent.prototype.getLocation = function () { return this.location; };
    SimplifiedCalendarEvent.prototype.getLastUpdated = function () { return this.lastUpdated; };
    return SimplifiedCalendarEvent;
}());

;
var simplifyCalendarEvent = function (event) {
    // Since getLastUpdated() returns a custom Date,
    // converts custom Dates into standard Dates
    return new SimplifiedCalendarEvent({
        id: event.getId(),
        title: event.getTitle(),
        startTime: new Date(event.getStartTime().getTime()),
        endTime: new Date(event.getEndTime().getTime()),
        description: event.getDescription(),
        location: event.getLocation(),
        lastUpdated: new Date(event.getLastUpdated().getTime())
    });
};
// This function only compares the properties of SimplifiedCalendarEvent
var compareCalendarEvent = function (simplifiedEvent, event) {
    return JSON.stringify(simplifiedEvent) === JSON.stringify(simplifyCalendarEvent(event));
};

;// CONCATENATED MODULE: ./src/CalendarEventFilter.ts
var TitleFilter = /** @class */ (function () {
    function TitleFilter(searchPattern) {
        this.searchPattern = searchPattern;
    }
    TitleFilter.prototype.filter = function (event) {
        var title = event.getTitle();
        if (typeof this.searchPattern === "string") {
            return title.includes(this.searchPattern);
        }
        else if (this.searchPattern instanceof RegExp) {
            return this.searchPattern.test(title);
        }
        else {
            var _exhaustiveCheck = this.searchPattern;
            return _exhaustiveCheck;
        }
    };
    return TitleFilter;
}());


;// CONCATENATED MODULE: ./src/Constant.ts
var abbreviatedPackageName = "gcal-forwarding";

;// CONCATENATED MODULE: ./src/Sync.ts


var getApplicationDirectory = function () {
    var foldername = abbreviatedPackageName;
    var iter = DriveApp.getFoldersByName(foldername);
    if (!iter.hasNext()) {
        return DriveApp.createFolder(foldername);
    }
    return iter.next();
};
var getLastRetrievedEventListFile = function (originalCalendarId, replicaCalendarId) {
    var packageDir = getApplicationDirectory();
    var filename = [abbreviatedPackageName, originalCalendarId, replicaCalendarId].join("-");
    var iter = packageDir.getFilesByName(filename);
    if (!iter.hasNext()) {
        return packageDir.createFile(filename, "[]", "application/json");
    }
    return iter.next();
};
var isNotNullish = function (value) {
    return value != null;
};
var getLastRetrievedEventList = function (originalCalendarId, replicaCalendarId) {
    var file = getLastRetrievedEventListFile(originalCalendarId, replicaCalendarId);
    var rawList = JSON.parse(file.getBlob().getDataAsString());
    if (!Array.isArray(rawList)) {
        throw new Error("${file.getName()}: invalid format");
    }
    var list = rawList.map(function (props) {
        // Check whether props has all arguments of SimplifiedCalendarEvent constructor
        // If not, raise an error
        if (isNotNullish(props) &&
            typeof props.id === "string" &&
            typeof props.title === "string" &&
            typeof props.startTime === "string" &&
            typeof props.endTime === "string" &&
            typeof props.description === "string" &&
            typeof props.location === "string" &&
            typeof props.lastUpdated === "string") {
            return new SimplifiedCalendarEvent({
                id: props.id,
                title: props.title,
                // startTime, endTime, and lastUpdated in props are strings
                // convert them into Date objects
                startTime: new Date(props.startTime),
                endTime: new Date(props.endTime),
                description: props.description,
                location: props.location,
                lastUpdated: new Date(props.lastUpdated)
            });
        }
        throw new Error("".concat(file.getName(), ": invalid format"));
    });
    return list;
};
var saveLastRetrievedEventList = function (originalCalendarId, replicaCalendarId, eventList) {
    var file = getLastRetrievedEventListFile(originalCalendarId, replicaCalendarId);
    var content = JSON.stringify(eventList.map(simplifyCalendarEvent));
    file.setContent(content);
};
var getEventUpdates = function (before, after) {
    var _a, _b;
    // Sort each event list by ID
    before = Array.from(before);
    before.sort(function (e1, e2) { return e1.getId().localeCompare(e2.getId()); });
    after = Array.from(after);
    after.sort(function (e1, e2) { return e1.getId().localeCompare(e2.getId()); });
    var beforeIndex = 0;
    var afterIndex = 0;
    var updates = [];
    var _loop_1 = function () {
        var beforeId = (_a = before[beforeIndex]) === null || _a === void 0 ? void 0 : _a.getId();
        var afterId = (_b = after[afterIndex]) === null || _b === void 0 ? void 0 : _b.getId();
        var cmp = (function () {
            if (beforeId === undefined) {
                return +1;
            }
            if (afterId === undefined) {
                return -1;
            }
            return beforeId.localeCompare(afterId);
        })();
        switch (cmp) {
            case -1: {
                updates.push({
                    type: "deleted",
                    event: before[beforeIndex]
                });
                beforeIndex += 1;
                break;
            }
            case +1: {
                updates.push({
                    type: "added",
                    event: after[afterIndex]
                });
                afterIndex += 1;
                break;
            }
            case 0: {
                if (!compareCalendarEvent(before[beforeIndex], after[afterIndex])) {
                    updates.push({
                        type: "modified",
                        event: after[afterIndex]
                    });
                }
                beforeIndex += 1;
                afterIndex += 1;
            }
        }
    };
    while (beforeIndex < before.length || afterIndex < after.length) {
        _loop_1();
    }
    return updates;
};
var copyEvent = function (event, calendar) {
    var replicaEvent = calendar.createEvent(event.getTitle(), event.getStartTime(), event.getEndTime(), {
        description: event.getDescription(),
        location: event.getLocation()
    });
    replicaEvent.setTag([abbreviatedPackageName, "original-event-id"].join("-"), event.getId());
    return replicaEvent;
};
var syncEventUpdate = function (eventUpdates, replicaCalendar, startTime, endTime) {
    var replicaEvents = replicaCalendar.getEvents(startTime, endTime);
    var _loop_2 = function (replicaEvent) {
        // The ID of an event that the replica event refers to
        var originalEventId = replicaEvent.getTag([abbreviatedPackageName, "original-event-id"].join("-"));
        var update = eventUpdates.find(function (u) {
            return startTime.getTime() <= u.event.getStartTime().getTime() &&
                u.event.getEndTime().getTime() <= endTime.getTime() &&
                u.event.getId() === originalEventId;
        });
        if (!update) {
            return "continue";
        }
        switch (update.type) {
            case "added": {
                // to be processed later
                break;
            }
            case "deleted": {
                replicaEvent.deleteEvent();
                break;
            }
            case "modified": {
                replicaEvent.setTitle(update.event.getTitle());
                replicaEvent.setTime(update.event.getStartTime(), update.event.getEndTime());
                replicaEvent.setDescription(update.event.getDescription());
                replicaEvent.setLocation(update.event.getLocation());
                break;
            }
        }
    };
    for (var _i = 0, replicaEvents_1 = replicaEvents; _i < replicaEvents_1.length; _i++) {
        var replicaEvent = replicaEvents_1[_i];
        _loop_2(replicaEvent);
    }
    for (var _a = 0, eventUpdates_1 = eventUpdates; _a < eventUpdates_1.length; _a++) {
        var update = eventUpdates_1[_a];
        if (update.type === "added") {
            copyEvent(update.event, replicaCalendar);
        }
    }
};
var sync = function (originalCalendar, replicaCalendar, startTime, endTime, options) {
    var before = getLastRetrievedEventList(originalCalendar.getId(), replicaCalendar.getId());
    var after = originalCalendar.getEvents(startTime, endTime);
    var eventUpdates = getEventUpdates(before, after);
    var filterFn = function (u) {
        if (!options.filter) {
            return true;
        }
        if (Array.isArray(options.filter)) {
            return options.filter.every(function (f) { return f.filter(u.event); });
        }
        else {
            return options.filter.filter(u.event);
        }
    };
    var filteredEventUpdates = eventUpdates.filter(filterFn);
    syncEventUpdate(filteredEventUpdates, replicaCalendar, startTime, endTime);
    saveLastRetrievedEventList(originalCalendar.getId(), replicaCalendar.getId(), after);
};

;// CONCATENATED MODULE: ./src/index.ts



__webpack_require__.g.TitleFilter = TitleFilter;
__webpack_require__.g.getApplicationDirectory = getApplicationDirectory;
__webpack_require__.g.getLastRetrievedEventListFile = getLastRetrievedEventListFile;
__webpack_require__.g.getLastRetrievedEventList = getLastRetrievedEventList;
__webpack_require__.g.saveLastRetrievedEventList = saveLastRetrievedEventList;
__webpack_require__.g.getEventUpdates = getEventUpdates;
__webpack_require__.g.copyEvent = copyEvent;
__webpack_require__.g.syncEventUpdate = syncEventUpdate;
__webpack_require__.g.sync = sync;


/******/ })()
;