import { z } from 'zod';

export type Booking = {
  id: number;
  facilityId: number;
  userId: number;
  bookingDate: string;
  startHour: number;
  endHour: number;
  notes: string | null;
  status: 'booked' | 'cancelled' | 'completed';
  createdAt: string;
};

export type BookingsPage = {
  bookings: Booking[];
  page: number;
  totalPages: number;
};

export type TimeSlot = { hour: number; available: boolean; startTime: string; endTime: string };

export const bookingSchema = z.object({
  facilityId: z.number().positive("Facility ID is required."),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  startHour: z.number().min(0, "Please select a time slot"),
  notes: z.string().optional(),
});
export type BookingFormValues = z.infer<typeof bookingSchema>;