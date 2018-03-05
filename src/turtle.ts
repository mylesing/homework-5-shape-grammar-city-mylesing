import {vec3, vec4, mat4} from 'gl-matrix';

// returns a rotation matrix from inputs
export function rotate(angle : number, x : number, y : number, z : number) : mat4 {
    var theta = 3.1415 * (angle / 180.0);
    var c = Math.cos(theta);
    var s = Math.sin(theta);

    if (Math.abs(c) < 0.001) {
        c = 0.0;
    }

    if (Math.abs(s) < 0.001) {
        s = 0.0;
    }

    let col1 : vec4;
    let col2 : vec4;
    let col3 : vec4;
    let col4 : vec4;

    // Get rotation vector:
    if (x == 1.0) { // Rx
        col1 = vec4.fromValues(1.0, 0.0, 0.0, 0.0);
        col2 = vec4.fromValues(0.0, c, s, 0.0);
        col3 = vec4.fromValues(0.0, -s, c, 0.0);
        col4 = vec4.fromValues(0.0, 0.0, 0.0, 1.0);
    } else if (y == 1.0) { // Ry
        col1 = vec4.fromValues(c, 0.0, s, 0.0);
        col2 = vec4.fromValues(0.0, 1.0, 0.0, 0.0);
        col3 = vec4.fromValues(-s, 0.0, c, 0.0);
        col4 = vec4.fromValues(0.0, 0.0, 0.0, 1.0);
    } else if (z == 1.0) { //Rz
        col1 = vec4.fromValues(c, -s, 0.0, 0.0);
        col2 = vec4.fromValues(s, c, 0.0, 0.0);
        col3 = vec4.fromValues(0.0, 0.0, 1.0, 0.0);
        col4 = vec4.fromValues(0.0, 0.0, 0.0, 1.0);
    }

    return mat4.fromValues(col1[0], col1[1], col1[2], col1[3],
                            col2[0], col2[1], col2[2], col2[3],
                            col3[0], col3[1], col3[2], col3[3],
                            col4[0], col4[1], col4[2], col4[3]);

    // don't mind me this implementation is from 460 lol
}

///// TURTLE CLASS ////
export class Turtle {
    // member variables
    turtlePos : vec3;
    turtleRot : mat4;

    // set up current turtle with position and rotation
    constructor(pos : vec3, rot : mat4) {
        this.turtlePos = pos;
        this.turtleRot = rot;
    }

    // move turtle in specific direction
    translate(dir : vec3) {
        vec3.add(this.turtlePos, this.turtlePos, dir);
    }

    // takes in angle and rotation axis and rotates
    rotate(angle : number, dir : vec3) {
        mat4.multiply(this.turtleRot, this.turtleRot, rotate(angle, dir[0], dir[1], dir[2]));
    }

};

export default Turtle;
