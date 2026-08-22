const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidPlannedTime(value: string): boolean {
  return TIME_PATTERN.test(value);
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function generateReservationSlotTimes(config: {
  slotStart: string;
  slotEnd: string;
  slotMinutes: number;
}): string[] {
  const start = parseTimeToMinutes(config.slotStart);
  const end = parseTimeToMinutes(config.slotEnd);
  const step = config.slotMinutes;

  if (step <= 0 || start >= end) {
    return [];
  }

  const slots: string[] = [];
  for (let minute = start; minute < end; minute += step) {
    slots.push(formatMinutesToTime(minute));
  }
  return slots;
}
