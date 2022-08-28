import { jest } from "@jest/globals";

export const CalendarEventMock = jest.fn<(args: {
  id: string,
  title: string,
  startTime: GoogleAppsScript.Base.Date,
  endTime: GoogleAppsScript.Base.Date,
  description: string,
  location: string,
  lastUpdated: GoogleAppsScript.Base.Date,
  tags?: { [key: string]: any },
  deleteEvent?: () => void,
}) => GoogleAppsScript.Calendar.CalendarEvent>();

CalendarEventMock.mockImplementation(({
  id,
  title,
  startTime,
  endTime,
  description,
  location,
  lastUpdated,
  tags,
  deleteEvent,
}) =>
{
  const dummy = {
    id,
    title,
    startTime,
    endTime,
    description,
    location,
    lastUpdated,
    tags: tags ?? Object.create(null),
    deleteEvent(){
      if(deleteEvent){
        deleteEvent();
      }
    },
    getDescription(){
      return this.description;
    },
    getEndTime(){
      return this.endTime;
    },
    getId(){
      return this.id;
    },
    getLastUpdated(){
      return this.lastUpdated;
    },
    getLocation(){
      return this.location;
    },
    getStartTime(){
      return this.startTime;
    },
    getTag(key: string){
      return this.tags[key];
    },
    getTitle(){
      return this.title;
    },
    setDescription(description: string){
      this.description = description;
      return this;
    },
    setLocation(location: string){
      this.location = location;
      return this;
    },
    setTag(key: string, value: string){
      this.tags[key] = value;
      return this;
    },
    setTime(startTime: GoogleAppsScript.Base.Date, endTime: GoogleAppsScript.Base.Date){
      this.startTime = startTime;
      this.endTime = endTime;
      return this;
    },
    setTitle(title: string){
      this.title = title;
      return this;
    },
  };

  // @ts-ignore
  return dummy as GoogleAppsScript.Calendar.CalendarEvent;
});

export const CalendarMock = jest.fn<(
  now: GoogleAppsScript.Base.Date,
) => GoogleAppsScript.Calendar.Calendar>();

CalendarMock.mockImplementation((
  now: GoogleAppsScript.Base.Date,
) =>
{
  const dummy = {
    events: new Array<GoogleAppsScript.Calendar.CalendarEvent>(),
    eventCounter: 0,
    getEvents(
      startTime: GoogleAppsScript.Base.Date,
      endTime: GoogleAppsScript.Base.Date)
    {
      return this.events.filter((e: GoogleAppsScript.Calendar.CalendarEvent) =>
        startTime.getTime() <= e.getStartTime().getTime() &&
        e.getEndTime().getTime() < endTime.getTime());
    },
    createEvent(
      title: string,
      startTime: GoogleAppsScript.Base.Date,
      endTime: GoogleAppsScript.Base.Date,
      options: { [key: string]: any },
    )
    {
      // 1-indexed
      const id = "e" + (this.eventCounter + 1).toString().padStart(3, "0");
      const description = options.description ?? "";
      const location = options.location ?? "";

      const newEvent = new CalendarEventMock({
        id, title, startTime, endTime, description, location,
        lastUpdated: now,
        // use an arrow function instead of function(){...}
        // so that *this* in the body of deleteEvent refers to dummy
        deleteEvent: () => {
          const index = this.events.findIndex(
            (e: GoogleAppsScript.Calendar.CalendarEvent) => e.getId() === id);
          this.events.splice(index, 1);
            
        },
      });

      this.events.push(newEvent);
      this.eventCounter += 1;

      return newEvent;
    },
  };

  // @ts-ignore
  return dummy as GoogleAppsScript.Calendar.Calendar;
});
