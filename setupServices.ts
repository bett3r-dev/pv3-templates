import path from 'path';
import {
  dieOnError,
  loadModulesFromDirectory
} from '@bett3r-dev/pv3';
import {
  Ports,
} from '@bett3r-dev/pv3-types';

export const setupServices = async ( ports: Ports ): Promise<Ports> => {
  const whiteList = ports.configuration.getModules();
  const { modules, modulesList } = await loadModulesFromDirectory(
    path.join( __dirname, 'modules' ),
    whiteList ? { whiteList } : {}
  );

  const log = ports.logger.createLoggerInstance( 'root' );

  ports.endpoints.setServiceSupportedModules( modulesList );

  await Promise.all(
    Object.keys( modules ).map(( module ) => {
      try {
        return modules[module].create( ports );
      } catch ( err ) {
        log.error( 'Error while creating module', module );
        dieOnError( log )( err );
        return null;
      }
    })
  ).then(() => ports.configuration.applyArgs());

  return ports;
};
