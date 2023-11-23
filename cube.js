

var  vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'void main()',
'{',
' fragColor = vertColor;',
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

var initDemo = function (canvas, glMatrix) {
    var gl = canvas.getContext('webgl');
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    gl.clearColor(1.0, 1.0, 0.0, 1.0);
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

    var boxVertices = 
	[ // X, Y, Z           R, G, B
		// Top
		-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
		-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
		1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
		1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

		// Left
		-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

		// Right
		1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
		1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
		1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
		1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

		// Front
		1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

		// Back
		1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
		1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

		// Bottom
		-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
		1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
		1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
	];

	var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

    

    var cubeVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);


    var cubeIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);




    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        positionAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT,
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

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
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, -5],[0, 0, 0], [0, 1, 0]);
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
        glMatrix.mat4.rotate(yRotMat, identityMatrix, angle / 4, [0, 1, 0]);
        glMatrix.mat4.mul(worldMatrix, yRotMat, xRotMat);
        gl.uniformMatrix4fv(mathWorldUniformLocation, gl.FLASE, worldMatrix);

        gl.clearColor(1.0, 1.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        //wont call the function if the tab loses focus
        requestAnimationFrame(mainLoop);
    };
    requestAnimationFrame(mainLoop);
};

export default initDemo;