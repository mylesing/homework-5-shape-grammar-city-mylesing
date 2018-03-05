import Dictionary from './dictionary';
import { Turtle } from './turtle';
import { vec3, vec4, mat4 } from 'gl-matrix';
import Cube from './geometry/Cube';
import Mesh from './geometry/Mesh';
import Icosphere from './geometry/Icosphere';
import { main } from './main';
import Drawable from './rendering/gl/Drawable';


// Shape class
class Shape {
    symbol: String;
    geometry: Mesh;
    position: vec3;
    rotation: mat4;
    scale: vec3;
    terminal: boolean;

    constructor(str: String, g: Mesh, p: vec3, r: mat4, s: vec3, t: boolean) {
        this.symbol = str;
        this.geometry = g;

        this.position = vec3.create();
        vec3.copy(this.position, p);
        this.rotation = mat4.create();
        mat4.copy(this.rotation, r);
        this.scale = vec3.create();
        vec3.copy(this.scale, s);

        this.terminal = t;
    }

    translate(t: vec3) {
        vec3.add(this.position, this.position, t);
    }

    changeScale(s: vec3) {
        this.scale = vec3.fromValues(this.scale[0] * s[0], this.scale[1] * s[1], this.scale[2] * s[2]);
    }
}

// Rulebook
var rules = new Dictionary();
rules.Add('B', 'B');
rules.Add('+', '++');
rules.Add('S', 'S++')
rules.Add('X', 'Y');
rules.Add('Y', 'X');

// L-system class
export class Structure {
    // member variables
    str: String;           // original shape grammar string
    expandStr: String;     // expanded grammar string
    currTurtle: Turtle;    // current turtle storing position and rotation
    tStack: Shape[];      // initially empty stack to hold shapes
    structure: Shape;
    roof: Shape;
    cityCenter : vec3;

    constructor(str: String, pos: vec3, rot: mat4, scale: vec3) {
        this.str = str;
        this.expandStr = str;
        this.currTurtle = new Turtle(vec3.fromValues(0, -10, -2), mat4.create());
        var cube = new Mesh(pos);
        this.structure = new Shape(this.str, cube, pos, rot, scale, true);
        var cube2 = new Mesh(pos);
        this.roof = new Shape(this.str, cube2, pos, rot, scale, true);
        this.tStack = [];
    }

    setCenterPos(c : vec3) {
        this.cityCenter = c;
    }

    draw() {
        console.log(this.expandStr);

        let count = 0;
        let roofCount = 0;

        // go through the string 
        for (let i = 0; i < this.expandStr.length; ++i) {
            // tree base
            var curr = this.expandStr.charAt(i);
            // current character
            var dir;
            var yShift = 0.35;
            if (curr == 'B') {
                // draw base cube
                this.structure.geometry.loadBuffers('floor.obj');
                this.structure.geometry.addPositionsRS(this.structure.position, this.structure.scale, this.structure.rotation);
                this.structure.translate(vec3.fromValues(0, 0.2, 0));
                count++;
            } else if (curr == '+') {
                // add random number of stories depending on the distance from center
                this.structure.geometry.loadBuffers('floor.obj');
                var stories = Math.random() * Math.sqrt(Math.pow(this.structure.position[0], 2) + Math.pow(this.structure.position[2] + 10, 2));
                for (let i = 0; i < stories; ++i) {
                    this.structure.geometry.addPositionsRS(this.structure.position, this.structure.scale, this.structure.rotation);
                    this.structure.translate(vec3.fromValues(0, yShift, 0));
                    count++;
                }

            } else if (curr == 'S') {
                // shift in random direction to add attaching building
                this.structure.geometry.loadBuffers('floor.obj');
                // move in random x z direction
                var probability = Math.random();
                if (Math.random() > 0.5) {
                    var r3 = Math.round(Math.random());
                    var r4 = Math.round(Math.random());

                    // uhhhh let's not have any 0s lol
                    if (r3 == 0) {
                        r3 = -1;
                    }

                    if (r4 == 0) {
                        r4 = -1;
                    }

                    dir = vec3.fromValues(r3 * 0.3, 0, r4 * 0.3);
                    this.structure.translate(dir);
                    this.structure.geometry.addPositionsRS(this.structure.position, this.structure.scale, this.structure.rotation);

                    count++;
                }

            } else if (curr == 'X') {
                // add roof type 1
                if (Math.random() > 0.5) {
                    this.roof.geometry.loadBuffers('roof1.obj');
                    this.roof.geometry.addPositionsRS(this.structure.position, vec3.fromValues(0.2, Math.random() * 0.5 + 0.2, 0.2), this.structure.rotation);
                    roofCount++;
                }
            } else if (curr == 'Y') {
                // add roof type 2
                if (Math.random() > 0.5) {
                    this.roof.geometry.loadBuffers('roof2.obj');
                    this.roof.geometry.addPositionsRS(this.structure.position, vec3.fromValues(0.8, Math.random() * 0.5 + 0.8, 0.8), this.structure.rotation);
                    roofCount++;
                }

            } else if (curr == 'F') {
                // scale randomly
                var probability = Math.random();
                if (Math.random() > 0.8) {
                    var dist;
                    dist = vec3.dist(this.cityCenter, this.structure.position);
                    // scale cities along the x and z axis more when they're on the outskirts of the city, as there is more space!
                    var shift = vec3.fromValues((3 * Math.random() + 0.5) * 0.1 * dist, 1 + 2 * Math.random(), (4 * Math.random() + 0.5) * 0.1 * dist);
                    this.structure.changeScale(shift);
                    yShift = shift[1];
                }

            } else if (curr == '[') {
                // add shape to stack
                var pos = vec3.create();
                vec3.copy(pos, this.structure.position);
                var rot = mat4.create();
                mat4.copy(rot, this.structure.rotation);
                var scale = vec3.create();
                vec3.copy(scale, this.structure.scale);
                var newShape = new Shape(this.str, this.structure.geometry, pos, rot, scale, true);
                this.tStack.push(newShape);
                continue;

            } else if (curr == ']') {
                // pop shape off of the stack
                this.structure = this.tStack.pop();
                continue;

            }

            this.structure.geometry.setIdx(count);
            this.structure.geometry.setNormals(count);

            this.roof.geometry.setIdx(roofCount);
            this.roof.geometry.setNormals(roofCount);
        }
    }

    expand(count: number) {
        for (let n = 0; n < count; ++n) {
            var newStr = '';
            for (let i = 0; i < this.expandStr.length; ++i) {
                if (rules.ContainsKey(this.expandStr.charAt(i))) {
                    newStr = newStr + rules.Item(this.expandStr.charAt(i));
                }
            }
            this.expandStr = newStr;
        }
    }
}



export default Structure;