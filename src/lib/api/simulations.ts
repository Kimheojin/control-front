import { apiFetch } from "@/lib/api/client";
import type {
  SimulationCurrentResponse,
  SimulationStartResponse,
} from "@/types/simulation";

export async function startSimulation(): Promise<SimulationStartResponse> {
  return apiFetch<SimulationStartResponse>("/v2/simulations/start", {
    method: "POST",
  });
}

export async function getCurrentSimulation(
  signal?: AbortSignal,
): Promise<SimulationCurrentResponse> {
  return apiFetch<SimulationCurrentResponse>("/v2/simulations/current", {
    signal,
  });
}
