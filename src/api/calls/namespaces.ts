export namespace ApiCalls {

  export interface IRequest<B = any> {
    method: string;
    path: string;
    data?: B;
  }

  export interface IResponse<D = any> {
    data?: D;
    error?: string;
    errors?: { [ key: string ]: string };
  }
}
