import { SimplifiedCalendarEvent } from "./SimplifiedCalendarEvent";

export interface CalendarEventFilter{
  filter(event: SimplifiedCalendarEvent | GoogleAppsScript.Calendar.CalendarEvent): boolean;
}

export class TitleFilter implements CalendarEventFilter{
  searchPattern: string | RegExp;

  constructor(searchPattern: string | RegExp){
    this.searchPattern = searchPattern;
  }

  filter(event: SimplifiedCalendarEvent | GoogleAppsScript.Calendar.CalendarEvent): boolean{
    const title = event.getTitle();

    if(typeof this.searchPattern === "string"){
      return title.includes(this.searchPattern);
    }else if(this.searchPattern instanceof RegExp){
      return this.searchPattern.test(title);
    }else{
      const _exhaustiveCheck: never = this.searchPattern;
      return _exhaustiveCheck;
    }
  }
}
