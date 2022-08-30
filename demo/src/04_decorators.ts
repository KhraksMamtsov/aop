// #region Class Decorator
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