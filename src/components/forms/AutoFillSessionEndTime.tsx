'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

export function AutoFillSessionEndTime() {
  const { watch, setValue, getValues } = useFormContext();
  const startTime = watch('startTime');

  useEffect(() => {
    if (startTime) {
      // startTime string format: "YYYY-MM-DDTHH:mm" (from datetime-local input)

      // Parse the time. We treat it as 'local' time for the calculation purpose
      // (simply adding 1 hour to the clock time).
      const date = new Date(startTime);

      // Check if date is valid
      if (!isNaN(date.getTime())) {
        // Add 1 hour (3600 * 1000 milliseconds)
        const endTimeMillis = date.getTime() + 60 * 60 * 1000;
        const endDate = new Date(endTimeMillis);

        // Format back to YYYY-MM-DDTHH:mm
        const year = endDate.getFullYear();
        const month = String(endDate.getMonth() + 1).padStart(2, '0');
        const day = String(endDate.getDate()).padStart(2, '0');
        const hours = String(endDate.getHours()).padStart(2, '0');
        const minutes = String(endDate.getMinutes()).padStart(2, '0');

        const formattedEndTime = `${year}-${month}-${day}T${hours}:${minutes}`;

        // Only set endTime if it's currently empty, or we want to overwrite?
        // User said: "bitiş tarihini de doldurup verelim" (let's fill the end date too).
        // Usually safe to overwrite if the user is just setting start time,
        // but if they explicitly set end time, we shouldn't annoy them.
        // However, "creation esnasında" usually implies initial fill.
        // If I change start time, end time should probably shift too to keep the duration?
        // I'll overwrite it to ensure the "1 hour later" rule is helping them.

        setValue('endTime', formattedEndTime);
      }
    }
  }, [startTime, setValue]);

  return null;
}
