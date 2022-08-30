interface Ctor {
  new(...args: any[]): any;
}

// export type ContainerType = typeof Function
//   | typeof Array
//   | typeof Promise
//   | typeof Map
//   | typeof Set
//   | typeof WeakMap
//   | typeof WeakSet

// type ValueType = typeof Number | typeof String | typeof Boolean;// | typeof Date; // Array Promise Function

// const TypeDescriptor: ContainerTypeDescriptor = {
//   container: Function,
//   type: {
//     container: Promise,
//     type: Number
//   }
// };

type TypeDescriptor = ContainerTypeDescriptor | Array<Ctor | undefined | ContainerTypeDescriptor> | Ctor | undefined;
// type ParamtypesValue = Ctor[];
interface ContainerTypeDescriptor {
  container?: Ctor;
  type: TypeDescriptor;
}

const DESIGN_X__TYPE_METAKEY = Symbol('design-x:type');
const DESIGN_X__RETURNTYPE_METAKEY = Symbol('design-x:returntype');
const DESIGN_X__PARAMTYPES_METAKEY = Symbol('design-x:paramtypes');

export function Types(options: {
  type?: TypeDescriptor,
  paramtypes?: TypeDescriptor,
  returntype?: TypeDescriptor,
}): MethodDecorator {
  return function(target: object, propertyKey: string | symbol) {
    if (options.type !== undefined) {
      Reflect.defineMetadata(DESIGN_X__TYPE_METAKEY, options.type, target, propertyKey);
    }

    if (options.paramtypes !== undefined) {
      Reflect.defineMetadata(DESIGN_X__RETURNTYPE_METAKEY, options.paramtypes, target, propertyKey);
    }

    if (options.returntype !== undefined) {
      Reflect.defineMetadata(DESIGN_X__PARAMTYPES_METAKEY, options.returntype, target, propertyKey);
    }
  };
}
