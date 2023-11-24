
import loadJSONResource from './utils.js';

let worldMatrix = new Float32Array(16);
let viewMatrix = new Float32Array(16);
let projMatrix = new Float32Array(16);
let gl;
let logos = [];
let defaultModel;

let  vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
//'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'void main()',
'{',
' fragColor = vec3(1.0, 1.0, 1.0);',
' gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'}',
].join('\n');

let fragmentShaderText = 
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
' gl_FragColor = vec4(fragColor, 1.0);',
'}',
].join('\n');

export function doThings() {
    addLogo();
}

function addLogo(){
    let logo = new RenderedObj(gl, vertexShaderText, fragmentShaderText, defaultModel);
    gl.useProgram(logo.program);
    gl.uniformMatrix4fv(logo.mathWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(logo.viewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(logo.projUniformLocation, gl.FALSE, projMatrix);
    logos.push(logo);
}

function createProgram(gl, vertexShaderText, fragmentShaderText) {
    let program = gl.createProgram();
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return null;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return null;
    }

    gl.useProgram(program);
    return program;
}

class RenderedObj{
    constructor(gl, vertexShaderText, fragmentShaderText, model) {
        this.gl = gl;
        this.program = createProgram(this.gl, vertexShaderText, fragmentShaderText);
        this.model = model;
        this.angle = 0;       
        this.position = [0, 0, 0]; 
        this.identityMatrix = new Float32Array(16);
        this.xRotMat = new Float32Array(16);
        this.yRotMat = new Float32Array(16);
        this.init();
    }

    init() {
        this.logoVerts = this.model.meshes[0].vertices;
        this.logoIndices = [].concat.apply([], this.model.meshes[0].faces);
        this.positionAttribLocation = this.gl.getAttribLocation(this.program, 'vertPosition');
        this.mathWorldUniformLocation = this.gl.getUniformLocation(this.program, 'mWorld');
        this.viewUniformLocation = this.gl.getUniformLocation(this.program, 'mView');
        this.projUniformLocation = this.gl.getUniformLocation(this.program, 'mProj');

        let cubeVertexBufferObject = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cubeVertexBufferObject);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.logoVerts), this.gl.STATIC_DRAW);
        let cubeIndexBufferObject = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, cubeIndexBufferObject);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.logoIndices), this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(
        this.positionAttribLocation,
        3,
        this.gl.FLOAT,
        this.gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
        );
        this.gl.enableVertexAttribArray(this.positionAttribLocation);
        glMatrix.mat4.identity(this.identityMatrix);

        this.direction = [Math.random() / 20 , Math.random()/ 20  ,0];
    }

    makeOpposite(number) {
        return number >= 0 ? -number : Math.abs(number);
    }

    update () {
        this.position[0] += this.direction[0];
        this.position[1] += this.direction[1];


        if (this.position[0] > 3 || this.position[0] < -2)
            this.direction[0] = this.makeOpposite(this.direction[0]);

        if (this.position[1] > 5 || this.position[1] < -3.5)
            this.direction[1] = this.makeOpposite(this.direction[1]);

        //if (this.position[2] > 4 || this.position[2] < -4)
        //    this.direction[2] = this.makeOpposite(this.direction[2]);
     
        glMatrix.mat4.identity(this.identityMatrix);
        glMatrix.mat4.translate(this.identityMatrix, this.identityMatrix, this.position);

        glMatrix.mat4.rotate(this.xRotMat, this.identityMatrix, glMatrix.glMatrix.toRadian(90), [1, 0, 0]);
        glMatrix.mat4.rotate(this.yRotMat, this.identityMatrix, Math.PI, [0, 0, 1]);

        glMatrix.mat4.mul(this.identityMatrix,this.identityMatrix, this.xRotMat);
        glMatrix.mat4.mul(this.identityMatrix,this.identityMatrix, this.yRotMat);
        glMatrix.mat4.mul(this.yRotMat,this.identityMatrix, this.xRotMat);
        this.gl.uniformMatrix4fv(this.mathWorldUniformLocation, this.gl.FALSE, this.identityMatrix);
      
    }

    render () {
        this.gl.drawElements(this.gl.TRIANGLES, this.logoIndices.length, this.gl.UNSIGNED_SHORT, 0);
    }
}

export function initDemo(canvas, glMatrix){
    loadJSONResource('/logo.json', function (err, modelObj) {
        console.log(err);
        if(err){
            alert("A fatal error has occured");
        }
        else{
            runDemo(canvas, glMatrix, modelObj);
        }
    });
};


let runDemo = function (canvas, glMatrix, logoModel) {
    defaultModel = logoModel;

    gl = canvas.getContext('webgl');
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    canvas.width = window.innerWidth /2;
    canvas.height = window.innerHeight /2;
    gl.viewport(0, 0, window.innerWidth/ 2, window.innerHeight /2);
    gl.viewport(0, 0, window.innerWidth /2, window.innerHeight/ 2);
    gl.clearColor(0.73, 0.082, 0.25, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let logo = new RenderedObj(gl, vertexShaderText, fragmentShaderText, logoModel);

    glMatrix.mat4.identity(worldMatrix);
    glMatrix.mat4.identity(viewMatrix);
    glMatrix.mat4.identity(projMatrix);

    glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width  / canvas.height, 0.1, 1000.0);;

    glMatrix.mat4.lookAt(viewMatrix, [0, 0, -20], [0, 0, 0], [0, 1, 0]);

    gl.useProgram(logo.program);
    gl.uniformMatrix4fv(logo.mathWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(logo.viewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(logo.projUniformLocation, gl.FALSE, projMatrix);
    
    addLogo();

    let mainLoop = function () {
        gl.clearColor(0.73, 0.082, 0.25, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (let i = 0; i < logos.length; i++) {
            let logo = logos[i];
            gl.useProgram(logo.program);
            logo.update();
            logo.render();
        }

        requestAnimationFrame(mainLoop);
    };
    requestAnimationFrame(mainLoop);
};
