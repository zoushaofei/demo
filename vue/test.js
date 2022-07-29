import { render, onMounted, Teleport, KeepAlive, Transition, defineAsyncComponent, TYPE_ENUM } from "./index.js";
import { ref, toRefs, effect, watch, computed, reactive, shallowReactive } from "./reactivity/index.js";
import { compiler } from "./compiler/index.js";
import { newParse } from "./compiler/parse.js";

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

const test_4 = () => {
  const Comp1 = {
    name: 'Comp1',
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
            this.count++;
          }
        },
        children: [
          { key: 0, type: 'p', children: `this is Comp1, ${this.msg}` },
          { key: 1, type: 'p', children: `count is: ${this.count}` }
        ]
      };
    }
  };
  let loaded = false;
  const Comp2 = defineAsyncComponent({
    delay: 3000,
    loader: () => new Promise((resolve) => {
      const res = {
        setup () {
          onMounted(() => {
            console.log('Comp2 onMounted');
          });
          return () => {
            return { key: 0, type: 'div', children: 'this is Comp2' };
          };
        }
      };
      if (!loaded) {
        setTimeout(() => {
          resolve(res);
          loaded = true;
        }, 5000);
      } else {
        resolve(res);
      }
    }),
    loadingComponent: {
      setup () {
        return () => ({
          key: 0,
          type: 'div',
          children: 'loading'
        });
      }
    }
  });

  const Comp3 = {
    setup () {
      const count = ref(0);
      const clickHandler = () => {
        count.value++;
      };
      return {
        count,
        clickHandler
      };
    },
    render () {
      return {
        type: 'div',
        props: { style: 'cursor: pointer;', onClick: this.clickHandler },
        children: `this is Comp3, count is: ${this.count}`
      };
    }
  };

  const Comp4 = (props = {}) => ({
    key: 0,
    type: 'div',
    children: `this is Comp4, text is: ${props.text}`
  });
  Comp4.props = {
    text: String
  };

  const vnode = {
    name: 'parent',
    data () {
      return {
        msg: 'Hello World',
        text: 'show text',
        Comp2Visible: true
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
                this.msg = Date.now();
                this.text = 'Hello World' + this.msg;
                this.Comp2Visible = !this.Comp2Visible;
              }
            },
            children: 'button'
          },
          {
            key: 1,
            type: Comp1,
            props: {
              msg: this.msg
            },
          },
          {
            key: 2,
            type: KeepAlive,
            children: {
              default: () => {
                return this.Comp2Visible
                  ? { key: 0, type: Comp2 }
                  : { key: 0, type: TYPE_ENUM.COMMENT, children: '' };
              }
            }
          },
          {
            key: 3,
            type: Transition,
            children: {
              default: () => ({
                key: 0,
                type: 'div',
                children: [
                  { key: 0, type: Comp3 }
                ]
              })
            }
          },
          {
            key: 4,
            type: Teleport,
            props: {
              to: 'body'
            },
            children: [
              {
                key: 0,
                type: Comp4,
                props: {
                  text: this.text
                }
              }
            ]
          }
        ]
      };
    }
  };

  render({ type: vnode }, document.querySelector('#app'));
};

const test = () => {
  console.log(compiler(`<div><p>Vue</p><p>Template</p></div>`));
  console.log(newParse(
    `<div :id="foo" @click="handler" v-show="display" >
  {{ display }}
  <!-- comment -->
  <p>&lt text1 &gt;</p>
  <p>text2</p>
</div>`
  ));
};

export default test;
