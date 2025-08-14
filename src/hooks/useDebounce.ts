// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

// This hook takes a value and a delay time
export function useDebounce<T>(value: T, delay: number): T {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay has passed
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Rerun the effect if the value or delay changes

  return debouncedValue;
}