/*
 * @Description: 订阅和发布
 * @Autor: lijinpeng
 * @Date: 2021-03-15 14:03:07
 * @LastEditors: lijinpeng
 */
// 实现自定义事件的订阅和发布，从而提升业务开发的便利性。
function EventEmitter() {
  this.__events = {}
}
EventEmitter.VERSION = '1.0.0';
// 判断是否是合法的 listener
function isValidListener(listener) {
  if (typeof listener === 'function') {
    return true;
  } else if (listener && typeof listener === 'object') {
    return isValidListener(listener.listener);
  } else {
    return false;
  }
}
// 顾名思义，判断新增自定义事件是否存在
function indexOf(array, item) {
  var result = -1
  item = typeof item === 'object' ? item.listener : item;
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i].listener === item) {
      result = i;
      break;
    }
  }
  return result;
}
// on 方法的核心思路就是，当调用订阅一个自定义事件的时候，只要该事件通过校验合法之后，
// 就把该自定义事件 push 到 this.__events 这个对象中存储，等需要出发的时候，
// 则直接从通过获取 __events 中对应事件的 listener 回调函数，而后直接执行该回调方法就能实现想要的效果。
EventEmitter.prototype.on = function(eventName, listener){
  if (!eventName || !listener) return;
  // 判断回调的 listener 是否为函数
  if (!isValidListener(listener)) {
    throw new TypeError('listener must be a function');
  }
  var events = this.__events;
  var listeners = events[eventName] = events[eventName] || [];
  var listenerIsWrapped = typeof listener === 'object';
  // 不重复添加事件，判断是否有一样的
  if (indexOf(listeners, listener) === -1) {
    listeners.push(listenerIsWrapped ? listener : {
      listener: listener,
      once: false
    });
  }
  return this;
};

// 其实就是拿到对应自定义事件进行 apply 执行，在执行过程中对于一开始 once 方法绑定的自定义事件进行特殊的处理，
// 当once 为 true的时候，再触发 off 方法对该自定义事件进行解绑，从而实现自定义事件一次执行的效果。
EventEmitter.prototype.emit = function(eventName, args) {
  // 直接通过内部对象获取对应自定义事件的回调函数
  var listeners = this.__events[eventName];
  if (!listeners) return;
  // 需要考虑多个 listener 的情况
  for (var i = 0; i < listeners.length; i++) {
    var listener = listeners[i];
    if (listener) {
      listener.listener.apply(this, args || []);
      // 给 listener 中 once 为 true 的进行特殊处理
      if (listener.once) {
        this.off(eventName, listener.listener)
      }
    }
  }
  return this;
};

// off其实就是把和listener匹配的事件从对应的 listeners 数组中删除掉
EventEmitter.prototype.off = function(eventName, listener) {
  var listeners = this.__events[eventName];
  if (!listeners) return;
  var index;
  for (var i = 0, len = listeners.length; i < len; i++) {
    if (listeners[i] && listeners[i].listener === listener) {
      index = i;
      break;
    }
  }
  // off 的关键
  if (typeof index !== 'undefined') {
    listeners.splice(index, 1, null)
  }
  return this;
};

// once 方法的本质还是调用 on 方法，只不过传入的参数区分和非一次执行的情况。
// 当再次触发 emit 方法的时候，once 绑定的执行一次之后再进行解绑。
EventEmitter.prototype.once = function(eventName, listener){
  // 直接调用 on 方法，once 参数传入 true，待执行之后进行 once 处理
  return this.on(eventName, {
    listener: listener,
    once: true
  })
};

// allOff其实就是对内部的__events 对象进行清空，清空之后如果再次触发自定义事件，也就无法触发回调函数了。
EventEmitter.prototype.allOff = function(eventName) {
  // 如果该 eventName 存在，则将其对应的 listeners 的数组直接清空
  if (eventName && this.__events[eventName]) {
    this.__events[eventName] = []
  } else {
    this.__events = {}
  }
};

// 总结
// EventEmitter 采用的正是发布-订阅模式。
// 观察者模式和发布-订阅模式有些类似的地方，但是在细节方面还是有一些区别的，你要注意别把这两个模式搞混了。
// 发布-订阅模式其实是观察者模式的一种变形，
// 区别在于：发布-订阅模式在观察者模式的基础上，在目标和观察者之间增加了一个调度中心。