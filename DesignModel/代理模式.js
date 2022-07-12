var myImage = (function () {
  var imgNode = document.createElement('img');
  document.body.appendChild(imgNode);
  return {
    setSrc: function (src) {
      imgNode.src = src;
    }
  }
})()

var proxyImage = function () {
  var img = new Image
  img.onload = function () {
    myImage.setSrc = this.src
  }
  return {
    setSrc: function (src) {
      myImage.setSrc('预加载图片.jpg')
      img.src = src
    }
  }
}

proxyImage('图片.jpg')


var miniConsole = (function () {
  var cache = [];
  var handler = function (ev) {
    console.log(ev.keyCode)
    if (ev.keyCode === 123) {
      var script = document.createElement("script");
      script.onload = function () {
        for (let i = 0, fn; fn = cache[i++];) {
          fn()
        }
      }
      script.src = 'miniConsole.js'
      document.getElementsByTagName('head')[0].appendChild(script)
      document.body.removeEventListener('keydown', handler)
    }
  }
  document.body.addEventListener('keydown', handler, false)
  return {
    log: function () {
      var args = arguments
      cache.push(function () {
        return miniConsole.log.apply(miniConsole, args)
      })
    }
  }
})()

miniConsole.log(11)



/**************** 计算乘积 *****************/
var mult = function () {
  var a = 1;
  for (var i = 0, l = arguments.length; i < l; i++) {
    a = a * arguments[i];
  }
  return a;
};
/**************** 计算加和 *****************/
var plus = function () {
  var a = 0;
  for (var i = 0, l = arguments.length; i < l; i++) {
    a += arguments[i];
  }
  return a;
};
/**************** 创建缓存代理的工厂*****************/
var createProxyFactory = function (fn) {
  var cache = {};
  return function () {
    var args = Array.prototype.join.call(arguments, ",");
    if (args in cache) {
      return cache[args];
    }
    return (cache[args] = fn.apply(this, arguments));
  };
};
var proxyMult = createProxyFactory(mult);
var proxyPlus = createProxyFactory(plus);

console.log(proxyMult(1, 2, 3, 4)); // 24
console.log(proxyMult(1, 2, 3, 4)); // 24
console.log(proxyPlus(1, 2, 3, 4)); // 10
console.log(proxyPlus(1, 2, 3, 4)); // 10
