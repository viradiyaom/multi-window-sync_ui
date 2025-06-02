import WindowManager from "./WindowManager.js";

let windowManager;
let initialized = false;
let camera, scene, renderer, world;
let pixR = window.devicePixelRatio ? window.devicePixelRatio : 1;

let sceneOffsetTarget = { x: 0, y: 0 };
let sceneOffset = { x: 0, y: 0 };

let cubes = [];

let today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);
today = today.getTime();

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState != "hidden" && !initialized) {
    init();
  }
});

window.onload = () => {
  if (document.visibilityState != "hidden") {
    init();
  }
};

function init() {
  initialized = true;

  setTimeout(() => {
    setUpCamera();
    setupWindowManager();
    resize();
    updateWindowShape(false);
    render();
    window.addEventListener("resize", resize);
  }, 500);
}

function setUpCamera() {
  camera = new THREE.OrthographicCamera(
    0,
    0,
    window.innerWidth,
    window.innerHeight,
    -10000,
    10000
  );
  camera.position.z = 2.5;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0.2);
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({ antialias: true, depthBuffer: true });
  renderer.setPixelRatio(pixR);

  world = new THREE.Object3D();
  scene.add(world);

  renderer.domElement.setAttribute("id", "scene");
  document.body.appendChild(renderer.domElement);
}

function resize() {
  let width = window.innerWidth;
  let height = window.innerHeight;

  camera = new THREE.OrthographicCamera(0, width, 0, height, -10000, 10000);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function setupWindowManager() {
  windowManager = new WindowManager();
  windowManager.updateWindowShapeListener(updateWindowShape);
  windowManager.setWindowChangeListener(windowsUpdated);

  windowManager.init({});

  windowsUpdated();
}

function updateWindowShape(easing = true) {
  sceneOffsetTarget = { x: -window.screenX, y: -window.screenY };
  if (!easing) sceneOffset = sceneOffsetTarget;
}

function windowsUpdated() {
  updateNumberOfNodes();
}

function updateNumberOfNodes() {
  let wins = windowManager.getWindows();
  console.log("🚀 - updateNumberOfNodes - wins:", wins);

  // remove all cubes
  cubes.forEach(world.remove);

  cubes = [];

  // add new cubes based on the current window setup
  for (let i = 0; i < wins.length; i++) {
    let win = wins[i];

    let c = new THREE.Color();
    c.setHSL(i * 0.1, 1.0, 0.5);

    const heartShape = new THREE.Shape();
    let x = 0,
      y = 0;
    heartShape.moveTo(x + 5, y + 5);
    heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);
    let s = 100 + i * 50;
    let cube = new THREE.Mesh(
      new THREE.ShapeGeometry(heartShape),
      new THREE.MeshBasicMaterial({ color: c, wireframe: true })
    );
    // let cube = new t.Mesh(
    //   new t.BoxGeometry(s, s, s),
    //   new t.MeshBasicMaterial({ color: c, wireframe: true })
    // );
    cube.scale.set(10, 10, 10);
    cube.position.x = win.shape.x + win.shape.w * 0.5;
    cube.position.y = win.shape.y + win.shape.h * 0.5;

    world.add(cube);
    cubes.push(cube);
  }
}

function getTime() {
  return (new Date().getTime() - today) / 1000.0;
}
function render() {
  let t = getTime();

  windowManager.update();

  // calculate the new position based on the delta between current offset and new offset times a falloff value (to create the nice smoothing effect)
  let falloff = 0.05;
  sceneOffset.x =
    sceneOffset.x + (sceneOffsetTarget.x - sceneOffset.x) * falloff;
  sceneOffset.y =
    sceneOffset.y + (sceneOffsetTarget.y - sceneOffset.y) * falloff;

  // set the world position to the offset
  world.position.x = sceneOffset.x;
  world.position.y = sceneOffset.y;

  let wins = windowManager.getWindows();

  // loop through all our cubes and update their positions based on current window positions
  for (let i = 0; i < cubes.length; i++) {
    let cube = cubes[i];
    let win = wins[i];
    let _t = t + i * 0.2;

    let posTarget = {
      x: win.shape.x + win.shape.w * 0.5,
      y: win.shape.y + win.shape.h * 0.5,
    };

    cube.position.x =
      cube.position.x + (posTarget.x - cube.position.x) * falloff;
    cube.position.y =
      cube.position.y + (posTarget.y - cube.position.y) * falloff;
    cube.rotation.x = _t * 0.5;
    cube.rotation.y = _t * 0.3;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
