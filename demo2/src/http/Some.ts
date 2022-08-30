import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import {
  Controller,
  // HDPChain,
  HDPExecutor,
  HDPInterceptor,
  RequestMethod
} from "./aop/Controller";
import { Get } from "./aop/Get";
import { Headers } from "./aop/Headers";
import { Post } from "./aop/Post";
// import { Types } from './aop/Types';
import { Cat } from "./models/Cat";

// like https://github.com/KnisterPeter/pretend

class Executor implements HDPExecutor {
  public async fetch(method: RequestMethod, url: string): Promise<any> {
    console.log({ method, url });

    // const name = prompt('Введите имя кота!');
    // return { name };

    return { name: "NORI" };
  }
}

export class Transform implements HDPInterceptor {
  public async onRequest(request: any) {
    console.log("ON_REQUEST: Transform: ", request);
  }

  public async onResponse(response: any, request: any) {
    console.log("ON_RESPONSE: Transform: ", response, request);
    const asd = plainToClass(Cat, response);
    console.log("asd:", asd);
    return asd;
  }

  // public async intercept(next: HDPChain, request: any) {
  //   console.log('Intercept Request: ', request);
  //
  //   const response = await next(request);
  //
  //   console.log('Intercept Response: ', request, response);
  //
  //   const asd = plainToClass(Cat, response);
  //   console.log("asd:", asd);
  //   return response;
  // }
}

class Validate implements HDPInterceptor {
  public async onRequest(request: any) {
    console.log("ON_REQUEST: Validate Request: ", request);
  }

  public async onResponse(response: any, request: any) {
    console.log("ON_RESPONSE: Validate Response: ", response, request);

    let asd = validate(response);

    console.log("ON_RESPONSE: validity: ", await asd);
  }

  // public async intercept(next: HDPChain, request: any): Promise<any> {
  //   console.log('INTERCEPT: Validate Before: ', request);
  //
  //   const response = await next(request);
  //
  //   console.log('INTERCEPT: Validate After: ', request, response);
  //
  //   let asd = validate(response);
  //
  //   console.log("INTERCEPT: validity: ", await asd);
  //
  //   return response;
  // }
}

@Controller("cats", [new Validate(), new Transform()], Executor)
// @FormData
// @Params
@Headers({
  asd: "asd"
})
export class CatsApi {
  public asd: string = "";

  @logMethod
  @Post()
  public async save(_cat: number[]): Promise<void> {
  }

  @Get()
  public async getAll(): Promise<Cat[] | void> {
  }

  @Get("id")
  public async getById(
  /*@Alias(/!*"id"*!/)  */_id: number
  ): Promise<Cat | void> {}
}

// @FormData()
//
// @Delete(':id')
// public async delete(
//   @Param()
//   @As('id')
//     id: number
// ): Promise<void> {
// }
//
// @Get()
// public async getAll(): Promise<Cat[]> {
//   return [new Cat()];
// }
//
// @Get(':id')
// public async getById(@Param('id') id: number): Promise<Cat> {
//   return new Cat();
// }

// new CatsApi().delete(2);
//
// const enum RequestMethod {
//   GET = 'GET',
//   HEAD = 'HEAD',
//   POST = 'POST',
//   PUT = 'PUT',
//   DELETE = 'DELETE',
//   CONNECT = 'CONNECT',
//   OPTIONS = 'OPTIONS',
//   PATCH = 'PATCH',
//   TRACE = 'TRACE',
// }
//
// interface IInterceptor<R = any> {
//   intercept(): Promise<R>;
// }
//
// export interface BasicCredentials {
//   username: string;
//   password: string;
// }
//
// function Controller(prefix: string, options?: ControllerOptions) {
// }
//
// function Get(path: string, options?: RequestMethodOptions) {
// }
//
// interface ControllerOptions extends RedefinableOptions {
//   method?: RequestMethod,
// }
//
// interface RequestMethodOptions extends RedefinableOptions {
// }
//
// interface RedefinableOptions {
//   timeout?: number;
//   interceptors?: IInterceptor[];
//   executor?: IExecutor,
//   headers?: { [key: string]: string },
//   auth?: BasicCredentials,
// }

function logMethod(
  target: object,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<any>
) {
  // save a reference to the original method this way we keep the values currently in the
  // descriptor and don't overwrite what another decorator might have done to the descriptor.
  if (descriptor === undefined) {
    descriptor = Object.getOwnPropertyDescriptor(
      target,
      key
    ) as TypedPropertyDescriptor<any>;
  }
  const originalMethod = descriptor.value;

  // editing the descriptor/value parameter
  descriptor.value = function(...args: any[]) {
    const result = originalMethod.apply(this, args);
    console.log("Call: " + key.toString() + "(" + ") => " + result);
    return result;
  };

  // return edited descriptor as opposed to overwriting the descriptor
  return descriptor;
}

/////////////////////////////////

// function log(this:any, ...args: any[]) {
//   switch(args.length) {
//     case 1:
//       return logClass.apply(this, args);
//     case 2:
//       return logProperty.apply(this, args);
//     case 3:
//       if(typeof args[2] === "number") {
//         return logParameter.apply(this, args);
//       }
//       return logMethod.apply(this, args);
//     default:
//       throw new Error("Decorators are not valid here!");
//   }
// }
//
// function logClass(this: any, target: any) {
//
//   // save a reference to the original constructor
//   var original = target;
//
//   // a utility function to generate instances of a class
//   function construct(ctor: any, args: any[]) {
//     var c : any = function (this: any) {
//       return ctor.apply(this, args);
//     }
//     c.prototype = ctor.prototype;
//     return new c();
//   }
//
//   // the new constructor behaviour
//   var f : any = function (...args: any[]) {
//     console.log("New: " + original.name);
//     return construct(original, args);
//   }
//
//   // copy prototype so intanceof operator still works
//   f.prototype = original.prototype;
//
//   // return new constructor (will override original)
//   return f;
// }
//
// function logProperty(this:any, target: any, key: string) {
//
//   // property value
//   var _val = this[key];
//
//   // property getter
//   var getter = function () {
//     console.log(`Get: ${key} => ${_val}`);
//     return _val;
//   };
//
//   // property setter
//   var setter = function (newVal: any) {
//     console.log(`Set: ${key} => ${newVal}`);
//     _val = newVal;
//   };
//
//   // Delete property.
//   if (delete this[key]) {
//
//     // Create new property with getter and setter
//     Object.defineProperty(target, key, {
//       get: getter,
//       set: setter,
//       enumerable: true,
//       configurable: true
//     });
//   }
// }
//
// function logParameter(target: any, key : string, index : number) {
//   var metadataKey = `log_${key}_parameters`;
//   if (Array.isArray(target[metadataKey])) {
//     target[metadataKey].push(index);
//   }
//   else {
//     target[metadataKey] = [index];
//   }
// }
//
// function logMethod(target: object, key: string, descriptor: any) {
//   var originalMethod = descriptor.value;
//   descriptor.value = function (...args: any[]) {
//
//     var metadataKey = `__log_${key}_parameters`;
//     // @ts-ignore
//     var indices = target[metadataKey];
//
//     if (Array.isArray(indices)) {
//
//       for (var i = 0; i < args.length; i++) {
//
//         if (indices.indexOf(i) !== -1) {
//
//           var arg = args[i];
//           var argStr = JSON.stringify(arg) || arg.toString();
//           console.log(`${key} arg[${i}]: ${argStr}`);
//         }
//       }
//       var result = originalMethod.apply(this, args);
//       return result;
//     }
//     else {
//
//       var a = args.map(a => (JSON.stringify(a) || a.toString())).join();
//       var result = originalMethod.apply(this, args);
//       var r = JSON.stringify(result);
//       console.log(`Call: ${key}(${a}) => ${r}`);
//       return result;
//     }
//   }
//   return descriptor;
// }
//
//
// @log
// class Person {
//   @log
//   public name: string;
//   public surname: string;
//
//   constructor(name : string, surname : string) {
//     this.name = name;
//     this.surname = surname;
//   }
//
//   @log
//   public saySomething(@log something : string) : string {
//     return this.name + " " + this.surname + " says: " + something;
//   }
// }
