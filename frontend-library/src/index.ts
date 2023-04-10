import { BackendConfig, requests } from './base';
  import * as shoppingCart from './services/shoppingCart';


  export const create = (params: BackendConfig) => {
    const req = requests(params);

    return {
      commands: {
          ...shoppingCart.commands(req, params),

        },queries: {
          ...shoppingCart.queries(req, params),

        },subscriptions: {
          ...shoppingCart.subscriptions(req, params),

        }
    }
  };