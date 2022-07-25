const bucket = new Set();

let activeEffect;

function effect (fn) {
  activeEffect = fn;
  fn();
}