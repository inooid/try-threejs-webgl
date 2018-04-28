export class KeyDownManager {
  constructor() {
    this.pressedKeys = {};
  }

  allPressedKeys() {
    return Object.keys(this.pressedKeys).filter(Boolean);
  }

  register(key) {
    this.pressedKeys[key] = true;
  }

  remove(key) {
    delete this.pressedKeys[key];
  }
}
