import { User } from "./user"

export type Booking = {
  id: string
  user?: User
  userId?: string
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  field: {
    id: string
    name: string
    venue: {
      id: string
      name: string
    },
  },
  timeSlot?: {
    id: string
    startTime: string
    endTime: string
  } | null
  date: string
  status: string
  totalPrice: number
  orderId: string
  paidAt: string
  snapToken: string
  createdAt: string
  updatedAt: string
}