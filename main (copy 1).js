
import loadJSONResource from './utils.js';

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

    var vertexShader = gl.createShader(gl.VERTEX_SHADER)
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    //check for compile errors

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    //check program linking errors
    //validate program only do in debugging 
    //gl.validateProgram(program);

    //cleate a buffer    

    var logoVerts = logoModel.meshes[0].vertices;

	var logoIndices = [].concat.apply([], logoModel.meshes[0].faces);

    

    var cubeVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(logoVerts), gl.STATIC_DRAW);


    var cubeIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(logoIndices), gl.STATIC_DRAW);




    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    //var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        positionAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

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

    gl.enableVertexAttribArray(positionAttribLocation);
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

    var xRotMat = new Float32Array(16);
    var yRotMat = new Float32Array(16);

    var angle = 0;
    var identityMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);


    var mainLoop = function () {
        angle = performance.now()/ 1000/ 6 * 2 * Math.PI;
        glMatrix.mat4.rotate(xRotMat, identityMatrix, angle, [1, 0, 0]);
        glMatrix.mat4.rotate(yRotMat, identityMatrix, angle, [0, 1, 0]);
        //glMatrix.mat4.mul(worldMatrix, yRotMat, xRotMat);
        //gl.uniformMatrix4fv(mathWorldUniformLocation, gl.FLASE, worldMatrix);
        gl.uniformMatrix4fv(mathWorldUniformLocation, gl.FLASE, xRotMat);

        gl.clearColor(0.73, 0.082, 0.25, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.drawElements(gl.TRIANGLES, logoIndices.length, gl.UNSIGNED_SHORT, 0);
        //wont call the function if the tab loses focus
        requestAnimationFrame(mainLoop);
    };
    requestAnimationFrame(mainLoop);
};

export default initDemo;