class WindowManager {
  windows;
  id;
  count;
  winData;
  windowChangeListener;
  winShapeChangeCallback;

  constructor() {
    let that = this;
    addEventListener("storage", (event) => {
      if (event.key == "windows") {
        let newWindows = JSON.parse(event.newValue);
        let winChange = this.didWindowsChange(this.windows, newWindows);

        this.windows = newWindows;

        if (winChange) {
          if (this.windowChangeListener) this.windowChangeListener();
        }
      }
    });

    window.addEventListener("beforeunload", () => {
      let index = this.getWindowIndexFromId(this.id);
      this.windows.splice(index, 1);
      this.count--;
      this.updateWindowsLocalStorage();
    });
  }

  init(metaData) {
    this.windows = JSON.parse(localStorage.getItem("windows")) || [];
    this.count = localStorage.getItem("count") || 0;
    this.count++;

    this.id = this.count;
    let shape = this.getWindowConfig();
    this.winData = { id: this.id, shape: shape, metaData: metaData };
    this.windows.push(this.winData);

    this.updateWindowsLocalStorage();
  }

  update() {
    let winShape = this.getWindowConfig();
    if (
      winShape.x != this.winData.shape.x ||
      winShape.y != this.winData.shape.y ||
      winShape.w != this.winData.shape.w ||
      winShape.h != this.winData.shape.h
    ) {
      this.winData.shape = winShape;

      let index = this.getWindowIndexFromId(this.id);
      this.windows[index].shape = winShape;

      //console.log(windows);
      if (this.winShapeChangeCallback) this.winShapeChangeCallback();
      this.updateWindowsLocalStorage();
    }
  }

  getWindowIndexFromId(id) {
    let index = -1;

    for (let i = 0; i < this.windows.length; i++) {
      if (this.windows[i].id == id) index = i;
    }

    return index;
  }

  setWindowChangeListener(callback) {
    this.windowChangeListener = callback;
  }

  didWindowsChange(oldWindow, newWindow) {
    if (oldWindow.length != newWindow.length) {
      return true;
    } else {
      let hasSameId = false;

      for (let i = 0; i < oldWindow.length; i++) {
        if (oldWindow[i].id != newWindow[i].id) hasSameId = true;
      }

      return hasSameId;
    }
  }

  updateWindowShapeListener(callback) {
    this.winShapeChangeCallback = callback;
  }

  updateWindowsLocalStorage() {
    localStorage.setItem("windows", JSON.stringify(this.windows));
    localStorage.setItem("count", this.count);
  }

  getWindowConfig() {
    return {
      x: window.screenLeft,
      y: window.screenTop,
      w: window.innerWidth,
      h: window.innerHeight,
    };
  }

  getWindows() {
    return this.windows;
  }
}

export default WindowManager;
