// Delivery slot value object
export class DeliverySlot {
  private constructor(
    readonly date: Date,
    readonly type: "SAME_DAY" | "NEXT_DAY",
  ) {}

  static create(
    preferredDate: Date,
    currentTime: Date = new Date(),
  ): DeliverySlot {
    const cutoffTime = new Date(currentTime);
    cutoffTime.setHours(10, 0, 0, 0);

    const isSameDayAvailable =
      preferredDate.toDateString() === currentTime.toDateString() &&
      currentTime < cutoffTime;

    return new DeliverySlot(
      preferredDate,
      isSameDayAvailable ? "SAME_DAY" : "NEXT_DAY",
    );
  }

  toDisplay(): string {
    const dateStr = this.date.toLocaleDateString("en-KE", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return `${this.type === "SAME_DAY" ? "Same Day" : "Next Day"} - ${dateStr}`;
  }
}
