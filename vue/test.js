import { render } from "./index.js";
import { ref, toRefs, effect, watch, computed, reactive, shallowReactive } from "./reactivity/index.js";

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

const test_1 = () => {
  const originData = { flag: true, msg: 'msg', foo: 1, bar: 1, waitDel: true, arr: [1, 2, 3, 4, 5] };

  const obj = reactive(originData);

  const sumRes = computed(() => obj.foo + obj.bar);

  effect(() => {
    console.log('effect', obj.flag ? obj.msg : 'false');
  });

  effect(() => {
    for (let i = 0; i < obj.arr.length; i++) {
      console.log(`for obj.arr[${i}] : ${obj.arr[i]}`);
    }
  });

  effect(() => {
    obj.arr.forEach((item, i) => {
      console.log(`forEach obj.arr[${i}] : ${item}`);
    });
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
    obj.arr.push(999);
    delete obj.waitDel;
    console.log('obj', obj);
    console.log('originData', originData);
    setTimeout(() => {
      // console.log('flag Change');
      // obj.flag = false;
      // obj.foo++;
      // setTimeout(() => {
      //   console.log('flag Change');
      //   obj.flag = true;
      //   obj.foo++;
      //   obj.bar--;
      // }, 1000);
    }, 1000);
  }, 1000);


};

const test_2 = () => {
  const obj = reactive({
    count: 0
  });

  const flag = ref(false);

  const obj2 = toRefs({
    flag: flag,
    count: obj.count
  });

  effect(() => {
    console.log('flag.value', flag.value);
  });

  effect(() => {
    console.log('obj2', obj2);
    console.log('obj2.flag', obj2.flag.value.value);
  });


  setTimeout(() => {
    flag.value = true;
  }, 1000);
};

const test_3 = () => {
  const node = shallowReactive({
    value: {
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
    }
  });

  effect(() => {
    render(node.value, document.querySelector('#app'));
  });


  setTimeout(() => {
    node.value = {
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
      ]
    };
  }, 1000);
};

const test = () => {
  const MyComponent = {
    name: 'MyComponent',
    props: {
      msg: String
    },
    data () {
      return {
        count: 1
      };
    },
    beforeCreate () {
      console.log('beforeCreate');
    },
    created () {
      console.log('created');
    },
    beforeMount () {
      console.log('beforeMount');
    },
    mounted () {
      console.log('mounted');
    },
    beforeUpdate () {
      console.log('beforeUpdate');
    },
    updated () {
      console.log('updated');
    },
    render () {
      return {
        key: 0,
        type: 'div',
        props: {
          onClick: (e) => {
            console.log('div onClick', this);
            this.count++;
          }
        },
        children: `msg : ${this.msg}; count : ${this.count}`
      };
    }
  };

  const vnode = {
    name: 'parent',
    data () {
      return {
        msg: 'Hello World'
      };
    },
    render () {
      return {
        key: 0,
        type: 'div',
        children: [
          {
            key: 0,
            type: 'button',
            props: {
              onClick: () => {
                console.log('button onClick', this);
                this.msg = Date.now();
              }
            },
            children: 'button'
          },
          {
            key: 1,
            type: MyComponent,
            props: {
              msg: this.msg
            },
          }
        ]
      };
    }
  };

  render({ type: vnode }, document.querySelector('#app'));
};

export default test;
