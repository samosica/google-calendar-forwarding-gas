import { test, expect } from "@jest/globals";
import { SimplifiedCalendarEvent, simplifyCalendarEvent } from "../src/SimplifiedCalendarEvent";
import { CalendarEventMock } from "./Mock";

test('simplify calendar event', () => {
  const props = {
    id: "e1",
    title: "Marathon",
    startTime: new Date(2022, 7, 3, 9, 0),
    endTime: new Date(2022, 7, 3, 13, 0),
    description: "42.195 km",
    location: "Tokyo",
    lastUpdated: new Date(2022, 6, 29, 21, 39),
    originalCalendarId: "c1",
  };
  const event = CalendarEventMock(props);
  const simplifiedEvent = simplifyCalendarEvent(event);

  expect(simplifiedEvent).toEqual(new SimplifiedCalendarEvent(props));
});
