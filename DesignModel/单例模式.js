// 单例模式

// 1
var Singleton1 = function (name) {
  this.name = name;
};

Singleton1.prototype.getName = function () {
  return this.name;
};

Singleton1.instance = null;

Singleton1.getInstance = function (name) {
  if (!this.instance) {
    this.instance = new Singleton1(name);
  }
  return this.instance;
};

// 2
var Singleton2 = function (name) {
  this.name = name;
};

Singleton2.prototype.getName = function () {
  return this.name;
};

Singleton2.getInstance = (function () {
  var instance;
  return function (name) {
    if (!instance) {
      instance = new Singleton1(name);
    }
    return instance;
  };
})();

// 3
var Singleton3 = (function () {
  var instance;
  return function (name) {
    if (instance) {
      return instance;
    }
    this.name = name;
    return (instance = this);
  };
})();

Singleton3.prototype.getName = function () {
  return this.name;
};

// 4
var Singleton4 = function (name) {
  this.name = name;
};

Singleton4.prototype.getName = function () {
  return this.name;
};

var ProxySingleton = (function (Fn) {
  var instance;
  return function (...args) {
    if (instance) {
      return instance;
    }
    return (instance = new Fn(...args));
  };
})(Singleton4);
