import "reflect-metadata";
import { Component } from '../Component';

const DELETE_COMPONENT_CHILDREN_META_KEY = Symbol("DELETE_COMPONENT_CHILDREN_META_KEY");

export function Children(component: new () => Component): PropertyDecorator {
  return function(target: Object, propertyKey: string | symbol) {
    Reflect.defineMetadata(
      DELETE_COMPONENT_CHILDREN_META_KEY,
      {
        component
      },
      target,
      propertyKey,
    );
  };
}

Children.metaKey = DELETE_COMPONENT_CHILDREN_META_KEY;
