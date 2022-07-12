Function.prototype.before = function (fn) {
  var self = this;
  return function () {
    fn.apply(this, arguments);
    return self.apply(this, arguments);
  };
};

Function.prototype.after = function (fn) {
  var self = this;
  return function () {
    var ret = self.apply(this, arguments);
    fn.apply(this, arguments);
    return ret;
  };
};

var onload = function (arg) {
  console.log("onload", arg);
}
  .before(function (arg) {
    console.log("before");
    arg.before = true;
  })
  .after(function () {
    console.log("after");
  });

window.onload = onload;
