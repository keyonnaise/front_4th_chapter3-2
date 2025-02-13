export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RepeatLimitType = 'count' | 'date';

export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  limitType: RepeatLimitType;
  endCount?: number;
  endDate?: string;
  exceptions: string[];
}

export interface EventForm {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number; // 분 단위로 저장
}

export interface Event extends EventForm {
  id: string;
}
