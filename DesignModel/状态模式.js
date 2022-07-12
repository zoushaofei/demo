var Light = function () {
  this.offLightState = new OffLightState(this);
  this.weakLightState = new WeakLightState(this);
  this.strongLightState = new StrongLightState(this);
  this.supeStrongLightState = new SupeStrongLightState(this);

  this.button = null;
  this.currState = null;
};

Light.prototype.init = function () {
  var self = this;
  this.button = document.createElement("button");
  this.button.innerHTML = "开关";
  this.button.onclick = function () {
    self.currState.buttonWasPressed();
  };
  document.body.appendChild(this.button);
  this.currState = this.offLightState;
};

var OffLightState = function (light) {
  this.light = light;
};

OffLightState.prototype.buttonWasPressed = function () {
  console.log("弱光");
  this.light.currState = this.light.weakLightState;
};

var WeakLightState = function (light) {
  this.light = light;
};

WeakLightState.prototype.buttonWasPressed = function () {
  console.log("强光");
  this.light.currState = this.light.strongLightState;
};

var StrongLightState = function (light) {
  this.light = light;
};

StrongLightState.prototype.buttonWasPressed = function () {
  console.log("超强光");
  this.light.currState = this.light.supeStrongLightState;
};

var SupeStrongLightState = function (light) {
  this.light = light;
};

SupeStrongLightState.prototype.buttonWasPressed = function () {
  console.log("关灯");
  this.light.currState = this.light.offLightState;
};

var light = new Light();
light.init();

// 上传

window.external.upload = function (state) {
  // sign uploading done error
  console.log(state);
};

var plugin = (function () {
  var plugin = document.createElement("embed");
  plugin.style.display = "none";
  plugin.type = "application/txftn-webkit";

  plugin.sign = function () {
    console.log("开始文件扫描");
  };
  plugin.pause = function () {
    console.log("暂停文件上传");
  };
  plugin.uploading = function () {
    console.log("开始文件上传");
  };
  plugin.del = function () {
    console.log("删除文件上传");
  };
  plugin.done = function () {
    console.log("文件上传完成");
  };
  document.body.appendChild(plugin);
  return plugin;
})();

var Upload = function (fileName) {
  this.plugin = plugin;
  this.fileName = fileName;
  this.dom = null;
  this.button1 = null;
  this.button2 = null;
  this.signState = new SignState(this);
  this.uploadingState = new UploadingState(this);
  this.pauseState = new PauseState(this);
  this.doneState = new DoneState(this);
  this.errorState = new ErrorState(this);
  this.currState = this.signState;
};

Upload.prototype.init = function () {
  this.dom = document.createElement("div");
  this.dom.innerHTML =
    "<span>文件名称：" +
    this.fileName +
    "</span><button data-action='button1'>扫描中</button><button data-action='button2'>删除</button>";
  document.body.appendChild(this.dom);
  this.button1 = document.querySelector("[data-action='button1']");
  this.button2 = document.querySelector("[data-action='button2']");
  this.bindEvent();
};

Upload.prototype.bindEvent = function () {
  var self = this;
  this.button1.onclick = function () {
    self.currState.clickHandler1();
  };
  this.button2.onclick = function () {
    self.currState.clickHandler2();
  };
};

Upload.prototype.sign = function () {
  this.plugin.sign();
  this.currState = this.signState;
};

Upload.prototype.uploading = function () {
  this.button1.innerHTML = "正在上传，点击暂停";
  this.plugin.uploading();
  this.currState = this.uploadingState;
};

Upload.prototype.pause = function () {
  this.button1.innerHTML = "已暂停，点击继续上传";
  this.plugin.pause();
  this.currState = this.pauseState;
};

Upload.prototype.done = function () {
  this.button1.innerHTML = "上传完成";
  this.plugin.done();
  this.currState = this.doneState;
};

Upload.prototype.error = function () {
  this.button1.innerHTML = "上传失败";
  this.currState = this.errorState;
};

Upload.prototype.del = function () {
  this.plugin.del();
  this.dom.parentNode.removeChild(this.dom);
};

var StateFactory = (function () {
  var State = function () {};
  State.prototype.clickHandler1 = function () {
    throw new Error("子类必须重写父类的 clickHandler1 方法");
  };
  State.prototype.clickHandler2 = function () {
    throw new Error("子类必须重写父类的 clickHandler2 方法");
  };
  return function (param) {
    var F = function (uploadObj) {
      this.uploadObj = uploadObj;
    };

    F.prototype = new State();

    for (var i in param) {
      F.prototype[i] = param[i];
    }

    return F;
  };
})();

var SignState = StateFactory({
  clickHandler1: function () {
    console.log("扫描中，点击无效");
  },
  clickHandler2: function () {
    console.log("文件正在上传中，不能删除");
  },
});

var UploadingState = StateFactory({
  clickHandler1: function () {
    this.uploadObj.pause();
  },
  clickHandler2: function () {
    console.log("文件正在上传中，不能删除");
  },
});

var PauseState = StateFactory({
  clickHandler1: function () {
    this.uploadObj.uploading();
  },
  clickHandler2: function () {
    this.uploadObj.del();
  },
});

var DoneState = StateFactory({
  clickHandler1: function () {
    console.log("文件已完成上传，点击无效");
  },
  clickHandler2: function () {
    this.uploadObj.del();
  },
});

var ErrorState = StateFactory({
  clickHandler1: function () {
    console.log("文件已完成上传，点击无效");
  },
  clickHandler2: function () {
    this.uploadObj.del();
  },
});

var uploadObj = new Upload("javascript 设计模式与开发实践");
uploadObj.init();

window.external.upload = function (state) {
  uploadObj[state]();
};

window.external.upload("sign");

setTimeout(function () {
  window.external.upload("uploading");
}, 1000);

setTimeout(function () {
  window.external.upload("done");
}, 5000);

var Light2 = function () {
  this.currState = FSM1.off;
  this.button = null;
};

Light2.prototype.init = function () {
  var self = this;
  this.button = document.createElement("button");
  this.button.innerHTML = "已关灯";
  this.button.onclick = function () {
    self.currState.buttonWasPressed.call(self, arguments);
  };
  document.body.appendChild(this.button);
};

var FSM1 = {
  off: {
    buttonWasPressed: function () {
      console.log("关灯");
      this.button.innerHTML = "下一次按我是开灯";
      this.currState = FSM1.on;
    },
  },
  on: {
    buttonWasPressed: function () {
      console.log("开灯");
      this.button.innerHTML = "下一次按我是关灯";
      this.currState = FSM1.off;
    },
  },
};

var light2 = new Light2();
light2.init();

var Light3 = function () {
  this.offState = delegate(this, FSM2.off);
  this.onState = delegate(this, FSM2.on);
  this.currState = this.offState;
  this.button = null;
};

Light3.prototype.init = function () {
  var self = this;
  this.button = document.createElement("button");
  this.button.innerHTML = "已关灯";
  this.button.onclick = function () {
    self.currState.buttonWasPressed.call(self, arguments);
  };
  document.body.appendChild(this.button);
};

var FSM2 = {
  off: {
    buttonWasPressed: function () {
      console.log("关灯");
      this.button.innerHTML = "下一次按我是开灯";
      this.currState = this.onState;
    },
  },
  on: {
    buttonWasPressed: function () {
      console.log("开灯");
      this.button.innerHTML = "下一次按我是关灯";
      this.currState = this.offState;
    },
  },
};

var delegate = function (client, delegation) {
  return {
    buttonWasPressed: function () {
      return delegation.buttonWasPressed.call(this, arguments);
    },
  };
};

var light3 = new Light3();
light3.init();
