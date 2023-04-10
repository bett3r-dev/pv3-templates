import { ProductsAggregateEvents } from '@domainEvents';
import { AggregateBuilder } from 'pv3';
import { ProductsAggregateSchema } from './types';

export const ProductsAggregate = () => {
  return AggregateBuilder( 'Products', ProductsAggregateSchema, ProductsAggregateEvents )
    .initialValue(() => ({}))
    .withEventReducers({
      ProductCreated: ( state, data ) => ({ ...state, ...data }),
    })
    .withCommands(({ commandBuilder }) => ({
      CreateProduct: commandBuilder()
        .withSchema( ProductsAggregateSchema )
        .produces(['ProductCreated'])
    }));
};