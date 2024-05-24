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
  validateSchema
} from '@bett3r-dev/pv3';
import {
  ConfigurationPort,
  LoggerConfigSchema,
  Ports,
} from '@bett3r-dev/pv3-types';
import {
  Express,
} from '@bett3r-dev/pv3-adapter-endpoints-express';
import {
  MongoDb,
  MongoDbConfigSchema,
} from '@bett3r-dev/pv3-adapter-database-mongo';


import packageJson from './package.json';

export const setupPorts = async ( configuration: ConfigurationPort ): Promise<Ports> => {
  const { config: loggerConfig } = configuration.getModuleConfig(
    'logger',
    LoggerConfigSchema
  );
  const { config: mongoConfig } = configuration.getModuleConfig(
    'mongo',
    MongoDbConfigSchema
  );

  const logger = Logger( loggerConfig, ConsoleLogger());
  const endpoints = Endpoints(
    { packageJson, configuration },
    EndpointValidation( validateSchema ),
    Express( configuration, logger )
  );
  const database = Database( MongoDb( mongoConfig, logger ));
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
  } as Ports;

  return ports;
};
