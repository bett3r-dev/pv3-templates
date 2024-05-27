// This file is here to extend the base ports type with the specific ports for this service
// Add the types that matches the ports you need for this service

import { setupPorts } from "../setupPorts";

/**
 * Ports exposed to all modules in the service
*/
export type Ports = Awaited<ReturnType<typeof setupPorts>>;
