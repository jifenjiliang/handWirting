/*
 * @Description: 继承
 * @Autor: lijinpeng
 * @Date: 2021-03-15 13:57:45
 * @LastEditors: lijinpeng
 */

// 寄生组合式继承
function clone (parent, child) {
  // 继承方法，创建备份
  child.prototype = Object.create(parent.prototype)
  // 必须设置回正确的构造函数，要不然在会发生判断类型出错
  child.prototype.constructor = child
}

function Parent6() {
  this.name = 'parent6';
  this.play = [1, 2, 3]
}

Parent6.prototype.getName = function() {
  return this.name
}

// 继承属性，通过借用构造函数调用
function Child6() {
  Parent6.call(this)
  this.friends = 'child5'
}

clone(Parent6, Child6)

Child6.prototype.getFriends = function() {
  return this.friends
}

let person6 = new Child6()
console.log(person6);
console.log(person6.getName());
console.log(person6.getFriends());