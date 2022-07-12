var strategies = {
  S: function (salary) {
    return salary * 4;
  },
  A: function (salary) {
    return salary * 3;
  },
  B: function (salary) {
    return salary * 2;
  },
};

var calculateBonus = function (level, salary) {
  return strategies[level](salary);
};

// console.log(calculateBonus("S", 1000));

var tween = {
  // 动画已消耗时间 小球原始位置 小球目标位置 动画持续总时间
  linear: function (t, b, c, d) {
    return (c * t) / d + b;
  },
  easeIn: function (t, b, c, d) {
    return c * (t /= d) * t + b;
  },
  strongEaseIn: function (t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
  },
  strongEaseOut: function (t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
  },
  sineaseIn: function (t, b, c, d) {
    return c * (t /= d) * t * t + b;
  },
  sineaseOut: function (t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
  },
};
/**
 * dom
 * <body>
 *   <div id="div" style="position:absolute;background:blue;">我是 div</div>
 * </body>
 * @param {element} dom
 */
 export var Animate = function (dom) {
  this.dom = dom;
  this.startTime = 0;
  this.startPos = 0;
  this.endPos = 0;
  this.propertyName = undefined;
  this.easing = undefined;
  this.duration = undefined;
};
/**
 *
 * @param {string} propertyName - 要改变的 css 属性名
 * @param {number} endPos - 小球运动的目标位置
 * @param {number} duration - 动画持续时间
 * @param {string} easing - 缓动算法
 */
Animate.prototype.start = function (propertyName, endPos, duration, easing) {
  this.startTime = +new Date();
  this.startPos = this.dom.getBoundingClientRect()[propertyName];
  this.propertyName = propertyName;
  this.endPos = endPos;
  this.duration = duration;
  this.easing = tween[easing];

  var self = this;
  var timeId = setInterval(() => {
    if (self.step() === false) {
      clearInterval(timeId);
    }
  }, 19);
};

Animate.prototype.step = function () {
  var t = +new Date();
  if (t >= this.startTime + this.duration) {
    this.update(this.endPos);
    return false;
  }
  var pos = this.easing(
    t - this.startTime,
    this.startPos,
    this.endPos - this.startPos,
    this.duration
  );
  this.update(pos);
};

Animate.prototype.update = function (pos) {
  this.dom.style[this.propertyName] = pos + "PX";
};


// var ani = new Animate(document.querySelector("#div"));

// ani.start("left", 300, 2000, "strongEaseIn");
