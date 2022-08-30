// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/04_decorators.ts":[function(require,module,exports) {
"use strict"; // #region Class Decorator
// export function logClass(target: Function) {
//     console.log(target);
//     return class extends target {
//         constructor(...args) {
//             console.log(`New: ${target.name} is created`);
//             super(...args);
//         }
//     }
// }
// @logClass
// class Employee {
//     class = "Employee";
//     fn() {
//         console.log("fn: ", this.class);
//     }
// }
// @logClass
// class EmployeeChild extends Employee {
//     classChild = "EmployeeChild";
//     fn() {
//         console.log("fn: ", this.classChild);
//         super.fn();
//     }
// }
// // let emp = new Employee();
// let emp = new EmployeeChild();
// console.log('emp instanceof Employee', emp instanceof Employee);
// console.log('emp instanceof EmployeeChild', emp instanceof EmployeeChild);
// console.log(emp);
// emp.fn();
// #endregion
// #region Method Decorator
// function logMethod(
//     target: Object,
//     propertyName: string,
//     propertyDesciptor: PropertyDescriptor): PropertyDescriptor {
//     // target === Employee.prototype
//     // propertyName === "greet"
//     // propertyDesciptor === Object.getOwnPropertyDescriptor(Employee.prototype, "greet")
//     const method = propertyDesciptor.value;
//     propertyDesciptor.value = function (...args: any[]) {
//         // convert list of greet arguments to string
//         const params = args.map(a => JSON.stringify(a)).join();
//         // invoke greet() and get its return value
//         const result = method.apply(this, args);
//         // convert result to string
//         const r = JSON.stringify(result);
//         // display in console the function call details
//         console.log(`Call: ${propertyName}(${params}) => ${r}`);
//         // return the result of invoking the method
//         return result;
//     }
//     return propertyDesciptor;
// };
// class Employee {
//     constructor(
//         private firstName: string,
//         private lastName: string
//     ) {
//     }
//     @logMethod
//     greet(message: string): string {
//         return `${this.firstName} ${this.lastName} says: ${message}`;
//     }
// }
// const emp = new Employee('Mohan Ram', 'Ratnakumar');
// emp.greet('hello');
// #endregion
// #region Property Decorator
// function logParameter(target: Object, propertyName: string) {
//     // property value
//     let _val = target[propertyName];
//     // property getter method
//     const getter = () => {
//         console.log(`Get: ${propertyName} => ${_val}`);
//         return _val;
//     };
//     // property setter method
//     const setter = newVal => {
//         console.log(`Set: ${propertyName}: ${_val} => ${newVal}`);
//         _val = newVal;
//     };
//     // Delete property.
//     if (delete target[propertyName]) {
//         // Create new property with getter and setter
//         Object.defineProperty(target, propertyName, {
//             get: getter,
//             set: setter,
//             enumerable: true,
//             configurable: true
//         });
//     }
// }
// class Employee {
//     @logParameter
//     @logParameter
//     name: string;
// }
// const emp = new Employee();
// emp.name = "Mohan Ram";
// console.log(emp.name);
// // Set: name: undefined => Mohan Ram
// // Get: name => Mohan Ram
// // Mohan Ram
// emp.name = "Khraks Mamtsov";
// console.log(emp.name);
// //Set: name: Mohan Ram => Khraks Mamtsov
// // Get: name => Khraks Mamtsov
// // Khraks Mamtsov
// #endregion
// #region Parameter Decorator
// function logParameter(target: Object, propertyName: string, index: number) {
//     // generate metadatakey for the respective method
//     // to hold the position of the decorated parameters
//     const metadataKey = `log_${propertyName}_parameters`;
//     if (Array.isArray(target[metadataKey])) {
//         target[metadataKey].push(index);
//     } else {
//         target[metadataKey] = [index];
//     }
// }
// class Employee {
//     greet(@logParameter message: string): string {
//         return `hello ${message}`;
//     }
// }
// const emp = new Employee();
// emp.greet("hello");
// console.log(emp)
// #endregion
},{}],"src/index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
}); // import "./01_decorator.ts";
// import "./02_aspect.ts";
// import "./03_decoratorES6.ts";
// import "./03_trueAspect.ts";

require("./04_decorators.ts"); // import { afterMethod, beforeMethod, Advised, Metadata } from "aspect.js";
// import * as AOP from "aspect.js";
// console.log(AOP);
// class LoggerAspect {
//   @afterMethod({
//     classNamePattern: /^Article/,
//     methodNamePattern: /^(getArticle)/
//   })
//   invokeBeforeMethod(meta: Metadata) {
//     // meta.advisedMetadata == { bar: 42 }
//     console.log(meta);
//     console.info(
//       `Inside of the logger. Called ${meta.className}.${
//       meta.method.name
//       } with args: ${meta.method.args.join(", ")}.`
//     );
//   }
// }
// class Article {
//   id: number;
//   title: string;
//   content: string;
// }
// @Advised({ bar: 42 })
// class ArticleCollection {
//   articles: Article[] = [];
//   async getArticle(id: number) {
//     console.log(`Getting article with id: ${id}.`);
//     return this.articles.filter(a => a.id === id)[0];
//   }
//   async setArticle(article: Article) {
//     console.log(`Setting article with id: ${article.id}.`);
//     this.articles.push(article);
//   }
// }
// let ac = new ArticleCollection();
// ac.setArticle({
//   content: "Article Content",
//   id: 0,
//   title: "Article example"
// });
// ac.getArticle(0).then(console.log);
// // Result:
// // Inside of the logger. Called ArticleCollection.getArticle with args: 1.
// // Getting article with id: 1.
},{"./04_decorators.ts":"src/04_decorators.ts"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "34078" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/index.ts"], null)
//# sourceMappingURL=/src.f10117fe.js.map