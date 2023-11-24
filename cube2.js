let vertexShaderText = [
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

let fragmentShaderText = [
    'precision mediump float;',
    '',
    'varying vec3 fragColor;',
    'void main()',
    '{',
    ' gl_FragColor = vec4(fragColor, 1.0);',
    '}',
].join('\n');

let speed = 0;

export function doThings() {
    speed += 0.5;
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

export function initDemo(canvas, glMatrix) {
    let gl = canvas.getContext('webgl');
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight / 2;
    gl.viewport(0, 0, window.innerWidth / 2, window.innerHeight / 2);
    gl.clearColor(1.0, 0.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let program = createProgram(gl, vertexShaderText, fragmentShaderText);
    let program2 = createProgram(gl, vertexShaderText, fragmentShaderText);

    if (!program || !program2) {
        console.error('Failed to create shader programs.');
        return;
    }

    //check program linking errors
    //validate program only do in debugging 
    //gl.validateProgram(program);

    let boxVertices = 
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

	let boxIndices =
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

    let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    let colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    let mathWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    let viewUniformLocation = gl.getUniformLocation(program, 'mView');
    let projUniformLocation = gl.getUniformLocation(program, 'mProj');

    // Set up attributes and uniforms for the second program
    let positionAttribLocation2 = gl.getAttribLocation(program2, 'vertPosition');
    let colorAttribLocation2 = gl.getAttribLocation(program2, 'vertColor');
    let mathWorldUniformLocation2 = gl.getUniformLocation(program2, 'mWorld');
    let viewUniformLocation2 = gl.getUniformLocation(program2, 'mView');
    let projUniformLocation2 = gl.getUniformLocation(program2, 'mProj');

    

    let cubeVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);


    let cubeIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);


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


    let cubeVertexBufferObject2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBufferObject2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);


    let cubeIndexBufferObject2 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBufferObject2);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(
        positionAttribLocation2,
        3,
        gl.FLOAT,
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.vertexAttribPointer(
        colorAttribLocation2,
        3,
        gl.FLOAT,
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT,
    );

    gl.enableVertexAttribArray(positionAttribLocation2);
    gl.enableVertexAttribArray(colorAttribLocation2);


    let worldMatrix = new Float32Array(16);
    let viewMatrix = new Float32Array(16);
    let projMatrix = new Float32Array(16);

    glMatrix.mat4.identity(worldMatrix);
    //glMatrix.mat4.identity(viewMatrix);
    //glMatrix.mat4.identity(projMatrix);
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, -5],[0, 0, 0], [0, 1, 0]);
    glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);;



    gl.useProgram(program);
    gl.uniformMatrix4fv(mathWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(viewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(projUniformLocation, gl.FALSE, projMatrix);


    gl.useProgram(program2);
    gl.uniformMatrix4fv(mathWorldUniformLocation2, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(viewUniformLocation2, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(projUniformLocation2, gl.FALSE, projMatrix);


    let xRotMat = new Float32Array(16);
    let yRotMat = new Float32Array(16);

    let angle = 0;
    let identityMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);
    let mainLoop = function () {
        gl.useProgram(program); 
        angle = (performance.now() / 1000 / 6 * 2 * Math.PI) * speed;
        glMatrix.mat4.rotate(xRotMat, identityMatrix, angle, [0, 0, 1]);
        glMatrix.mat4.rotate(yRotMat, identityMatrix, angle, [1, 0, 0]);
        glMatrix.mat4.mul(worldMatrix, yRotMat, xRotMat);
        gl.uniformMatrix4fv(mathWorldUniformLocation, gl.FALSE, worldMatrix);
    
    
        gl.clearColor(1.0, 0.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    
        gl.useProgram(program2);
        angle = (performance.now() / 1000 / 6 * 2 * Math.PI) * speed;
        glMatrix.mat4.rotate(xRotMat, identityMatrix, angle, [1, 0, 0]); 
        glMatrix.mat4.rotate(yRotMat, identityMatrix, angle, [0, 1, 0]);
        glMatrix.mat4.mul(worldMatrix, yRotMat, xRotMat);
        gl.uniformMatrix4fv(mathWorldUniformLocation2, gl.FALSE, worldMatrix);
    
    
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    
        requestAnimationFrame(mainLoop);
    };
    requestAnimationFrame(mainLoop);
};

