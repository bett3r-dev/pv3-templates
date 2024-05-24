import {
  InfrastructurePort,
} from '@bett3r-dev/pv3';
import {
  AdminServicesConfigSchema,
  InfrastructurePortType,
  OutboxManagerType,
  Ports
} from '@bett3r-dev/pv3-types';
import {
  DockerInfrastructure,
} from '@bett3r-dev/pv3-adapter-infrastructure-docker';
import {
  OutboxManager,
} from '@bett3r-dev/pv3-library-outbox-manager';
import {
  ClusterStructure,
} from '@bett3r-dev/pv3-library-cluster-structure';

export const setupAdminServices = async ( ports: Ports ): Promise<Ports> => {
  let clusterInfrastructure: InfrastructurePortType;
  let outbox: OutboxManagerType;
  const args = await ports.configuration.getArgs();
  if ( !args.admin ) return ports;

  const { config } = ports.configuration.getModuleConfig( 'adminServices', AdminServicesConfigSchema.optional());

  const clusterStructure = ClusterStructure( ports, config.structure! );

  // InfraStructure Manager
  if ( args.infrastructure ) {
    clusterInfrastructure = InfrastructurePort( ports, config.infrastructure!, clusterStructure, DockerInfrastructure( ports ));
  }

  // Outbox Manager
  if ( args.outbox ) {
    outbox = OutboxManager( ports, clusterStructure );
  }

  // Request Authorization Service


  ports.endpoints.onStarted( async () => {
    clusterInfrastructure && await clusterInfrastructure.start();
    outbox && await outbox.start();
  });

  return ports;
};
