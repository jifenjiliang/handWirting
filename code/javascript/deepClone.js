/*
 * @Description: 深拷贝
 * @Autor: lijinpeng
 * @Date: 2021-03-15 13:50:35
 * @LastEditors: lijinpeng
 */
// 针对能够遍历对象的不可枚举属性以及 Symbol 类型，我们可以使用 Reflect.ownKeys 方法；
// 当参数为 Date、RegExp 类型，则直接生成一个新的实例返回；
// 利用 Object 的 getOwnPropertyDescriptors 方法可以获得对象的所有属性，以及对应的特性，
// 顺便结合 Object 的 create 方法创建一个新对象，并继承传入原对象的原型链；
// 利用 WeakMap 类型作为 Hash 表，因为 WeakMap 是弱引用类型，可以有效防止内存泄漏（你可以关注一下 Map 和 weakMap 的关键区别，这里要用 weakMap），
// 作为检测循环引用很有帮助，如果存在循环，则引用直接返回 WeakMap 存储的值。
// 引用数据类型
const isComplexDataType = obj => (typeof obj === 'object' || typeof obj === 'function') && (obj !== null)
const deepClone = function (obj, hash = new WeakMap()) {
  if (obj.constructor === Date) return new Date(obj) // 日期对象直接返回一个新的日期对象
  if (obj.constructor === RegExp) return new RegExp(obj) // 正则对象直接返回一个新的正则对象
  if (hash.has(obj)) return hash.get(obj)  // 如果循环引用了就用 weakMap 来解决
  let allDesc = Object.getOwnPropertyDescriptors(obj) // 获取对象所有属性的描述
  // 遍历传入参数所有键的特性
  let cloneObj = Object.create(Object.getPrototypeOf(obj), allDesc)
  // 继承原型链
  hash.set(obj, cloneObj)
  for (let key of Reflect.ownKeys(obj)) {
    cloneObj[key] = (isComplexDataType(obj[key]) && typeof obj[key] !== 'function') ? deepClone(obj[key], hash) : obj[key]
  }
  return cloneObj
}