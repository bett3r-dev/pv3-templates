/** OneOf type helpers */
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
export type OneOf<T extends any[]> = T extends [infer Only] ? Only : T extends [infer A, infer B, ...infer Rest] ? OneOf<[XOR<A, B>, ...Rest]> : never;

export type BackendConfig = {
  baseUrl: string,
  token?: string
}

export type EventMetadata = {
  causationId?: string | undefined;
  correlationId?: string | undefined;
  user?: any;
}

export type CommittedEvent<Payload = any> = {
  name: string,
  data?: Payload,
  stream: string
  metadata: EventMetadata
  id: number
  timestamp: string
  version: number
}

export type CommandParams<Body=any> = {
  id: string,
  query?: {
    expectedVersion?: string
    correlationId?: string
  },
  body?: Body
}

export type CommandExecutionResponse<Model = any, Event = any> = {
  state?: Model,
  events: CommittedEvent<Event>[]
}

export type ReadModelChange<T = any> = {
  type: "insert" | "update" | "delete",
  data: T
};

export type QueryParams<Query=any,Params=any> = {
  // params?: Partial<Params>,
  query?: Partial<Query>
}

export type FetchResponse<T = any> = Response & {
  bodyParsed: T
}

export const parseResponseBody = (type:'json'|'text' ,response: Response, method: 'reject'| 'resolve'): Promise<void|FetchResponse> =>{
  return response[type]()
    .then((bodyParsed) => {
      return Promise[method](Object.assign(response, {
        bodyParsed
      }) as FetchResponse)
    })
}
export const processFetchResponse = <T = any>(response: Response): Promise<void|FetchResponse<T>> =>{
  if (response.ok === true)
    return parseResponseBody('json', response, 'resolve');
  else
    return parseResponseBody('json', response, 'reject')
}

export const parseQueryParams = (query?: Record<string, any>) =>{
  if (query && Object.keys(query).length){
    return new URLSearchParams(query).toString();
  }
  return '';
}

export type Requests = ReturnType<typeof requests>;
export const requests = (params: BackendConfig) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${params.token}`
  }

  const post = (path: string, body?: any, headers: Record<string, string> = {}) => {
    return fetch(`${params.baseUrl}${path}`, Object.assign({
      method: 'post',
      headers: {...defaultHeaders, ...headers},
    }, body
      ? {body: JSON.stringify(body)}
      : {},
    ))
      .then(processFetchResponse)
      .then((response: FetchResponse | void) => { return response?.bodyParsed })
  }

  const get = (path: string, headers: Record<string, string> = {}) => {
    return fetch(`${params.baseUrl}${path}`, Object.assign({
      method: 'get',
      headers: {...defaultHeaders, ...headers},
    }))
      .then(processFetchResponse)
      .then((response: FetchResponse | void) => { return response?.bodyParsed })
  }

  const subscribe = (path:string, name: string, onChange: (change: ReadModelChange)=>void) => {
    console.log(`Stablishing connection with subscription ${name}...`)
    const source = new EventSource(`${params.baseUrl}${path}`);
    source.addEventListener( 'open', (e) => console.log(`Connections to the server established for subscription ${name}`), false );
    source.onmessage = (e) => {
      if (e.data === 'Connected') return;
      onChange(JSON.parse(e.data));
    };
  }

  return {
    post,
    get,
    subscribe
  }

}
