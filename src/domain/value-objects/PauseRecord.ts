export interface PauseRecordData {
  startDate: Date;
  endDate?: Date;
  reason: string;
  createdAt: Date;
}

export class PauseRecord {
  private constructor(
    readonly startDate: Date,
    readonly endDate: Date | null,
    readonly reason: string,
    readonly createdAt: Date,
  ) {}

  static create(reason: string, endDate?: Date): PauseRecord {
    return new PauseRecord(
      new Date(),
      endDate ?? null,
      reason,
      new Date(),
    );
  }

  isActive(): boolean {
    if (!this.endDate) return true;
    return new Date() < this.endDate;
  }

  toDTO(): PauseRecordData {
    return {
      startDate: this.startDate,
      endDate: this.endDate ?? undefined,
      reason: this.reason,
      createdAt: this.createdAt,
    };
  }

  static fromDTO(data: PauseRecordData): PauseRecord {
    return new PauseRecord(
      data.startDate,
      data.endDate ?? null,
      data.reason,
      data.createdAt,
    );
  }
}
