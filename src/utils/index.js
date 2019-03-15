export class KeyDownManager {
  constructor() {
    this.pressedKeys = {};
  }

  isPressing(key) {
    return this.pressedKeys[key];
  }

  register(key) {
    this.pressedKeys[key] = true;
  }

  remove(key) {
    delete this.pressedKeys[key];
  }
}
