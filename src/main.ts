import { vec3, vec4, mat4 } from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Drawable from './rendering/gl/Drawable';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import Mesh from './geometry/Mesh';
import Icosphere from './geometry/Icosphere';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import { setGL } from './globals';
import ShaderProgram, { Shader } from './rendering/gl/ShaderProgram';
import Structure from './structure';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentiall
  // color parameter
  treeColor: [127.0, 127.0, 127.0, 1.0], // RGBA values
  bubbleColor: [255.0, 0.0, 127.0, 1.0], // RGBA values
  expand: 0,
};

// meshes
let square: Square;
let cube: Cube;
let spheres: Mesh;
let road: Mesh;
let streets: Mesh;
let parks: Mesh;
let centerpiece: Mesh;

// lsystem
let city: Structure[] = [];

// OBJ loader
var OBJ = require('webgl-obj-loader');

function loadScene() {
  // generate plane
  square.create();
  road.create();
  for (let building of city) {
    building.draw();
    building.structure.geometry.create();
    building.roof.geometry.create();
  }

  parks.create();
  streets.create();
  centerpiece.create();
}

function drawCity() {
  // set up circular road from mesh
  road = new Mesh(vec3.fromValues(0, 0, 0));
  road.loadBuffers('cityScape.obj');
  var count = 0;
  road.addPositions(vec3.fromValues(0, -1.9, -10), 3.3);
  road.setIdx(1);
  road.setNormals(1);

  // add streets
  streets = new Mesh(vec3.fromValues(0, 0, 0));
  streets.loadBuffers('square.obj');
  var stCount = 0;
  for (let i = 0; i < 5; ++i) {
    // draw road :^)
    for (let j = 3; j < 9; ++j) {
      var rad = (2 * Math.PI / 5 * i);
      var s = vec3.fromValues(0.3 + 0.05 * j, 1, 0.3 + 0.05 * j);
      var r = mat4.rotateY(mat4.create(), mat4.create(), rad);
      streets.addPositionsRS(vec3.fromValues(Math.sin(rad) * j, -1.9, Math.cos(rad) * j - 10), s, r);
      stCount++;
    }
  }
  streets.setIdx(stCount);
  streets.setNormals(stCount);

  // add buildings
  for (let n = 3; n < 9; ++n) {
    for (let i = 0; i < 25; ++i) {
      var rad = 2 * Math.PI / 25 * i;
      if (!(i % 5 == 0)) {
        if (!(((i % 5 == 2) || (i % 5 == 3)) && ((n == 4) || (n == 5)))) {
          // empty out clearing for parks
          // continue drawing buildings
          var pos = vec3.fromValues(Math.sin(2 * Math.PI / 25 * i) * n, -1.9, Math.cos(2 * Math.PI / 25 * i) * n - 10);
          var rotate = mat4.rotateY(mat4.create(), mat4.create(), rad);
          var str;
          // randomize structure and roof type
          if (Math.random() < 0.5) {
            str = 'B[FS+][FS+]+X';
          } else {
            str = 'B[FS[S+]+][FS+]+Y';
          }
          var building = new Structure(str,
                                        pos,
                                        rotate,
                                        vec3.fromValues(0.5, 0.5, 0.5));
          city.push(building);
          building.setCenterPos(vec3.fromValues(0, -1.9, -10));

        }
        
      }
    }
  }

  // add parks!
  parks.loadBuffers('circle.obj');
  parks.addPositions(vec3.fromValues(0, -2.1, -10), 1.5);
  var count = 1;
  for (let i = 1; i < 11; i+=2) {
    parks.addPositions(vec3.fromValues(Math.sin(2 * Math.PI / 10 * i) * 4.5, -2.1, Math.cos(2 * Math.PI / 10 * i) * 4.5 - 10), 0.9);
    count++;
  }

  parks.setIdx(count);
  parks.setNormals(count);

  // add centerpiece
  centerpiece = new Mesh(vec3.create());
  centerpiece.loadBuffers('roof1.obj');
  centerpiece.addPositionsScaled(vec3.fromValues(0, -0.5, -10), vec3.fromValues(0.5, 1.5, 0.5));
  centerpiece.setIdx(1);
  centerpiece.setNormals(1);

}

let time: number;
time = 0;

export function main() {
  //const cubes = lsystem.draw();

  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'Load Scene');
  // adding color control to GUI
  gui.addColor(controls, 'treeColor');
  gui.addColor(controls, 'bubbleColor');
  gui.add(controls, 'expand', 0, 5).step(1);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement>document.getElementById('canvas');
  const gl = <WebGL2RenderingContext>canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  square = new Square(vec3.fromValues(0, 0, 0));
  parks = new Mesh(vec3.fromValues(0, 0, 0));

  drawCity();

  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  var renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.5, 0.8, 1.5, 1);
  gl.enable(gl.DEPTH_TEST);

  // store current color
  let treeCol: vec4;
  let bubbCol: vec4;

  let shader: ShaderProgram;
  shader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/tree-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/tree-frag.glsl')),
  ]);

  let cloudShader: ShaderProgram;
  cloudShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/cloud-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/cloud-frag.glsl')),
  ]);

  let lambert: ShaderProgram;
  lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/city-frag.glsl')),
  ]);

  let flat: ShaderProgram;
  flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);


  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    renderer.clear();
    // set time
    //console.log(`time = ` + time);
    shader.setTime(time);
    lambert.setTime(time);
    flat.setTime(time);
    cloudShader.setTime(time++);
    // set color 
    treeCol = vec4.fromValues(controls.treeColor[0] / 255.0, controls.treeColor[1] / 255.0, controls.treeColor[2] / 255.0, 1.0);
    bubbCol = vec4.fromValues(controls.bubbleColor[0] / 255.0, controls.bubbleColor[1] / 255.0, controls.bubbleColor[2] / 255.0, 1.0);
    shader.setGeometryColor(treeCol);
    cloudShader.setGeometryColor(bubbCol);

    // grey for roads
    flat.setGeometryColor(vec4.fromValues(0.5, 0.5, 0.5, 1.0));
    renderer.render(camera, flat, [
      road,
      parks, 
      streets,
      //centerpiece
    ]);

    // draw plane
    flat.setGeometryColor(vec4.fromValues(0.2, 0.8, 0.0, 1.0));
    renderer.render(camera, flat, [
      square,
    ]);

    // render buildings : color changes with taller buildings
    lambert.setGeometryColor(vec4.fromValues(1, 0.5, 1.8, 1.0));
    for (let building of city) {
      renderer.render(camera, lambert, [
        building.structure.geometry,
        building.roof.geometry,
      ]);
    }
    renderer.render(camera, lambert, [
      centerpiece,
    ]);
    



    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
