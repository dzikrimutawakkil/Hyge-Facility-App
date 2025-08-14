// src/features/facilities/types/index.ts
export type Facility = {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
};

export type FacilityDetail = { 
  id: number; 
  name: string; 
  description: string; 
  maxCapacity: number; 
  status: 'active' | 'inactive' | 'maintenance'; 
};

export type TimeSlot = { 
  hour: number; 
  startTime: string; 
  endTime: string; 
  available: boolean; 
  currentBookings: number; 
  maxCapacity: number; 
};

export type MonthlyAvailability = { 
  date: string; 
  isFullyBooked: boolean 
};