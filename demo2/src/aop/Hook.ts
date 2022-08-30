import 'reflect-metadata';
import { LifeCycleHook } from '../Component';

const DELETE_COMPONENT_HOOK_META_KEY = Symbol('DELETE_COMPONENT_HOOK_META_KEY');

// type asd = LifeCycleHook[keyof typeof LifeCycleHook]

export function Hook(
  hook: LifeCycleHook,//'mount' | 'destroy' | 'error',
  order?: number // TODO: implement hooks order
): MethodDecorator {
  return function <T>(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    Reflect.defineMetadata(
      DELETE_COMPONENT_HOOK_META_KEY,
      {
        handler: descriptor.value,
        hook,
        order,
      },
      target,
      propertyKey
    );
  };
}

Hook.metaKey = DELETE_COMPONENT_HOOK_META_KEY;
