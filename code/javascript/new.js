/*
 * @Description: 实现 new、apply、call、bind
 * @Autor: lijinpeng
 * @Date: 2021-03-15 13:52:15
 * @LastEditors: lijinpeng
 */

// new 的实现
// 让实例可以访问到私有属性；
// 让实例可以访问构造函数原型（constructor.prototype）所在原型链上的属性；
// 构造函数返回的最后结果是引用数据类型。

function _new (ctor, ...args) {
  if(typeof ctor !== 'function'){
    throw '构造函数必须是一个函数'
  }
  const instance = {}
  instance.__proto__ = ctor.prototype
  // const instance = Object.create(ctor.prototype)
  const res = ctor.apply(instance, args)
  return (typeof res === 'object' && res !== null) ? res : instance
}

// apply & call & bind 原理介绍
// 先来了解一下这三个方法的基本情况，call、apply 和 bind 是挂在 Function 对象上的三个方法，调用这三个方法的必须是一个函数。
// func.call(thisArg, param1, param2, ...)
// func.apply(thisArg, [param1,param2,...])
// func.bind(thisArg, param1, param2, ...)

// apply 和 call 的实现
Function.prototype.call = function (context, ...args) {
  context = context || window;
  const fnSymbol = Symbol("fn");
  context[fnSymbol] = this;
  context[fnSymbol](...args);
  delete context[fnSymbol];
}
Function.prototype.apply = function (context, args) {
  context = context || window;
  const fnSymbol = Symbol("fn");
  context[fnSymbol] = this;
  context[fnSymbol](...argsArr);
  delete context[fnSymbol];
}
// bind实现
Function.prototype.bind = function (context, ...args) {
  if (typeof this !== "function") {
    throw new Error("this must be a function");
  }
  context = context || window;
  const fnSymbol = Symbol("fn");
  context[fnSymbol] = this;
  return function (..._args) {
    args = args.concat(_args);
    context[fnSymbol](...args);
    delete context[fnSymbol];
  }
}