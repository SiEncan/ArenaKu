import { Booking } from "./booking";
import { Venue } from "./venue";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  bookings: Booking[];
  venues: Venue[];
};