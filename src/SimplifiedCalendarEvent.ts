// A quite simple version of GoogleAppsScript.Calendar.CalendarEvent
// This type is used to store the last retrieved events and
// detect the change from the events to the current events
export class SimplifiedCalendarEvent{
  private id: string;
  private title: string;
  private startTime: Date;
  private endTime: Date;
  private description: string;
  private location: string;
  private lastUpdated: Date;

  constructor({
    id,
    title,
    startTime,
    endTime,
    description,
    location,
    lastUpdated,
  }: {
    id: string,
    title: string,
    startTime: Date,
    endTime: Date,
    description: string,
    location: string,
    lastUpdated: Date,
  })
  {
    this.id = id;
    this.title = title;
    this.startTime = startTime;
    this.endTime = endTime;
    this.description = description;
    this.location = location;
    this.lastUpdated = lastUpdated;
  }
  getId(): string { return this.id; }
  getTitle(): string { return this.title; }
  getStartTime(): Date { return this.startTime; }
  getEndTime(): Date { return this.endTime; }
  getDescription(): string { return this.description; }
  getLocation(): string { return this.location; }
  getLastUpdated(): Date { return this.lastUpdated; }
};

export const simplifyCalendarEvent = (
  event: GoogleAppsScript.Calendar.CalendarEvent
): SimplifiedCalendarEvent =>
{
  // Since getLastUpdated() returns a custom Date,
  // converts custom Dates into standard Dates
  return new SimplifiedCalendarEvent({
    id: event.getId(),
    title: event.getTitle(),
    startTime: new Date(event.getStartTime().getTime()),
    endTime: new Date(event.getEndTime().getTime()),
    description: event.getDescription(),
    location: event.getLocation(),
    lastUpdated: new Date(event.getLastUpdated().getTime()),
  });
}

// This function only compares the properties of SimplifiedCalendarEvent
export const compareCalendarEvent = (
  simplifiedEvent: SimplifiedCalendarEvent,
  event: GoogleAppsScript.Calendar.CalendarEvent,
) =>
{
  return JSON.stringify(simplifiedEvent) === JSON.stringify(simplifyCalendarEvent(event));
}
