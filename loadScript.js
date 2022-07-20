var loadScript = function (src, callback, exportName) {
  var script = document.createElement('script');
  script.src = src;
  script.type = 'text/javascript';
  script.onload = function (...args) {
    callback && callback(...args, exportName ? window[exportName] : exportName);
  };
  document.body.appendChild(script);
};