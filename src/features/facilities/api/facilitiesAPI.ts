// src/features/facilities/api/facilitiesAPI.ts
import api from '../../../libs/axios';
import { Facility, FacilityDetail, MonthlyAvailability, TimeSlot } from '../types';

export const fetchFacilities = async (search: string): Promise<Facility[]> => {
  const response = await api.get(`/facilities?search=${search}`);
  return response.data || [];
};

export const fetchFacilityDetails = async (id: string) => 
  api.get<FacilityDetail>(`/facilities/${id}`).then(res => res.data);

export const fetchDailyAvailability = async (id: string, date: string): Promise<TimeSlot[]> => { 
  const response = await api.get(`/facilities/${id}/availability/daily?date=${date}`); 
  return response.data.timeSlots || []; 
};

export const fetchMonthlyAvailability = async (id: string, year: number, month: number) => 
  api.get<MonthlyAvailability[]>(`/facilities/${id}/availability/monthly?year=${year}&month=${month}`)
.then(res => res.data);