import {
  SimplifiedCalendarEvent,
  simplifyCalendarEvent,
  compareCalendarEvent,
} from "./SimplifiedCalendarEvent";
import {
  CalendarEventFilter,
  TitleFilter,
} from "./CalendarEventFilter";
import {
  EventUpdate,
  SyncOptions,
  getApplicationDirectory,
  getLastRetrievedEventListFile,
  getLastRetrievedEventList,
  saveLastRetrievedEventList,
  getEventUpdates,
  copyEvent,
  syncEventUpdate,
  sync,
} from "./Sync";

// Functions in global are defined at the top level in dist/index.js
declare const global: { [key: string]: any };

global.TitleFilter = TitleFilter;

global.getApplicationDirectory = getApplicationDirectory;
global.getLastRetrievedEventListFile = getLastRetrievedEventListFile;
global.getLastRetrievedEventList = getLastRetrievedEventList;
global.saveLastRetrievedEventList = saveLastRetrievedEventList;
global.getEventUpdates = getEventUpdates;
global.copyEvent = copyEvent;
global.syncEventUpdate = syncEventUpdate;
global.sync = sync;

export {
  SimplifiedCalendarEvent,
  simplifyCalendarEvent,
  compareCalendarEvent,
  CalendarEventFilter,
  TitleFilter,
  EventUpdate,
  SyncOptions,
  getApplicationDirectory,
  getLastRetrievedEventListFile,
  getLastRetrievedEventList,
  saveLastRetrievedEventList,
  getEventUpdates,
  copyEvent,
  syncEventUpdate,
  sync,
};
