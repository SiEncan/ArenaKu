export type Field = {
  id?: string;
  name: string;
  description: string;
  type: string;
  surface: string;
  imageUrls: string[];
  timeSlots: TimeSlot[];
  specialTimeSlots?: { date: string; startTime: string; endTime: string; price: number }[];
};

export type TimeSlot = {
  id?: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  price: number;
  status?: string;
}

export type FieldSummary = {
  type: string;
  minPrice: number;
};

enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}