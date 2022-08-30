import "reflect-metadata";
import {
  ControllerOptions,
  HDP,
  HDPChain,
  HDPInterceptor,
  HttpDataProvider,
  RequestMethod
} from "./Controller";
import { HeadersOptions } from "./Headers";

// type TCtor<T> = new(...args:any[]) => T;
// type Ctor = new(...args:any[]) => any;
// interface ICtor {
//   new(...args:any[]): any;
// };

export function RequestMethodDecoratorFactory(method: RequestMethod) {
  return function(path: string | string[] = []): MethodDecorator {
    return function(
      target: object,
      propertyKey: string | symbol,
      descriptor: TypedPropertyDescriptor<any>
    ) {
      // TODO: Убрать any
      // const httpDataProvider = target as HttpDataProvider;

      // const httpDataProviderContainer =
      //   httpDataProvider[HDP] ||
      //   // @ts-ignore
      //   (httpDataProvider[HDP] = {});

      path = Array.isArray(path) ? path : [path];
      path = path.length ? path : [propertyKey.toString()];

      if (descriptor === undefined) {
        descriptor = Object.getOwnPropertyDescriptor(
          target,
          propertyKey
        ) as TypedPropertyDescriptor<any>;
      }

      // console.log('+++++++');
      // console.log(target.constructor.name + ' :: ' + propertyKey.toString());
      // console.log(
      //   'design:type is ',
      //   Reflect.getMetadata('design:type', target, propertyKey)
      // );
      // console.log(
      //   'design:paramtypes is ',
      //   Reflect.getMetadata('design:paramtypes', target, propertyKey)
      // );
      // console.log(
      //   'design:returntype is ',
      //   Reflect.getMetadata('design:returntype', target, propertyKey)
      // );
      const originalMethod = descriptor.value;

      descriptor.value = async function(...args: any[]) {
        originalMethod.apply(this, args);
        // TODO: решить что делать с кастингом
        const HDPContainer = (target.constructor as HttpDataProvider<
          ControllerOptions & HeadersOptions
        >)[HDP];

        if (typeof HDPContainer === "undefined") {
          throw new Error("Must be decorated by Controller!");
        }

        return interceptorsChainFactory([
          ...HDPContainer.interceptors,
          HDPContainer.executor
        ])({
          headers: HDPContainer.headers,
          method,
          url: HDPContainer.prefix.concat(path).join("/")
        });
      };

      return descriptor;
    };
  };
}

function applyInterceptor(interceptor: HDPInterceptor) {
  return async function(next: HDPChain, request: any): Promise<any> {
    if (interceptor.intercept) {
      return interceptor.intercept(next, request);
    }

    if (interceptor.onRequest) {
      interceptor.onRequest(request);
    }

    const response = await next(request);

    if (interceptor.onResponse) {
      interceptor.onResponse(response, request);
    }

    return response;
  };
}

function interceptorsChainFactory(interceptors: HDPInterceptor[]): HDPChain {
  let i = 0;
  return function chainStep(request: any): Promise<any> {
    // TODO: use functional approach
    return applyInterceptor(interceptors[i++])(chainStep, request);
  };
}
