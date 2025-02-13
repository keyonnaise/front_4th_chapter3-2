import { Event, RepeatType } from '../types';
import { addMonthsWithOriginalDate, formatDate, getWeekDates, isDateInRange } from './dateUtils';

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

function getNextRepeatEventDate(
  currentDate: Date,
  originalDate: Date,
  repeatType: RepeatType,
  interval: number
) {
  const cloned = new Date(currentDate);

  switch (repeatType) {
    case 'daily': {
      return new Date(cloned.setDate(cloned.getDate() + interval));
    }

    case 'weekly': {
      return new Date(cloned.setDate(cloned.getDate() + 7 * interval));
    }

    case 'monthly': {
      return addMonthsWithOriginalDate(cloned, originalDate, interval);
    }

    case 'yearly': {
      return addMonthsWithOriginalDate(cloned, originalDate, interval);
    }

    default: {
      throw new Error(`알 수 없는 repeatType 입니다: ${repeatType}`);
    }
  }
}

function filterEventsByDateRange(events: Event[], startDate: Date, endDate: Date): Event[] {
  const repeatEvents: Event[] = [];
  events.forEach((event) => {
    const recurringEvents = createRepeatEvents(event, startDate, endDate);
    repeatEvents.push(...recurringEvents);
  });
  return repeatEvents;
}

function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 9);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 9);
  return filterEventsByDateRange(events, monthStart, monthEnd);
}

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  switch (view) {
    case 'week': {
      return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
    }

    case 'month': {
      return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
    }

    default: {
      throw new Error(`알 수 없는 view 입니다: ${view}`);
    }
  }
}

export function createRepeatEvents(event: Event, startDate: Date, endDate: Date) {
  const repeatEvents: Event[] = [];

  // 반복되지 않는 이벤트 처리
  if (event.repeat.type === 'none') {
    const eventDate = new Date(event.date);
    if (isDateInRange(eventDate, startDate, endDate)) {
      repeatEvents.push(event);
    }
    return repeatEvents;
  }

  // 반복되는 이벤트 처리
  const repeatEndDate = event.repeat.endDate ? new Date(event.repeat.endDate) : endDate;
  const originalDate = new Date(event.date);
  let currentDate = new Date(event.date);
  let iteration = 1;

  while (currentDate <= endDate && currentDate <= repeatEndDate) {
    if (currentDate >= startDate) {
      const stringified = formatDate(currentDate);
      const foundIndex = event.repeat.exceptions.findIndex(
        (exception) => exception === stringified
      );
      const disabled =
        foundIndex > -1 || (event.repeat.endCount && iteration > event.repeat.endCount + 1);

      if (!disabled) {
        const repeatEvent: Event = {
          ...event,
          title: iteration === 1 ? event.title : `${event.title}(반복)`,
          date: stringified,
        };
        repeatEvents.push(repeatEvent);
      }
    }

    // 다음 이벤트 날짜 계산
    currentDate = getNextRepeatEventDate(
      currentDate,
      originalDate,
      event.repeat.type,
      event.repeat.interval
    );
    iteration++;
  }

  return repeatEvents;
}
