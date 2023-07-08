import path from 'path';
import {
  Cache,
  Configuration,
  ConsoleLogger,
  Database,
  DatabaseEventstore,
  dieOnError,
  Endpoint,
  Endpoints,
  EventSourcing,
  EventStore,
  Express,
  loadModulesFromDirectory,
  Logger,
  LoggerConfigSchema,
  MemoryCache,
  MemoryDb,
  Ports,
  Broker,
  validateSchema,
  EndpointValidation
} from 'pv3';
import packageJson from './package.json';

Configuration()
  .then( async configuration => {
    const { config: loggerConfig } = configuration.getModuleConfig( 'logger', LoggerConfigSchema );

    const onValidationError = ( err: any, endpoint: Endpoint ) => {
      log.error( 'Validation error procesing endpoint', endpoint.method, endpoint.route, err );
    };

    const logger = Logger( loggerConfig, ConsoleLogger());
    const endpoints = Endpoints( packageJson, configuration, EndpointValidation( validateSchema, onValidationError ), Express( configuration, logger ));
    const database = Database( MemoryDb());
    const eventstore = EventStore( DatabaseEventstore({ collection: 'eventstore' }, logger, database ));
    const eventsourcing = EventSourcing( logger, eventstore, endpoints );
    const cache = Cache( MemoryCache());


    const whiteList = configuration.getModules();
    const modules = await loadModulesFromDirectory( path.join( __dirname, 'modules' ), whiteList ? { whiteList } : {});

    const log = logger.createLoggerInstance( 'root' );

    const ports = {
      configuration,
      logger,
      cache,
      endpoints,
      database,
      eventsourcing,
      eventstore
    } as Ports;

    await Promise.all( Object.keys( modules )
      .map( module => {
        try{
          return modules[module]
            .create( ports );
        } catch( err ) {
          log.error( 'Error while creating module', module );
          dieOnError( log )( err );
          return null;
        }
      })
    ).then(() => configuration.applyArgs());

    database.onStarted( async () => {
      await endpoints.start();
      eventsourcing.logEventsourcingRoutes();

      //*******************************************
      // Local Broker for monolith services.
      //*******************************************
      const loggerInstance = logger.createLoggerInstance( 'root' );
      const broker = Broker({
        eventstores:[{
          type: 'databasePort',
          name: 'memory',
          collection: 'eventstore'
        }]
      }, logger, endpoints, database, { memory: database });

      broker.onStarted( async () => {
        loggerInstance.log( 'Broker initialized' );
        await broker.upsertService( '{{service}}', {
          url: `http://localhost:${expressConfig.port}`,
          eventstore: 'memory'
        });
        await broker.loadServicesSubscriptions();
      });
    });
  })
  .catch( console.error ); // eslint-disable-line no-console
