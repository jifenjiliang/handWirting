/*
 * @Description: 手撕promise
 * @Autor: lijinpeng
 * @Date: 2021-03-15 13:44:42
 * @LastEditors: lijinpeng
 */

// 类型判断 true / false
const isFunction = obj => typeof obj === 'function'
const isObject = obj => typeof obj === 'object' && obj !== null
const isPromise = promise => promise instanceof myPromise

//状态属性，定义为常量，让编辑器有代码提示（方便复用）
const PENDING = 'pending'      // 等待
const FULFILLED = 'fulfilled'  // 成功
const REJECTED = 'rejected'    // 失败

let called // 防止别人的失败再次进入成功和成功再调用失败

/**
 * @description: resolvePromise
 * 判断 x 的值是普通值还是promise对象
 * 如果是普通值 直接调用resovle
 * 如果是promise对象 查看promise对象返回的结果
 * 再根据promise对象返回的结果 决定调用resovle还是调用reject
 */
function resolvePromise (promise2, x, resolve, reject) {
  if (promise2 === x) { // 如果自己返回自己 循环引用 报错
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  if (isObject(x) || isFunction(x)) { // 判断是不是实例对象
    try {
      let then = x.then
      if (isFunction(then)) {
        then.call(x, y => {
          if (called) return
          called = true
          resolvePromise(promise2, y, resolve, reject) // 递归解析promise
        }, e => {
          if (called) return
          called = true
          reject(e)
        })
      } else {
        resolve(x)
      }
    } catch (error) {
      if (called) return
      called = true
      reject(error)
    }
  } else { // 普通值
    resolve(x)
  }
}

class myPromise {
  constructor(executor) { // 接收执行器
    status = PENDING       // 默认是等待
    value = undefined      // 成功之后的值，默认是没有，undefined
    reason = undefined     // 失败之后的原因，默认是没有，undefined
    onFulfilledCallbacks = []   // 异步调用成功函数数组
    onRejectedCallbacks = []    // 异步调用失败函数数组

    let resolve = value => {
      if (isPromise(value)) {
        // 解决Promise.resolve中传入另一个promise的问题，递归调用then方法
        return value.then(resolve, reject)
      }
      if (this.status === PENDING) {
        this.status = FULFILLED                    // 状态改为成功
        this.value = value                         // 保存成功之后的值
        while (this.onFulfilledCallbacks.length) { // 判断成功回调是否存在，如果存在就调用
          this.onFulfilledCallbacks.shift()(this.value)
      }
      }
    }

    let reject = reason => {
      if (this.status === PENDING) {
        this.status = REJECTED                    // 状态改为失败
        this.reason = reason                      // 保存失败之后的值
        while (this.onRejectedCallbacks.length) { // 判断失败回调是否存在，如果存在就调用
          this.onRejectedCallbacks.shift()(this.reason)
        }
      }
    }
    try {
      executor(resolve, reject) // 执行器立即执行
    } catch (error) {
      reject(error)
    }
  }

  then(onFulfilled, onRejected) {
    // promise的链式调用是通过调用then方法的时候再次new一个promise实现的
    onFulfilled = onFulfilled ? onFulfilled : value => value
    onRejected = onRejected ? onRejected : reason => {throw reason}
    let promsie2 = new myPromise((resolve, reject) => { // 创建一个执行器
      if (this.status === FULFILLED) {
        setTimeout(()=>{
          // 使用setTimeout是为了获取到promise2，因为promise2是在myPromise生成后才会出现，所以我们要让他变成异步代码
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      }
      if (this.status === PENDING) {
        // 如果是promise调用resolve获取reject的时候通过异步返回的，当前的promise的状态依然是pending
        // 所以要将所有的成功回调和失败回调存储起来，统一调用
        this.onFulfilledCallbacks.push(() => {
          setTimeout(()=>{
            try {
              let x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
      }
    })

    return promsie2
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  static resolve(data) {
    //创建一个执行器，传递一个resolve方法，把value返回 最后return
    return new myPromise((resolve, reject) => resolve(data))
  }

  static reject(data) {
    //创建一个执行器，传递一个reject方法，把value返回 最后return
    return new myPromise((resolve, reject) => reject(data))
  }

  finally(callback) { //value为当前promise对象的结果
    return this.then((value) => {
      return this.resolve(callback).then(() => value)
    }, (error) => {
      return this.resolve(callback).then(() => {throw error})
    })
  }

  // all方法接受一个数字，并发执行，有一个报错就直接返回报错的错误，其余的继续执行
  static all(promises = []) {
    return new myPromise((resolve, reject) => {
      let index = 0
      const result = []
      const len = promises.length
      let addData = (key, value) => {
        result[key] = value
        if (++index === promises.length) {
          resolve(result)
        }
      }
      for (let i = 0; i < len; i++) {
        const promise = promises[i]
        if (isPromise(promise)) {
          // promise
          promise.then(value => addData(i, value), reason => reject(reason))
        } else {
          // 普通值
          addData(i, promise)
        }
      }
    })
  }

  // race方法是哪个快就用哪个返回的结果作为返回值
  race(promises) {
    return new myPromise((resolve, reject) => {
      for (let index = 0; index < promises.length; index++) {
        const promise = promises[index];
        if (isPromise(promise)) {
          promise.then(resolve, reject)
        } else {
          resolve(promise)
        }
      }
    })
  }
}

myPromise.defer = myPromise.deferred = function() {
  let dfd = {}
  dfd.promise = new myPromise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

module.exports = myPromise