import {
  Cache,
  ConsoleLogger,
  Database,
  DatabaseEventstore,
  EndpointValidation,
  Endpoints,
  EventSourcing,
  EventStore,
  Logger,
  MemoryCache,
  validateSchema,
  MemoryDb
} from '@bett3r-dev/pv3';
import {
  ConfigurationPort,
  LoggerConfigSchema,
} from '@bett3r-dev/pv3-types';
import {
  Express,
} from '@bett3r-dev/pv3-adapter-endpoints-express';

import packageJson from './package.json';

export const setupPorts = async ( configuration: ConfigurationPort ) => {
  const { config: loggerConfig } = configuration.getModuleConfig(
    'logger',
    LoggerConfigSchema
  );

  const logger = Logger( loggerConfig, ConsoleLogger());
  const endpoints = Endpoints(
    { packageJson, configuration },
    EndpointValidation( validateSchema ),
    Express( configuration, logger )
  );
  const database = Database(MemoryDb());
  const eventstore = EventStore(
    DatabaseEventstore({ collection: 'eventstore' }, logger, database )
  );
  const eventsourcing = EventSourcing( logger, eventstore, endpoints );
  const cache = Cache( MemoryCache());

  const ports = {
    configuration,
    logger,
    cache,
    endpoints,
    database,
    eventsourcing,
    eventstore,
  };

  return ports;
};
