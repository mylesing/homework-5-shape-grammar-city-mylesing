import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cube extends Drawable {
  indices: number[] = [];
  positions: number[] = [];
  normals: number[] = [];
  center: vec4;
  dim : number = 0.1;

  initIdx : number[] = [0, 1, 2,
    0, 2, 3,
    4, 5, 6, 
    4, 6, 7,
    8, 9, 10, 
    8, 10, 11,
    12, 13, 14, 
    12, 14, 15,
    16, 17, 18, 
    16, 18, 19,
    20, 21, 22, 
    20, 22, 23
  ];

  initNor : number[] = [0, 0, 1, 0, // first face
    0, 0, 1, 0,
    0, 0, 1, 0,
    0, 0, 1, 0,
 
    0, 0, -1, 0, // second face
    0, 0, -1, 0,
    0, 0, -1, 0,
    0, 0, -1, 0,
 
    0, 1, 0, 0, // third face
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
 
    0, -1, 0, 0, // fourth face
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
 
    1, 0, 0, 0, // fifth face
    1, 0, 0, 0,
    1, 0, 0, 0,
    1, 0, 0, 0,
 
    -1, 0, 0, 0, // sixth face
    -1, 0, 0, 0,
    -1, 0, 0, 0,
    -1, 0, 0, 0
  ];

  // hard coded vec4s for each point on each side
  // first face
  f1p1 : vec4 = vec4.fromValues(-this.dim, -this.dim, this.dim, 1); // first face
  f1p2 : vec4 = vec4.fromValues(this.dim, -this.dim, this.dim, 1);
  f1p3 : vec4 = vec4.fromValues(this.dim, this.dim, this.dim, 1);
  f1p4 : vec4 = vec4.fromValues(-this.dim, this.dim, this.dim, 1);

  // // second face
  f2p1 : vec4 = vec4.fromValues(-this.dim, -this.dim, -this.dim, 1);
  f2p2 : vec4 = vec4.fromValues(this.dim, -this.dim, -this.dim, 1);
  f2p3 : vec4 = vec4.fromValues(this.dim, this.dim, -this.dim, 1);
  f2p4 : vec4 = vec4.fromValues(-this.dim, this.dim, -this.dim, 1);

  // third face
  f3p1 : vec4 = vec4.fromValues(-this.dim, this.dim, -this.dim, 1);
  f3p2 : vec4 = vec4.fromValues(this.dim, this.dim, -this.dim, 1);
  f3p3 : vec4 = vec4.fromValues(this.dim, this.dim, this.dim, 1);
  f3p4 : vec4 = vec4.fromValues(-this.dim, this.dim, this.dim, 1);

  // fourth face
  f4p1 : vec4 = vec4.fromValues(-this.dim, -this.dim, -this.dim, 1);
  f4p2 : vec4 = vec4.fromValues(this.dim, -this.dim, -this.dim, 1);
  f4p3 : vec4 = vec4.fromValues(this.dim, -this.dim, this.dim,  1);
  f4p4 : vec4 = vec4.fromValues(-this.dim, -this.dim, this.dim, 1);

  // fifth face
  f5p1 : vec4 = vec4.fromValues(this.dim, -this.dim, -this.dim, 1);
  f5p2 : vec4 = vec4.fromValues(this.dim, this.dim, -this.dim, 1);
  f5p3 : vec4 = vec4.fromValues(this.dim, this.dim, this.dim, 1);
  f5p4 : vec4 = vec4.fromValues(this.dim, -this.dim, this.dim, 1);

  // sixth face
  f6p1 : vec4 = vec4.fromValues(-this.dim, -this.dim, -this.dim, 1);
  f6p2 : vec4 = vec4.fromValues(-this.dim, this.dim, -this.dim, 1);
  f6p3 : vec4 = vec4.fromValues(-this.dim, this.dim, this.dim, 1);
  f6p4 : vec4 = vec4.fromValues(-this.dim, -this.dim, this.dim, 1);

  initPos : vec4[] = [this.f1p1, this.f1p2, this.f1p3, this.f1p4,
                      this.f2p1, this.f2p2, this.f2p3, this.f2p4,
                      this.f3p1, this.f3p2, this.f3p3, this.f3p4,
                      this.f4p1, this.f4p2, this.f4p3, this.f4p4,
                      this.f5p1, this.f5p2, this.f5p3, this.f5p4,
                      this.f6p1, this.f6p2, this.f6p3, this.f6p4
                    ];

  constructor(center: vec3) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
  }

  // takes in n (number of current cubes/objects drawn) and generates an index array
  setIdx(n : number) {
    for (let i = 0; i < n; ++i) {
      var startId = i * 24;
      for (let j = 0; j < this.initIdx.length; ++j) {
        this.indices.push(startId + this.initIdx[j]);
      }
    }
  }

  // takes in n (number of current cubes/objects drawn) and generates an index array
  setNormals(n : number) {
    for (let i = 0; i < n; ++i) {
      for (let j = 0; j < this.initNor.length; ++j) {
        this.normals.push(this.initNor[j]);
      }
    }
  }

  // add positions to the list of positions given a "center"
  // n represents rescaling!
  addPositions(pos : vec3, n : number) {
    // turn into a vec4
    var c = vec4.fromValues(pos[0], pos[1], pos[2], 1);

    // push cube positions
    for (let i = 0; i < this.initPos.length; ++i) {
      var p = vec4.fromValues(0, 0, 0, 0);
      var s = vec4.fromValues(0, 0, 0, 0);
      vec4.scale(s, this.initPos[i], n);
      vec4.add(p, c, s);

      // push new positions 
      this.positions.push(p[0]);
      this.positions.push(p[1]);
      this.positions.push(p[2]);
      this.positions.push(1);
    } 
  }

  // add positions to the list of positions given a "center"
  // scale the positions!
  addPositionsScaled(pos : vec3, scale : vec3) {
    // turn into a vec4
    var c = vec4.fromValues(pos[0], pos[1], pos[2], 1);

    // push cube positions
    for (let i = 0; i < this.initPos.length; ++i) {
      var p = vec4.fromValues(0, 0, 0, 0);
      var s = vec4.fromValues(0, 0, 0, 0);
      vec4.transformMat4(s, this.initPos[i], mat4.scale(mat4.create(), mat4.create(), scale));
      vec4.add(p, c, s);

      // push new positions 
      this.positions.push(p[0]);
      this.positions.push(p[1]);
      this.positions.push(p[2]);
      this.positions.push(1);
    } 
  }


  create() {
    var f32idx = new Uint32Array(this.indices);
    var f32nor = new Float32Array(this.normals);
    var f32pos = new Float32Array(this.positions);

    this.generateIdx();
    this.generatePos();
    this.generateNor();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, f32idx, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, f32nor, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, f32pos, gl.STATIC_DRAW);

    console.log(`Created cube`);
  }
};

export default Cube;
