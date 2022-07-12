// import { Animate } from "./策略模式.js";

/**
 * dom
 * <body>
 *  <div id="boll" style="position:absolute;background:#000;width:50px;height:50px;"></div>
 *  输入小球移动目标位置<input id="pos" />
 *  <button id="moveBtn">移动</button>
 *  <button id="cancelBtn">撤销</button>
 * </body>
 */
// var boll = document.querySelector('#boll')
// var pos = document.querySelector('#pos')
// var moveBtn = document.querySelector('#moveBtn')
// var cancelBtn = document.querySelector('#cancelBtn')

// var MoveCommand = function (receiver, pos) {
//   this.receiver = receiver
//   this.pos = pos
//   this.oldPos = undefined
// }
// MoveCommand.prototype.execute = function () {
//   this.receiver.start("left", this.pos, 1000, "strongEaseOut")
//   this.oldPos = this.receiver.dom.getBoundingClientRect()[this.receiver.propertyName]
// }
// MoveCommand.prototype.undo = function () {
//   this.receiver.start("left", this.oldPos, 1000, "strongEaseOut")
// }

// var moveCommand

// moveBtn.onclick = function () {
//   var animate = new Animate(boll)
//   moveCommand = new MoveCommand(animate, pos.value)
//   moveCommand.execute()
// }

// cancelBtn.onclick = function () {
//   moveCommand.undo()
// }

// 宏命令
var MacroCommand = function () {
  this.commandList = []
}
MacroCommand.prototype.add = function (command) {
  this.commandList.push(command)
}
MacroCommand.prototype.execute = function () {
  for (let i = 0, command; command = this.commandList[i++];) {
    command.execute()
  }
}

var closeDoorCommand = {
  execute: function () {
    console.log('关门')
  }
}

var openPCCommand = {
  execute: function () {
    console.log('开电脑')
  }
}

var openQQCommand = {
  execute: function () {
    console.log('打开QQ')
  }
}

var macroCommand = new MacroCommand()
macroCommand.add(closeDoorCommand)
macroCommand.add(openPCCommand)
macroCommand.add(openQQCommand)
macroCommand.execute()