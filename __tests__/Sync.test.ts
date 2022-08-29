import { test, expect } from "@jest/globals";
import { SimplifiedCalendarEvent, simplifyCalendarEvent } from "../src/SimplifiedCalendarEvent";
import { getEventUpdates, syncEventUpdate, EventUpdate, copyEvent } from "../src/Sync";
import { CalendarEventMock, CalendarMock } from "./Mock";
import { abbreviatedPackageName } from "../src/Constant";

test('getEventUpdates', () => {
  const before = [
    new SimplifiedCalendarEvent({
      id: "e001",
      title: "Marathon",
      startTime: new Date(2022, 7, 3, 9, 0),
      endTime: new Date(2022, 7, 3, 13, 0),
      description: "42.195 km",
      location: "Tokyo",
      lastUpdated: new Date(2022, 6, 29, 21, 39),
    }),
    new SimplifiedCalendarEvent({
      id: "e005",
      title: "Meeting 1",
      startTime: new Date(2022, 7, 10, 9, 0),
      endTime: new Date(2022, 7, 10, 9, 30),
      description: "",
      location: "Office",
      lastUpdated: new Date(2022, 6, 27, 14, 27),
    }),    
    new SimplifiedCalendarEvent({
      id: "e010",
      title: "Meeting 2",
      startTime: new Date(2022, 7, 10, 13, 0),
      endTime: new Date(2022, 7, 10, 14, 0),
      description: "",
      location: "Office",
      lastUpdated: new Date(2022, 6, 28, 16, 49),
    }),
    new SimplifiedCalendarEvent({
      id: "e015",
      title: "Climbing",
      startTime: new Date(2022, 8, 13, 6, 0),
      endTime: new Date(2022, 8, 13, 20, 0),
      description: "",
      location: "Mt. Fuji",
      lastUpdated: new Date(2022, 6, 30, 20, 56),
    }),
  ];
  const after = [
    new CalendarEventMock({ // no change
      id: "e001",
      title: "Marathon",
      startTime: new Date(2022, 7, 3, 9, 0),
      endTime: new Date(2022, 7, 3, 13, 0),
      description: "42.195 km",
      location: "Tokyo",
      lastUpdated: new Date(2022, 6, 29, 21, 39),
    }),
    new CalendarEventMock({ // time changed
      id: "e005",
      title: "Meeting 1",
      startTime: new Date(2022, 7, 10, 9, 15),
      endTime: new Date(2022, 7, 10, 9, 45),
      description: "",
      location: "Office",
      lastUpdated: new Date(2022, 7, 5, 10, 13),
    }),
    new CalendarEventMock({ // title changed
      id: "e010",
      title: "Meeting 3",
      startTime: new Date(2022, 7, 10, 13, 0),
      endTime: new Date(2022, 7, 10, 14, 0),
      description: "",
      location: "Office",
      lastUpdated: new Date(2022, 7, 2, 10, 29),
    }),
    new CalendarEventMock({ // added
      id: "e020",
      title: "Meeting 2",
      startTime: new Date(2022, 7, 10, 12, 0),
      endTime: new Date(2022, 7, 10, 12, 10),
      description: "",
      location: "Office",
      lastUpdated: new Date(2022, 7, 2, 10, 27),
    }),
    // climbing event deleted
  ];
  const updates = getEventUpdates(before, after);

  const expectedUpdates = [
    {
      type: "modified",
      event: after[1], // e005
    },
    {
      type: "modified",
      event: after[2], // e010
    },
    {
      type: "deleted",
      event: before[3], // e015
    },
    {
      type: "added",
      event: after[3], // e020
    },
  ];

  expect(updates).toEqual(expectedUpdates);
});

test("syncEventUpdate", () => {
  const before = [
    new CalendarEventMock({
      id: "e001",
      title: "Marathon",
      startTime: new Date(2022, 7, 3, 9, 0),
      endTime: new Date(2022, 7, 3, 13, 0),
      description: "42.195 km",
      location: "Tokyo",
      lastUpdated: new Date(2022, 6, 29, 21, 39),
    }),
    new CalendarEventMock({
      id: "e005",
      title: "Meeting 1",
      startTime: new Date(2022, 7, 10, 9, 0),
      endTime: new Date(2022, 7, 10, 9, 30),
      description: "",
      location: "Office",
      lastUpdated: new Date(2022, 6, 27, 14, 27),
    }),    
    new CalendarEventMock({
      id: "e010",
      title: "Meeting 2",
      startTime: new Date(2022, 7, 10, 13, 0),
      endTime: new Date(2022, 7, 10, 14, 0),
      description: "",
      location: "Office",
      lastUpdated: new Date(2022, 6, 28, 16, 49),
    }),
    new CalendarEventMock({
      id: "e015",
      title: "Climbing",
      startTime: new Date(2022, 8, 13, 6, 0),
      endTime: new Date(2022, 8, 13, 20, 0),
      description: "",
      location: "Mt. Fuji",
      lastUpdated: new Date(2022, 6, 30, 20, 56),
    }),
  ];

  const dummyDate = new Date(2022, 7, 28, 0, 0, 0);
  const calendar = new CalendarMock(dummyDate);

  for(const event of before){
    copyEvent(event, calendar);
  }

  const after = [
    new CalendarEventMock({ // no change
      id: "e001",
      title: "Marathon",
      startTime: new Date(2022, 7, 3, 9, 0),
      endTime: new Date(2022, 7, 3, 13, 0),
      description: "42.195 km",
      location: "Tokyo",
      lastUpdated: new Date(2022, 6, 29, 21, 39),
    }),
    new CalendarEventMock({ // time changed
      id: "e005",
      title: "Meeting 1",
      startTime: new Date(2022, 7, 10, 9, 15),
      endTime: new Date(2022, 7, 10, 9, 45),
      description: "",
      location: "Office",
      lastUpdated: new Date(2022, 7, 5, 10, 13),
    }),
    new CalendarEventMock({ // title changed
      id: "e010",
      title: "Meeting 3",
      startTime: new Date(2022, 7, 10, 13, 0),
      endTime: new Date(2022, 7, 10, 14, 0),
      description: "",
      location: "Office",
      lastUpdated: new Date(2022, 7, 2, 10, 29),
    }),
    new CalendarEventMock({ // added
      id: "e020",
      title: "Meeting 2",
      startTime: new Date(2022, 7, 10, 12, 0),
      endTime: new Date(2022, 7, 10, 12, 10),
      description: "",
      location: "Office",
      lastUpdated: new Date(2022, 7, 2, 10, 27),
    }),
    // climbing event deleted
  ];

  const updates: EventUpdate[] = [
    {
      type: "modified",
      event: after[1], // e005
    },
    {
      type: "modified",
      event: after[2], // e010
    },
    {
      type: "deleted",
      event: simplifyCalendarEvent(before[3]), // e015
    },
    {
      type: "added",
      event: after[3], // e020
    },
  ];
  // The duration from startTime through endTime contains all events in before and after
  const startTime = new Date(2021, 0, 1, 0, 0, 0);
  const endTime = new Date(2023, 0, 1, 0, 0, 0);
  
  syncEventUpdate(updates, calendar, startTime, endTime);
  
  const result = calendar.getEvents(startTime, endTime);

  result.sort((e1: GoogleAppsScript.Calendar.CalendarEvent, e2: GoogleAppsScript.Calendar.CalendarEvent) =>
    e1.getId().localeCompare(e2.getId()));

  const originalEventIdKey = [abbreviatedPackageName, "original-event-id"].join("-");

  // the same as after except id, lastUpdated, and tags
  const expectedResult = [
    new CalendarEventMock({
      id: "e001",
      title: "Marathon",
      startTime: new Date(2022, 7, 3, 9, 0),
      endTime: new Date(2022, 7, 3, 13, 0),
      description: "42.195 km",
      location: "Tokyo",
      lastUpdated: dummyDate,
      tags: { [originalEventIdKey]: "e001" },
    }),
    new CalendarEventMock({
      id: "e002",
      title: "Meeting 1",
      startTime: new Date(2022, 7, 10, 9, 15),
      endTime: new Date(2022, 7, 10, 9, 45),
      description: "",
      location: "Office",
      lastUpdated: dummyDate,
      tags: { [originalEventIdKey]: "e005" },
    }),
    new CalendarEventMock({
      id: "e003",
      title: "Meeting 3",
      startTime: new Date(2022, 7, 10, 13, 0),
      endTime: new Date(2022, 7, 10, 14, 0),
      description: "",
      location: "Office",
      lastUpdated: dummyDate,
      tags: { [originalEventIdKey]: "e010" },
    }),
    new CalendarEventMock({
      id: "e005",
      title: "Meeting 2",
      startTime: new Date(2022, 7, 10, 12, 0),
      endTime: new Date(2022, 7, 10, 12, 10),
      description: "",
      location: "Office",
      lastUpdated: dummyDate,
      tags: { [originalEventIdKey]: "e020" },
    }),
  ];

  expect(result.length).toBe(expectedResult.length);

  const compare = <T>(
    lhs: GoogleAppsScript.Calendar.CalendarEvent, 
    rhs: GoogleAppsScript.Calendar.CalendarEvent,
    f: (event: GoogleAppsScript.Calendar.CalendarEvent) => T) =>
  {
    expect(f(lhs)).toEqual(f(rhs));
  };

  for(const index of result.keys()){
    const event = result[index];
    const expectedEvent = expectedResult[index];

    compare(event, expectedEvent, (e) => e.getId());
    compare(event, expectedEvent, (e) => e.getTitle());
    compare(event, expectedEvent, (e) => e.getStartTime());
    compare(event, expectedEvent, (e) => e.getEndTime());
    compare(event, expectedEvent, (e) => e.getLastUpdated());
    compare(event, expectedEvent, (e) => e.getTag(originalEventIdKey));    
  }
});
