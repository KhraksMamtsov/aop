import 'reflect-metadata';
// import { EventEmitter } from './EventEmitter';
import { App } from './App';

// import { Component as ClassComponent } from './Component';

// const ee = new EventEmitter();
//
// ee.$on('asd', (...payload) => {
//   console.log('on', ...payload);
// });
//
// ee.$once('asd', (...payload) => {
//   console.log('once', ...payload);
// });
//
// ee.$emit('asd', 1, 2);

const app = new App();
const $app = document.getElementById('app');

if ($app !== null) {
  (window as any).app = app;
  console.log(app.mount($app));
}

// _logTree(app);

// function _logTree(componentsRoot: ClassComponent) {
//   console.group((componentsRoot.constructor as typeof ClassComponent).$name);
//   console.log(componentsRoot);
//   for (const prop in componentsRoot.$children) {
//     if (componentsRoot.$children.hasOwnProperty(prop)) {
//       componentsRoot.$children[prop].forEach(cp => {
//         _logTree(cp);
//       });
//     }
//   }
//   console.groupEnd();
// }


// import { CatsApi } from './http/Some';
//
// console.log(new CatsApi());
// // console.log(new CatsApi().save([2]).then(console.log));
// console.log(new CatsApi().getAll().then(console.log));
