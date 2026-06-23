export type BusEventType =
  | "SUDDEN_BRAKE"
  | "RAPID_ACCELERATION"
  | "IMPACT"
  | "OTHER";

export interface BusEvent {
  id: number;
  type: BusEventType;
  occurredAt: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
}

export interface BusEventResponse {
  busId: number;
  events: BusEvent[];
}
