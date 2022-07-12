// 宏命令
var MacroCommand = function () {
  this.commandList = [];
};
MacroCommand.prototype.add = function (command) {
  this.commandList.push(command);
};
MacroCommand.prototype.execute = function () {
  for (let i = 0, command; (command = this.commandList[i++]);) {
    command.execute();
  }
};

var closeDoorCommand = {
  execute: function () {
    console.log("关门");
  },
};

var closeWindowCommand = {
  execute: function () {
    console.log("关窗");
  },
};

var openTVCommand = {
  execute: function () {
    console.log("打开电视");
  },
};

var openSoundCommand = {
  execute: function () {
    console.log("打开音响");
  },
};

var openPCCommand = {
  execute: function () {
    console.log("开电脑");
  },
};

var openQQCommand = {
  execute: function () {
    console.log("打开QQ");
  },
};

var macroCommand = new MacroCommand();

var macroCommand1 = new MacroCommand();

var macroCommand2 = new MacroCommand();

macroCommand1.add(closeDoorCommand);
macroCommand1.add(closeWindowCommand);

macroCommand2.add(openTVCommand);
macroCommand2.add(openSoundCommand);
macroCommand2.add(openPCCommand);
macroCommand2.add(openQQCommand);

macroCommand.add(macroCommand1);
macroCommand.add(macroCommand2);

// macroCommand.execute()

var Folder = function (name) {
  this.name = name;
  this.parent = null;
  this.files = [];
};

Folder.prototype.add = function (file) {
  if (!file.parent) {
    file.parent = this
    this.files.push(file);
  } else {
    throw new Error("无法进行添加操作");
  }
};

Folder.prototype.remove = function () {
  if (!this.parent) {
    return
  }
  this.parent.files.splice(this.parent.files.indexOf(this), 1)
}

Folder.prototype.scan = function () {
  console.log("开始扫描文件夹：" + this.name);
  for (let i = 0, file; (file = this.files[i++]);) {
    file.scan();
  }
};

var File = function (name) {
  this.name = name;
  this.parent = null;
};

File.prototype.add = function () {
  throw new Error("文件下无法进行添加操作");
};

File.prototype.scan = function () {
  console.log("开始扫描文件：" + this.name);
};

File.prototype.remove = function () {
  if (!this.parent) {
    return
  }
  this.parent.files.splice(this.parent.files.indexOf(this), 1)
}

var root = new Folder("根目录");

var folder1 = new Folder("基础");
var folder2 = new Folder("中级");
var folder3 = new Folder("框架");

var file1 = new File("html");
var file2 = new File("css");
var file3 = new File("js");

var file4 = new File("vue");
var file5 = new File("react");

var file6 = new File("node");

root.add(folder1)
root.add(folder2)


folder1.add(file1)
folder1.add(file2)
folder1.add(file3)

folder2.add(file6)
folder2.add(folder3)

folder3.add(file4)
folder3.add(file5)

// root.scan()
// console.log('--------------------------------')
// folder1.remove()
// file6.remove()
// root.scan()

