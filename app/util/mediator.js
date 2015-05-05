let channels = new Map();
let idProvider = 0;

export function publish (name, data) {
  let channel = channels.get(name);
  
  if (! channel) return;

  for (let i = 0, il = channel.length; i < il; i++) {
    channel[i](data);
  }
} 

export function subscribe (name, func) {
  func.id = ++idProvider;
  if (! channels.has(name)) channels.set(name, []);
  channels.get(name).push(func);
  return idProvider;
}

export function unsubscribe (name, id) {
  let channel = channels.get(name);
  let result = false;

  if (! channel) throw new Error('No channel to unsubscribe from.');

  for (let i = 0, il = channel.length; i < il; i++) {
    if (channel[i].id === id) {
      channel.splice(i, 1);
      result = true;
      break;
    }
  }

  if (! result) throw new Error('No listener was unsubscribed.')
}
