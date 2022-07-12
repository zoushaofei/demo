let user = {
  _name: "Guest",
  get name () {
    console.log('user', this)
    return this._name;
  }
};

let receiverTemp
let userProxy = new Proxy(user, {
  get (target, prop, receiver) {
    // console.log(receiver)
    receiverTemp = receiver
    console.log('target', target)
    // return target[prop]; // (*) target = user
    return Reflect.get(target, prop, receiver);
  }
});

let admin = {
  __proto__: userProxy,
  _name: "Admin"
};

// 期望输出：Admin
console.log(admin.name); // 输出：Guest (?!?)
// console.log(receiverTemp)
