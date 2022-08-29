import { SimplifiedCalendarEvent, simplifyCalendarEvent, compareCalendarEvent } from "./SimplifiedCalendarEvent";
import { CalendarEventFilter } from "./CalendarEventFilter";
import { abbreviatedPackageName } from "./Constant";

// An update of an event in an original calendar
export type EventUpdate =
  {
    type: "added",
    event: GoogleAppsScript.Calendar.CalendarEvent,
  } |
  {
    type: "deleted",
    // use a saved information of the deleted event
    event: SimplifiedCalendarEvent,
  } |
  {
    type: "modified",
    event: GoogleAppsScript.Calendar.CalendarEvent,
  };

export const getLastRetrievedEventListFilename = (
  originalCalendarId: string,
  replicaCalendarId: string,
): string =>
{
  return [abbreviatedPackageName, originalCalendarId, replicaCalendarId].join("-");
}

export const getLastRetrievedEventList = (
  originalCalendarId: string,
  replicaCalendarId: string,
): SimplifiedCalendarEvent[] =>
{
  const filename = getLastRetrievedEventListFilename(originalCalendarId, replicaCalendarId);
  const iter = DriveApp.getFilesByName(filename);
  if(!iter.hasNext()){
    return [];
  }
  
  const file = iter.next();
  const rawList = JSON.parse(file.getBlob().getDataAsString());
  const list = rawList.map((props: unknown) =>
    new SimplifiedCalendarEvent(props as ConstructorParameters<typeof SimplifiedCalendarEvent>[0]));

  return list;
}

export const saveLastRetrievedEventList = (
  originalCalendarId: string,
  replicaCalendarId: string,
  eventList: GoogleAppsScript.Calendar.CalendarEvent[],
) =>
{
  const filename = getLastRetrievedEventListFilename(originalCalendarId, replicaCalendarId);
  const iter = DriveApp.getFilesByName(filename);
  const content = JSON.stringify(eventList.map(simplifyCalendarEvent));

  if(!iter.hasNext()){
    DriveApp.createFile(filename, content);
    return;
  }
  
  const file = iter.next();
  file.setContent(content);
}

export const getEventUpdates = (
  before: SimplifiedCalendarEvent[],
  after: GoogleAppsScript.Calendar.CalendarEvent[],
): EventUpdate[] =>
{
  // Sort each event list by ID
  before = Array.from(before);
  before.sort((e1, e2) => e1.getId().localeCompare(e2.getId()));
  after = Array.from(after);
  after.sort((e1, e2) => e1.getId().localeCompare(e2.getId()));

  let beforeIndex = 0;
  let afterIndex = 0;
  const updates: EventUpdate[] = [];

  while(beforeIndex < before.length || afterIndex < after.length){
    const beforeId = before[beforeIndex]?.getId();
    const afterId = after[afterIndex]?.getId();
    
    const cmp = (() => {
      if(beforeId === undefined){
        return +1;
      }

      if(afterId === undefined){
        return -1;
      }

      return beforeId.localeCompare(afterId);
    })();

    switch(cmp){
      case -1: {
        updates.push({
          type: "deleted",
          event: before[beforeIndex],
        });
        beforeIndex += 1;
        break;
      }
      case +1: {
        updates.push({
          type: "added",
          event: after[afterIndex],
        });
        afterIndex += 1;
        break;
      }
      case 0: {
        if(!compareCalendarEvent(before[beforeIndex], after[afterIndex])){
          updates.push({
            type: "modified",
            event: after[afterIndex],
          });
        }
        beforeIndex += 1;
        afterIndex += 1;
      }
    }
  }

  return updates;
}

export const copyEvent = (
  event: GoogleAppsScript.Calendar.CalendarEvent,
  calendar: GoogleAppsScript.Calendar.Calendar,
): GoogleAppsScript.Calendar.CalendarEvent =>
{
  const replicaEvent =
    calendar.createEvent(
      event.getTitle(),
      event.getStartTime(),
      event.getEndTime(),
      {
        description: event.getDescription(),
        location: event.getLocation(),
        // not inherit guests from event
      }
    );
  replicaEvent.setTag([abbreviatedPackageName, "original-event-id"].join("-"), event.getId());
  return replicaEvent;
}

export const syncEventUpdate = (
  eventUpdates: EventUpdate[],
  replicaCalendar: GoogleAppsScript.Calendar.Calendar,
  startTime: Date,
  endTime: Date,
) =>
{
  const replicaEvents = replicaCalendar.getEvents(startTime, endTime);

  for(const replicaEvent of replicaEvents){
    // The ID of an event that the replica event refers to
    const originalEventId = replicaEvent.getTag([abbreviatedPackageName, "original-event-id"].join("-"));

    const update = eventUpdates.find((u) =>
      startTime.getTime() <= u.event.getStartTime().getTime() &&
      u.event.getEndTime().getTime() <= endTime.getTime() &&
      u.event.getId() === originalEventId);

    if(!update){
      continue;
    }

    switch(update.type){
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
  }

  for(const update of eventUpdates){
    if(update.type === "added"){
      copyEvent(update.event, replicaCalendar);
    }
  }
}

export type SyncOptions = {
  startTime: Date,
  endTime: Date,
  filter?: CalendarEventFilter | CalendarEventFilter[],
};

export const sync = (
  originalCalendar: GoogleAppsScript.Calendar.Calendar,
  replicaCalendar: GoogleAppsScript.Calendar.Calendar,
  options: SyncOptions
) =>
{
  const before = getLastRetrievedEventList(
    originalCalendar.getId(),
    replicaCalendar.getId(),
  );
  const after =
    originalCalendar.getEvents(options.startTime, options.endTime);
  const eventUpdates = getEventUpdates(before, after);
  const filterFn = (u: EventUpdate) => {
    if(!options.filter){
      return true;
    }

    if(Array.isArray(options.filter)){
      return options.filter.every((f) => f.filter(u.event));
    }else{
      return options.filter.filter(u.event);
    }
  };
  const filteredEventUpdates = eventUpdates.filter(filterFn);

  syncEventUpdate(
    filteredEventUpdates,
    replicaCalendar,
    options.startTime,
    options.endTime,
  );

  saveLastRetrievedEventList(
    originalCalendar.getId(),
    replicaCalendar.getId(),
    after,
  );
}
