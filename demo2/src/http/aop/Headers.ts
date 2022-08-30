import { HDP, HttpDataProvider } from './Controller';

// export function Headers(
//   headers: HeadersOptions
// ) {
//   return function(this: any, ...args: any[]) {
//     switch (args.length) {
//       case 1: {
//         return HeadersClass(headers).apply(this, args);
//       }
//       case 2: {
//         // return logProperty.apply(this, args);
//         break;
//       }
//       case 3: {
//         if (typeof args[2] !== 'number') {
//           return HeadersMethod(headers).apply(this, args);
//         }
//         break;
//       }
//       default:
//         throw new Error('Decorators are not valid here!');
//     }
//   };
// }

const UniversalDecorator = <TClass extends (...args: any) => ClassDecorator,
  TMethod extends (...args: PClass) => MethodDecorator,
  TProp extends (...args: PClass) => PropertyDecorator,
  TParam extends (...args: PClass) => ParameterDecorator,
  PClass extends Parameters<TClass>,
  // PMethod extends Parameters<TMethod>,
  // PProp extends Parameters<TProp>,
  // PParam extends Parameters<TParam>
  >(decorators: {
  class?: TClass;
  method?: TMethod;
  property?: TProp;
  parameter?: TParam;
}) => (...decoratorArgs: PClass /*| PMethod | PProp | PParam*/) => {
  return function(this: any, ...args: any[]) {
    switch (args.length) {
      case 1: {
        // Class
        if (decorators.class) {
          return decorators.class
            .apply(this, decoratorArgs)
            .apply(this, args);
        } else {
          break;
        }
      }
      // case 2: { old version
      //   // Property
      //   if (decorators.property) {
      //     return decorators.property
      //       .apply(this, decoratorArgs)
      //       .apply(this, args);
      //   } else {
      //     throw new Error(' Property Decorators are not valid here!');
      //     // break;
      //   }
      // }
      case 3: {
        if (typeof args[2] === 'undefined') {
          // Property

          if (decorators.property) {
            return decorators.property
              .apply(this, decoratorArgs)
              .apply(this, args);
          } else {
            throw new Error(' Property Decorators are not valid here!');
            // break;
          }
        }

        if (typeof args[2] !== 'number') {
          // Method
          if (decorators.method) {
            return decorators.method
              .apply(this, decoratorArgs)
              .apply(this, args);
          } else {
            throw new Error(' Method Decorators are not valid here!');
            // break;
          }
        }

        if (decorators.parameter) {
          // Parameter
          return decorators.parameter
            .apply(this, decoratorArgs)
            .apply(this, args);
        } else {
          throw new Error('Parameter Decorators are not valid here!');
          // break;
        }
      }
      default: // TODO: Custom Error
        throw new Error('Decorators are not valid here!');
    }
  };
};

export const Headers = UniversalDecorator({
  class: HeadersClass,
  method: HeadersMethod
});

export interface HeadersOptions {
  [key: string]: string;
}

function HeadersClass(headers: HeadersOptions = {}): ClassDecorator {
  return function(
    target: Function & HttpDataProvider<{ headers: HeadersOptions }>
  ) {
    // TODO: refactor internal external & arguments interfaces
    target[HDP] = {
      ...target[HDP],
      headers
    };

    console.log(target[HDP]);
  };
}

function HeadersMethod(headers: HeadersOptions = {}): MethodDecorator {
  return function(
    target: object,
    _propertyKey: string | symbol,
    _descriptor: TypedPropertyDescriptor<any>
  ) {
    // const method = target[propertyKey] as HttpDataProvider<{ headers: HeadersOptions }>;

    const constructor = target.constructor as Function &
      HttpDataProvider<{ headers: HeadersOptions }>;
    constructor[HDP] = {
      ...constructor[HDP],
      headers
    };
  };
}
