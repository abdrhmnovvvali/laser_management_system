const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidPlannedTime(value: string): boolean {
  return TIME_PATTERN.test(value);
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatMinutesToTime(totalMinutes: number): string {
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

export interface ReservationDuration {
  minMinutes: number;
  maxMinutes: number;
}

/**
 * Nahiyələrin cəmi müddəti. Heç bir nahiyənin müddəti yoxdursa, standart slot
 * uzunluğu götürülür ki, rezervasiya 0 dəqiqəlik olmasın.
 */
export function resolveReservationDuration(
  total: { minDurationMinutes: number; maxDurationMinutes: number },
  fallbackMinutes: number,
): ReservationDuration {
  if (total.minDurationMinutes <= 0 && total.maxDurationMinutes <= 0) {
    return { minMinutes: fallbackMinutes, maxMinutes: fallbackMinutes };
  }
  const minMinutes = Math.max(1, total.minDurationMinutes);
  return {
    minMinutes,
    maxMinutes: Math.max(minMinutes, total.maxDurationMinutes),
  };
}

/** Cihazın həmin gün tutulmuş vaxtı (dəqiqə ilə, günün əvvəlindən). */
export interface BookedInterval {
  followUpId: string;
  start: number;
  /** Ən tez bitmə vaxtı — növbəti müştəri bu vaxtdan qəbul edilə bilər. */
  minEnd: number;
  /** Ən gec bitmə vaxtı — bu vaxta qədər əvvəlki seans uzana bilər. */
  maxEnd: number;
}

export function toBookedInterval(booking: {
  id: string;
  plannedTime: string;
  durationMinMinutes: number;
  durationMaxMinutes: number;
}): BookedInterval {
  const start = parseTimeToMinutes(booking.plannedTime);
  return {
    followUpId: booking.id,
    start,
    minEnd: start + booking.durationMinMinutes,
    maxEnd: start + Math.max(booking.durationMinMinutes, booking.durationMaxMinutes),
  };
}

/**
 * Yeni rezervasiya [start, start + minDuration) mövcud rezervasiyaların
 * [start, minEnd) aralığı ilə kəsişirsə, həmin rezervasiyanı qaytarır.
 * Minimum müddət əsas götürülür: 09:00-da 25–35 dəq-lik seans varsa,
 * növbəti müştəri 09:25-dən yazıla bilər.
 */
export function findOverlappingBooking(
  bookings: BookedInterval[],
  start: number,
  durationMinutes: number,
): BookedInterval | undefined {
  const end = start + durationMinutes;
  return bookings.find((booking) => start < booking.minEnd && booking.start < end);
}

export interface ComputedReservationSlot {
  time: string;
  available: boolean;
  /** Əvvəlki seans maksimum müddətə qədər uzanarsa, bu saata qədər davam edə bilər. */
  mayOverlapUntil: string | null;
}

/**
 * Standart slot şəbəkəsi + hər rezervasiyanın ən tez bitmə vaxtı (məs. 09:25)
 * namizəd saat kimi göstərilir və yeni seansın müddətinə görə yoxlanılır.
 */
export function buildReservationSlots(config: {
  slotStart: string;
  slotEnd: string;
  slotMinutes: number;
  bookings: BookedInterval[];
  durationMinutes: number;
  /** Əlavə namizəd saatlar (məs. redaktə olunan rezervasiyanın öz saatı). */
  extraTimes?: string[];
}): ComputedReservationSlot[] {
  const dayStart = parseTimeToMinutes(config.slotStart);
  const dayEnd = parseTimeToMinutes(config.slotEnd);

  const candidates = new Set(
    generateReservationSlotTimes(config).map(parseTimeToMinutes),
  );
  const extras = [
    ...config.bookings.map((booking) => booking.minEnd),
    ...(config.extraTimes ?? []).map(parseTimeToMinutes),
  ];
  for (const minute of extras) {
    if (minute >= dayStart && minute < dayEnd) {
      candidates.add(minute);
    }
  }

  return [...candidates]
    .sort((a, b) => a - b)
    .map((start) => {
      const fitsDay = start + config.durationMinutes <= dayEnd;
      const overlapping = findOverlappingBooking(
        config.bookings,
        start,
        config.durationMinutes,
      );
      const stretching = config.bookings
        .filter((booking) => booking.minEnd <= start && start < booking.maxEnd)
        .reduce<number | null>(
          (latest, booking) =>
            latest === null ? booking.maxEnd : Math.max(latest, booking.maxEnd),
          null,
        );

      return {
        time: formatMinutesToTime(start),
        available: fitsDay && !overlapping,
        mayOverlapUntil:
          stretching === null ? null : formatMinutesToTime(stretching),
      };
    });
}
