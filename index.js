var loadScript = function (src, callback) {
  var script = document.createElement('script')
  script.src = src
  script.type = 'text/javascript'
  script.onload = function (...args) {
    callback && callback(...args)
  }
  document.body.appendChild(script)
}

loadScript('./vue/index.js')