var Upload = function () {
  this.dom = null;
  this.fileSize = undefined;
};

Upload.prototype.delFile = function (id) {
  uploadManager.setExternalState(id, this);
  if (this.fileSize < 3000) {
    return this.dom.parentNode.removeChild(this.dom);
  }
  if (window.confirm("确定删除改文件吗？" + this.fileName)) {
    return this.dom.parentNode.removeChild(this.dom);
  }
};

var UploadFactory = (function () {
  var upload;
  return {
    create: function () {
      if (upload) {
        return upload;
      }
      return (upload = new Upload());
    },
  };
})();

var uploadManager = (function () {
  var uploadDataBase = {};
  return {
    add: function (id, fileName, fileSize) {
      var flayWeightObj = UploadFactory.create();
      var dom = document.createElement("div");
      dom.innerHTML =
        "<span>文件名称：" +
        fileName +
        "，文件大小：" +
        fileSize +
        "</span><button class='delFile'>删除</button>";
      dom.querySelector(".delFile").onclick = function () {
        flayWeightObj.delFile(id);
      };
      document.body.appendChild(dom);
      uploadDataBase[id] = {
        dom,
        fileName,
        fileSize,
      };
    },
    setExternalState: function (id, upload) {
      var uploadData = uploadDataBase[id];
      for (var key in uploadData) {
        upload[key] = uploadData[key];
      }
    },
  };
})();

var id = 0;

startUpload = function (files) {
  for (var i = 0, file; (file = files[i++]);) {
    uploadManager.add(++id, file.fileName, file.fileSize);
  }
};

startUpload([
  {
    fileName: "1.html",
    fileSize: 1000,
  },
  {
    fileName: "2.css",
    fileSize: 2000,
  },
  {
    fileName: "3.js",
    fileSize: 3000,
  },
  {
    fileName: "4.vue",
    fileSize: 4000,
  },
  {
    fileName: "5.jsx",
    fileSize: 5000,
  },
  {
    fileName: "6.tsx",
    fileSize: 6000,
  },
]);

// 通用对象池
var ObjectPoolFactory = function (createObjFn) {
  var objectPool = [];
  return {
    create: function () {
      return objectPool.length
        ? objectPool.shift()
        : createObjFn.call(this, arguments);
    },
    recover: function (obj) {
      objectPool.push(obj);
    },
  };
};

var iframeFactory = ObjectPoolFactory(function () {
  var iframe = document.createElement('iframe');
  iframe.style.display = "block"
  iframe.style.width = "50%"
  iframe.style.height = "400px"
  document.body.appendChild(iframe);
  iframe.onload = function () {
    iframe.onload = null
    iframeFactory.recover(iframe)
  }
  return iframe
})

var iframe1 = iframeFactory.create()
iframe1.src = "https://v3.cn.vuejs.org/"
var iframe2 = iframeFactory.create()
iframe2.src = "https://bing.com/"

setTimeout(() => {
  var iframe3 = iframeFactory.create()
  iframe3.src = "https://vueuse.org/"
}, 3000);