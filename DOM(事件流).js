// DOM 事件

// DOM 0级事件

{/* <input onclick="alert('xxx')"/> */}

// window.onload = function(){
//   document.write("Hello world!");
// };

{/* <button id="btn">Click</button> */}

// JavaScript
// var btn = document.getElementById('btn');
// btn.onclick = function(){
//     alert('xxx');
// }


// DOM 2级事件

// btn.addEventListener( "click" ,function(){})
// btn.removeEventListener( "click" ,a)


// DOM 3级事件

// UI事件，当用户与页面上的元素交互时触发，如：load、scroll
// 焦点事件，当元素获得或失去焦点时触发，如：blur、focus
// 鼠标事件，当用户通过鼠标在页面执行操作时触发如：dblclick、mouseup
// 滚轮事件，当使用鼠标滚轮或类似设备时触发，如：mousewheel
// 文本事件，当在文档中输入文本时触发，如：textInput
// 键盘事件，当用户通过键盘在页面上执行操作时触发，如：keydown、keypress
// 合成事件，当为IME（输入法编辑器）输入字符时触发，如：compositionstart
// 变动事件，当底层DOM结构发生变化时触发，如：DOMsubtreeModified
// 同时DOM3级事件也允许使用者自定义一些事件。


// DOM事件流

// 事件流(Event Flow)指的就是「网页元素接收事件的顺序」。事件流可以分成两种机制：

// 事件捕获(Event Capturing)
// 事件冒泡(Event Bubbling)
// 当一个事件发生后，会在子元素和父元素之间传播（propagation）。这种传播分成三个阶段：

// 捕获阶段：事件从window对象自上而下向目标节点传播的阶段；
// 目标阶段：真正的目标节点正在处理事件的阶段；
// 冒泡阶段：事件从目标节点自下而上向window对象传播的阶段。

// addEventListener()基本上有三个参数，
// 分别是「事件名称」、「事件的处理程序」(事件触发时执行的function)，以及一个「Boolean」值，
// 由这个Boolean决定事件是以「捕获」还是「冒泡」机制执行，若不指定则预设为「冒泡」