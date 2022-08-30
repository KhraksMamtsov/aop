// https://stackoverflow.com/questions/49764953/typescript-type-safe-class-decorator-that-handles-static-methods
import { HeadersOptions } from './Headers';

export const HDP = Symbol('__HTTP_DATA_PROVIDER__');

export const enum RequestMethod {
  GET = 'GET',
  HEAD = 'HEAD',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  CONNECT = 'CONNECT',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  TRACE = 'TRACE'
}

export interface HDPExecutor {
  fetch(method: RequestMethod, url: string): Promise<any>;
}

export type HDPChain = (request: any) => Promise<any>;

export interface HDPInterceptor {
  onRequest?(request: any): Promise<any>;

  onResponse?(response: any, request: any): Promise<any>;

  intercept?(next: HDPChain, request: any): Promise<any>;
}

export interface HttpDataProvider<T> {
  [HDP]?: T;
}

// interface Interface extends ControllerOptions, ControllerOptionsOptional {}

export interface ControllerOptions {
  prefix: string[];
  executor: HDPInterceptor;
  interceptors: HDPInterceptor[];
  headers?: HeadersOptions;
  auth?: {
    login: string;
    password: string;
  };
}

// export interface ControllerOptionsOptional {
//   headers?: HeadersOptions;
//   auth?: {
//     login: string;
//     password: string;
//   };
// }

// type TCtor<T> = new(...args:any[]) => T;
// type Ctor = new(...args:any[]) => any;
// interface ICtor {
//   new(...args:any[]): any;
// };

export function Controller(
  prefix: string | string[] = ['/'],
  interceptors: HDPInterceptor[] = [],
  executor: new () => HDPExecutor
  // options: Pick<ControllerOptions, "headers" | "auth"> = { headers: {} }
): ClassDecorator {
  return function(target: Function & HttpDataProvider<ControllerOptions>) {
    // const httpDataProvider = target as Function & HttpDataProvider;

    class Fetch implements HDPInterceptor {
      // public async onRequest(request: any): Promise<any> {
      //   return new executor().fetch(RequestMethod.POST, 'ad');
      // }
      //
      // public async onResponse(response: any, _request: any): Promise<any> {
      //   return response;
      // }

      public async intercept(_next: HDPChain, _request: any) {
        console.log('Fetch Before');
        const response = new executor().fetch(RequestMethod.POST, 'ad');
        console.log('Fetch After');
        return response;
        // return new executor().fetch(RequestMethod.POST, 'ad');
      }
    }

    target[HDP] = {
      ...target[HDP],
      ...{
        executor: new Fetch(),
        // headers: {
        //   ...target[HDP].headers, ...options.headers
        // },
        interceptors,
        prefix: Array.isArray(prefix) ? prefix : [prefix]
        // ...options
      }
    };

    // let asd = (target[HDP]!).headers;
  };
}
