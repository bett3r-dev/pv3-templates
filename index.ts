import {
  Configuration,
  DotEnv
} from '@bett3r-dev/pv3';

import { setupPorts } from './setupPorts';
import { setupAdminServices } from './adminServices';
import { setupServices } from './setupServices';

Configuration( DotEnv( '', ( env ) => {
  const modulesWhitelist = env.LOGGER_MODULES_WHITELIST ? env.LOGGER_MODULES_WHITELIST.split( ',' ).map( m => m.trim()) : undefined;
  return {
    mongo:{
      connectionString: env.MONGO_CONNECTION_STRING,
    },
    logger:{
      modulesWhitelist,
    }
  };
}))
  .then( setupPorts )
  .then( setupAdminServices )
  .then( setupServices )
  .then( ports => {
    ports.database.onStarted(() => {
      ports.eventsourcing.logEventsourcingRoutes();
      ports.endpoints.start();
    });
  })
  .catch( console.error ); // eslint-disable-line no-console
