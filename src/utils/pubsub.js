/**
 * Created by yarden on 6/11/16.
 */


export function pubsub() {
  if (!window.pubsub)
    window.pubsub = window.opener && window.opener.pubsub ||  {
      publish: publish,
      subscribe: subscribe,
      unsubscribe: unsubscribe
    };

  return window.pubsub;
}

let channels = new Map();

export function subscribe(topic, listener) {
  if (!channels.has(topic)) channels.set(topic, new Set());
  channels.get(topic).add(listener);
  return listener;
}

export function unsubscribe(topic, listener) {
  let channel = channels.get(topic);
  if (channel) {
    channel.delete(listener);
    if (channel.length === 0) channels.delete(topic);
  }
  return this;
}

export function publish(msg, ...data) {
  _publish(false, msg, data);
  return this;
}

export function publishSync(msg, ...data) {
  _publish(true, msg, data);
  return this;
}

function _publish(sync, msg, data) {
  let list = subscribers(msg);
  if (list.length === 0) return;
  let send = envelop(list, msg, data);

  if (sync) send();
  else setTimeout(send, 0);
}

function subscribers(msg) {
  let topic = String(msg), list = [], channel, idx;
  while (true) {
    if (channels.has(topic)) list.push(topic);

    idx = topic.lastIndexOf('.');
    if (idx === -1) break;
    topic = topic.substring(0, idx);
  }
  return list;
}

function envelop(subscribers, msg, data) {
  return () => {
    subscribers.forEach(topic => broadcast(topic, msg, data));
  }
}

function broadcast(topic, msg, data) {
  let channel = channels.get(topic) || {};
  for (let listener of channel) {
    listener(msg, ...data);
  }
}