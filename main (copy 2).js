
import loadJSONResource from './utils.js';

class RenderedObj{

    constructor(gl, vertexShaderText, fragmentShaderText, model, program) {
        this.gl = gl;
        this.program = program;
        this.vertexShaderText = vertexShaderText;
        this.fragmentShaderText = fragmentShaderText;
        this.model = model;
        this.angle = 0;       
        this.position = [0, 0, 0]; 
        this.identityMatrix = new Float32Array(16);
        this.xRotMat = new Float32Array(16);
        this.init();
    }

    init() {
        var vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER)
        var fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)
        this.gl.shaderSource(vertexShader, vertexShaderText);
        this.gl.shaderSource(fragmentShader, fragmentShaderText);
        this.gl.compileShader(vertexShader);
        this.gl.compileShader(fragmentShader);
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        this.logoVerts = this.model.meshes[0].vertices;
        this.logoIndices = [].concat.apply([], this.model.meshes[0].faces);

        var cubeVertexBufferObject = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cubeVertexBufferObject);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.logoVerts), this.gl.STATIC_DRAW);
        var cubeIndexBufferObject = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, cubeIndexBufferObject);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.logoIndices), this.gl.STATIC_DRAW);
        var positionAttribLocation = this.gl.getAttribLocation(this.program, 'vertPosition');
        //var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

        this.gl.vertexAttribPointer(
        positionAttribLocation,
        3,
        this.gl.FLOAT,
        this.gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
        );
        this.gl.enableVertexAttribArray(positionAttribLocation);
        glMatrix.mat4.identity(this.identityMatrix);

        this.direction = [Math.random() / 10 , Math.random() /10  , Math.random()/ 10];
    }
    
    initTwo(mathWorldUniformLocation) {
        this.mathWorldUniformLocation = mathWorldUniformLocation;

    }

    makeOpposite(number) {
        return number >= 0 ? -number : Math.abs(number);
    }

    update () {
        this.position[0] += this.direction[0];
        this.position[1] += this.direction[1];
        this.position[2] += this.direction[2];

        // Check if the object is outside the screen boundaries

        console.log(this.position);
        console.log(this.direction);

        if (this.position[0] > 5 || this.position[0] < -8)
            this.direction[0] = this.makeOpposite(this.direction[0]);

        if (this.position[1] > 5 || this.position[1] < -5)
            this.direction[1] = this.makeOpposite(this.direction[1]);

        if (this.position[2] > 5 || this.position[2] < -5)
            this.direction[2] = this.makeOpposite(this.direction[2]);

            var yRotMat = new Float32Array(16);

     
        glMatrix.mat4.identity(this.identityMatrix);
        glMatrix.mat4.rotate(this.xRotMat, this.identityMatrix, glMatrix.glMatrix.toRadian(90), [1, 0, 0]);
        this.angle = performance.now()/ 10/ 6 * 2 * Math.PI;
        glMatrix.mat4.rotate(this.identityMatrix, this.identityMatrix, this.angle / 4, [0, 0, 1]);
        glMatrix.mat4.translate(this.identityMatrix, this.identityMatrix, this.position);
        glMatrix.mat4.mul(this.identityMatrix,this.identityMatrix, this.xRotMat);
        glMatrix.mat4.mul(yRotMat,this.identityMatrix, this.xRotMat);
        this.gl.uniformMatrix4fv(this.mathWorldUniformLocation, this.gl.FALSE, this.identityMatrix);
      
    }

    render () {
        this.gl.drawElements(this.gl.TRIANGLES, this.logoIndices.length, this.gl.UNSIGNED_SHORT, 0);
    }
}





var  vertexShaderText = 
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

var fragmentShaderText = 
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
' gl_FragColor = vec4(fragColor, 1.0);',
'}',
].join('\n');


var initDemo = function (canvas, glMatrix){
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


var runDemo = function (canvas, glMatrix, logoModel) {

    var gl = canvas.getContext('webgl');
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    gl.clearColor(0.73, 0.082, 0.25, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



    //check for compile errors

    var program = gl.createProgram();

    var logo = new RenderedObj(gl, vertexShaderText, fragmentShaderText, logoModel, program);

    gl.linkProgram(program);
    //check program linking errors
    //validate program only do in debugging 
    //gl.validateProgram(program);

    //cleate a buffer    

 

    /*
    gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    */

  
    //gl.enableVertexAttribArray(colorAttribLocation);

    gl.useProgram(program);

    var mathWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var viewUniformLocation = gl.getUniformLocation(program, 'mView');
    var projUniformLocation = gl.getUniformLocation(program, 'mProj');

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);

    glMatrix.mat4.identity(worldMatrix);
    //glMatrix.mat4.identity(viewMatrix);
    //glMatrix.mat4.identity(projMatrix);
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, 10], [0, 0, 0], [0, 1, 0]);
    glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);;

    gl.uniformMatrix4fv(mathWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(viewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(projUniformLocation, gl.FALSE, projMatrix);

    logo.initTwo(mathWorldUniformLocation);

    var mainLoop = function () {
        logo.update();
        gl.clearColor(0.73, 0.082, 0.25, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //gl.drawArrays(gl.TRIANGLES, 0, 3);
        //gl.drawElements(gl.TRIANGLES, logoIndices.length, gl.UNSIGNED_SHORT, 0);
        //wont call the function if the tab loses focus

        logo.render();
        requestAnimationFrame(mainLoop);
    };
    requestAnimationFrame(mainLoop);
};

export default initDemo;