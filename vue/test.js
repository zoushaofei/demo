import { render } from "./index.js";
import { effect, watch, computed, reactive } from "./reactive/index.js";

const oldNode = {
  type: 'div',
  key: 0,
  props: {
    id: 'foo',
    class: [
      'a',
      { b: true },
      [
        'c',
        { d: false },
        ['e']
      ]
    ]
  },
  children: [
    { type: 'p', children: '0', key: 0 },
    { type: 'p', children: '1', key: 1 },
    { type: 'p', children: '2', key: 2 },
    { type: 'p', children: '3', key: 3 },
    { type: 'p', children: '4', key: 4 }
  ],
};

const newNode = {
  type: 'div',
  key: 0,
  props: {
    id: 'bar',
    onClick: () => {
      alert('clicked');
    }
  },
  children: [
    { type: 'p', children: '5', key: 5 },
    { type: 'p', children: '0', key: 0 },
    { type: 'p', children: '4', key: 4 },
    { type: 'p', children: '2', key: 2 },
    { type: 'p', children: '1', key: 1 },
    { type: 'p', children: '3', key: 3 }
  ],
};

const test = () => {
  // render(oldNode, document.querySelector('#app'));

  // setTimeout(() => {
  //   render(newNode, document.querySelector('#app'));
  // }, 1000);
  const originData = { flag: true, msg: 'msg', foo: 1, bar: 1, waitDel: true };

  const obj = reactive(originData);

  const sumRes = computed(() => obj.foo + obj.bar);

  effect(() => {
    console.log('effect', obj.flag ? obj.msg : 'false');
  });

  watch(() => obj.foo, (newValue, oldValue) => {
    console.log('foo Change', newValue, oldValue);
  });

  const times = [10000, 5000, 3000, 1000, 8000];

  watch(() => sumRes.value, (newValue, oldValue, onInvalidate) => {
    let expired = false;
    onInvalidate(() => {
      expired = true;
    });
    const time = times.pop();
    console.log('执行', time);
    setTimeout(() => {
      console.log('sumRes', newValue, oldValue);
      if (!expired) {
        console.log('没有过期', time);
      } else {
        console.log('过期', time);
      }
    }, time);
  }, { immediate: true });

  setTimeout(() => {
    console.log('msg Change');
    obj.msg = Date.now();
    obj.foo++;
    delete obj.waitDel;
    console.log('obj', obj);
    console.log('originData', originData);
    setTimeout(() => {
      console.log('flag Change');
      obj.flag = false;
      obj.foo++;
      setTimeout(() => {
        console.log('flag Change');
        obj.flag = true;
        obj.foo++;
        obj.bar--;
      }, 1000);
    }, 1000);
  }, 1000);


};

export default test;
