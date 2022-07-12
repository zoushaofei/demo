class PubSub {
  constructor() {
    this.messages = {};
    this.listeners = {};
  }
  // 添加发布者
  publish (type, content) {
    const existContent = this.messages[type];
    if (!existContent) {
      this.messages[type] = [];
    }
    this.messages[type].push(content);
  }
  // 添加订阅者
  subscribe (type, cb) {
    const existListener = this.listeners[type];
    if (!existListener) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(cb);
  }
  // 通知
  notify (type) {
    const messages = this.messages[type];
    const subscribers = this.listeners[type];
    // subscribers.forEach((cb, index) => cb(messages[index]));
    if (messages && messages.length && subscribers && subscribers.length) {
      subscribers.forEach((cb) => messages.forEach((message) => cb(...message)))
      this.messages[type] = []
    }
  }
}
// 发布者代码如下：
class Publisher {
  constructor(name, context) {
    this.name = name;
    this.context = context;
  }
  publish (type, ...content) {
    this.context.publish(type, content);
  }
}
// 订阅者代码如下：
class Subscriber {
  constructor(name, context) {
    this.name = name;
    this.context = context;
  }
  subscribe (type, cb) {
    this.context.subscribe(type, cb);
  }
}
// 使用代码如下：
const TYPE_A = 'TYPE_A';
const pubsub = new PubSub();
const publisherA = new Publisher('publisherA', pubsub);
const subscriberA = new Subscriber('subscriberA', pubsub);

publisherA.publish(TYPE_A, '1', "110");
subscriberA.subscribe(TYPE_A, (...res) => {
  console.log('subscriberA received1', ...res)
});
publisherA.publish(TYPE_A, 2);
publisherA.publish(TYPE_A, 3);
pubsub.notify(TYPE_A);
publisherA.publish(TYPE_A, '1', "110");
publisherA.publish(TYPE_A, "4", "404");
subscriberA.subscribe(TYPE_A, (...res) => {
  console.log('subscriberA received2', ...res)
});
pubsub.notify(TYPE_A);