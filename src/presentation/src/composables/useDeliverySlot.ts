import { ref, computed } from 'vue';

export interface DeliveryAddress {
  id: string;
  label: string;
  zone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export function useDeliverySlot() {
  const selectedDate = ref<Date>(new Date());
  const currentTime = ref<Date>(new Date());
  const cutoffHour = ref<number>(10);

  const slotType = computed<'SAME_DAY' | 'NEXT_DAY'>(() => {
    const cutoff = new Date(currentTime.value);
    cutoff.setHours(cutoffHour.value, 0, 0, 0);

    const isToday = selectedDate.value.toDateString() === currentTime.value.toDateString();
    const isBeforeCutoff = currentTime.value < cutoff;

    return isToday && isBeforeCutoff ? 'SAME_DAY' : 'NEXT_DAY';
  });

  const cutoffTime = computed<Date>(() => {
    const cutoff = new Date(selectedDate.value);
    cutoff.setHours(cutoffHour.value, 0, 0, 0);
    return cutoff;
  });

  const isCutoffPassed = computed<boolean>(() => {
    return currentTime.value > cutoffTime.value;
  });

  const deliveryDisplay = computed<string>(() => {
    const dateStr = selectedDate.value.toLocaleDateString('en-KE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return `${slotType.value === 'SAME_DAY' ? 'Same Day' : 'Next Day'} - ${dateStr}`;
  });

  const setDate = (date: Date) => {
    selectedDate.value = date;
  };

  const updateCurrentTime = () => {
    currentTime.value = new Date();
  };

  return {
    selectedDate,
    slotType,
    cutoffTime,
    isCutoffPassed,
    deliveryDisplay,
    setDate,
    updateCurrentTime,
  };
}
