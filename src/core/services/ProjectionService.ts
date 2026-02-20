
import { SimulationInput, ProjectionResult } from '../contracts';

/**
 * Defines the contract for a service that performs financial projections.
 * This service is responsible for calculating the future financial state
 * based on a given set of inputs.
 */
export interface ProjectionService {
  /**
   * Runs a financial projection based on the user's input.
   * @param input The SimulationInput contract containing all necessary data for the projection.
   * @returns A ProjectionResult containing the outcome of the simulation.
   */
  project(input: SimulationInput): ProjectionResult;
}
