export type BusStatus = "ONLINE" | "OFFLINE";

export interface BusSummary {
  id: number;
  busNumber: string;
  routeId: number;
  routeName: string;
  currentSpeed: number;
  status: BusStatus;
  lastCommunicatedAt: string;
}

export interface BusPage {
  content: BusSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface BusListParams {
  status?: BusStatus;
  routeId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface BusLocation {
  latitude: number;
  longitude: number;
  recordedAt: string;
}

export interface BusDetail {
  id: number;
  busNumber: string;
  route: {
    id: number;
    name: string;
  };
  currentSpeed: number;
  status: BusStatus;
  lastCommunicatedAt: string;
  currentLocation: BusLocation | null;
}
