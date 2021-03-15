/*
 * @Description: 数组扁平化的 6 种方式
 * @Autor: lijinpeng
 * @Date: 2021-03-15 13:45:43
 * @LastEditors: lijinpeng
 */
// 扁平化的实现
// 数组的扁平化其实就是将一个嵌套多层的数组 array（嵌套可以是任何层数）转换为只有一层的数组。
var arr = [1, [2, [3, 4, 5]]];
console.log(flatten(arr)); // [1, 2, 3, 4，5]

// 方法一：普通的递归实现
function flatten(array) {
  let result = []
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    if (Array.isArray(element)) {
      result = result.concat(flatten(element))
    } else {
      result.push(element)
    }
  }
  return result
}

// 方法二：利用 reduce 函数迭代
function flatten1(arr) {
  return arr.reduce((prev, next) => {
    return prev.concat(Array.isArray(next) ? flatten(next) : next)
  }, [])
}

// 方法三：扩展运算符实现
// 这个方法的实现，采用了扩展运算符和 some 的方法，两者共同使用，达到数组扁平化的目的
function flatten2(arr) {
  while(arr.some(item => Array.isArray(item))) {
    arr = [].concat(...arr)
  }
  return arr
}

// 方法四：split 和 toString 共同处理
// 数组会默认带一个 toString 的方法，所以可以把数组直接转换成逗号分隔的字符串，然后再用 split 方法把字符串重新转换为数组
function flatten3(arr) {
  return arr.toString().split(',');
}

// 方法五：调用 ES6 中的 flat
arr.flat([depth])
// 其中 depth 是 flat 的参数，depth 是可以传递数组的展开深度（默认不填、数值是 1），即展开一层数组。
// 那么如果多层的该怎么处理呢？参数也可以传进 Infinity，代表不论多少层都要展开
function flatten4(arr) {
  return arr.flat(Infinity);
}

// 方法六：正则和 JSON 方法共同处理
function flatten5(arr) {
  let str = JSON.stringify(arr);
  str = str.replace(/(\[|\])/g, '');
  str = '[' + str + ']';
  return JSON.parse(str);
}