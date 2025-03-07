type Callback = (...args: any[]) => void;

const customSetImmediate = (callback: Callback): NodeJS.Immediate => {
  return setTimeout(callback, 0) as unknown as NodeJS.Immediate;
};

customSetImmediate.__promisify__ = function(): Promise<void> {
  return Promise.resolve();
};

global.setImmediate = customSetImmediate as typeof global.setImmediate; 