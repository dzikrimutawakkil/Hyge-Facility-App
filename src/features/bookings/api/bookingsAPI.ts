import api from '../../../libs/axios';
import { Booking, BookingsPage, BookingFormValues, TimeSlot } from '../types';

export const fetchMyBookings = async ({ pageParam = 1, queryKey }: any): Promise<BookingsPage> => {
  const [_key, filters] = queryKey;
  const { status, sortOrder } = filters;

  const params: any = {
    page: pageParam,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: sortOrder,
  };

  if (status) {
    params.status = status;
  }
  
  const response = await api.get('/facilities/bookings/my', { params });
  return response.data;
};

export const cancelBooking = async (bookingId: number) => {
  return api.delete(`/facilities/bookings/${bookingId}`);
};

export const fetchAvailability = async (id: number | undefined, date: string): Promise<TimeSlot[]> => {
  if (!id) return []; // Don't fetch if ID isn't available
  const response = await api.get(`/facilities/${id}/availability/daily?date=${date}`);
  return response.data.timeSlots || [];
};

export const createBooking = async (data: BookingFormValues) => api.post('/facilities/bookings', data);