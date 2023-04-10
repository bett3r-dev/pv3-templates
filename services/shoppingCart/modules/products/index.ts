import { Ports } from 'pv3';
import { libs } from '@libraries';
import { ProductsAggregate } from './products.aggregate';

export const create = ( ports: Ports ) => {
  libs;
  ports.eventsourcing.routeCommandHandler( ProductsAggregate());
};