
  import { BackendConfig, CommandExecutionResponse, CommandParams, parseQueryParams, QueryParams, ReadModelChange, Requests } from "../base";

//*******************************************
// Schemas
//*******************************************

export type CreateProduct = {
  name: string;
};
export type ProductCreated = {
  name: string;
};
export type ProductsState = {
  name: string;
};


//*******************************************
// Operations
//*******************************************

export const commands = (requests: Requests, {token}: BackendConfig) => ({
  
  CreateProduct: ({id, query, body}: CommandParams<CreateProduct>): Promise<CommandExecutionResponse<ProductsState, ProductCreated>> => {
    return requests.post(`/products/${id}/create-product${parseQueryParams(query)}`, body)
  }
});

export const queries = (requests: Requests, {token}: BackendConfig) => ({
  
});

export const subscriptions = (requests: Requests, {token}: BackendConfig) => ({
  
});


