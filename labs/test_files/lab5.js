var PHONG_VSHADER =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +

  'varying vec4 vtxWorldPosition;\n' +
  'varying vec4 vtxEyePosition;\n' +
  'varying vec4 Normal;\n' +

  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +     // Model matrix
  'uniform mat4 u_ModelViewMatrix;\n' + // Model View matrix
  'uniform mat4 u_NormalMatrix;\n' +    // Transformation matrix of the normal

  'void main() {\n' +
  '  vtxWorldPosition = u_ModelMatrix * a_Position;\n' +
  '  vtxEyePosition = u_ModelViewMatrix * a_Position;\n' +
  '  Normal = normalize(u_NormalMatrix * a_Normal);\n' +

  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '}\n'
;

var PHONG_FSHADER = 
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +

  'varying vec4 vtxWorldPosition;\n' +
  'varying vec4 vtxEyePosition;\n' +
  'varying vec4 Normal;\n' +

  'uniform vec3 u_LightColor;\n' +      // Light color
  'uniform vec3 u_LightPosition;\n' +   // Position of the light source
  'uniform vec3 u_AmbientLight;\n' +    // Ambient light color
  'uniform vec3 u_SpecularLight;\n' +   // Specular light intensity

  'void main() {\n' +
  '  vec3 color = vec3(0.0, 1.0, 0.0);\n' +

  '  vec3 n = normalize(Normal.xyz);\n' +
  '  vec3 s = normalize(u_LightPosition - vtxWorldPosition.xyz);\n' +
  '  vec3 v = normalize(-vtxEyePosition.xyz);\n' +
  '  vec3 r = reflect(-s, n);\n' +

  '  vec3 ambient = u_AmbientLight * color.rgb;\n' +

  '  float sDotN = max(dot(s, n), 0.0);\n' +
  '  vec3 diffuse = u_LightColor * color.rgb * sDotN;\n' +

  '  vec3 specular = vec3(0.0);\n' +
  '  if( sDotN > 0.0 )\n' +
  '     specular = u_SpecularLight * vec3(1.0, 1.0, 1.0) * pow( max( dot(r,v), 0.0 ), 100.0);\n' +
  
  '  gl_FragColor = vec4(ambient + diffuse + specular, 1.0);\n' +
  '}\n'
;

var PASS_VSHADER =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +

  'uniform mat4 u_MvpMatrix;\n' +

  'void main() {\n' +
  '  vec4 n = a_Normal;\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '}\n'
;

var PASS_FSHADER = 
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +

  'void main() {\n' +
  '   gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);\n' +
  '}\n'
;

var FLOOR_PHONG_VSHADER =
  'attribute vec3 vPosition;\n' +
  'attribute vec3 vColor;\n' +

  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +     // Model matrix
  'uniform mat4 u_ModelViewMatrix;\n' + // Model View matrix

  'varying vec4 vtxWorldPosition;\n' +
  'varying vec4 vtxEyePosition;\n' +
  'varying vec4 Normal;\n' +
  'varying vec4 color;\n' +

  'void main() {\n' +
      'vtxWorldPosition = u_ModelMatrix * vec4(vPosition, 1.0);\n' +
      'vtxEyePosition = u_ModelViewMatrix * vec4(vPosition, 1.0);\n' +
      'Normal = normalize(vec4(0.0, 1.0, 0.0, 1.0));\n' +
      'color = vec4(vColor, 1.0);\n' +
      'gl_Position = u_MvpMatrix * vec4(vPosition, 1.0);\n' +
  '}\n'
;

var FLOOR_PHONG_FSHADER =
  'precision mediump float;\n' +

  'varying vec4 vtxWorldPosition;\n' +
  'varying vec4 vtxEyePosition;\n' +
  'varying vec4 Normal;\n' +
  'varying vec4 color;\n' +

  'uniform vec3 u_LightColor;\n' +      // Light color
  'uniform vec3 u_LightPosition;\n' +   // Position of the light source
  'uniform vec3 u_AmbientLight;\n' +    // Ambient light color

  'void main() {\n' +
  '  vec3 n = normalize(Normal.xyz);\n' +
  '  vec3 s = normalize(u_LightPosition - vtxWorldPosition.xyz);\n' +
  '  vec3 v = normalize(-vtxEyePosition.xyz);\n' +
  '  vec3 r = reflect(-s, n);\n' +

  '  vec3 ambient = u_AmbientLight * color.rgb;\n' +

  '  float sDotN = max(dot(s, n), 0.0);\n' +
  '  vec3 diffuse = u_LightColor * color.rgb * sDotN;\n' +

  '  gl_FragColor = vec4(ambient + diffuse, 1.0);\n' +
  '}\n'
;

var FLOOR_PASS_VSHADER =
  'attribute vec3 vPosition;\n' +
  'attribute vec3 vColor;\n' +

  'uniform mat4 u_MvpMatrix;\n' +

  'varying vec4 color;\n' +

  'void main() {\n' +
      'gl_Position = u_MvpMatrix * vec4(vPosition, 1.0);\n' +
      'color = vec4(vColor, 1.0);\n' +
  '}\n'
;

var FLOOR_PASS_FSHADER =
  'precision mediump float;\n' +

  'varying vec4 color;\n' +

  'void main() {\n' +
      'gl_FragColor = color;\n' +
  '}\n'
;

// Camera Movement.
var xEye = 0.0;
var yEye = 0.0;
var zEye = 15;
var angleEye = 0.0;

// Lighting.
var xLight = 5.0;
var yLight = 8.0;
var zLight = 7.0;
var shade = true;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.3, 0.3, 1, 1);
  gl.enable(gl.DEPTH_TEST);

  render(gl, canvas);

  document.getElementById( "shadeOn" ).onclick = function () {
    shade = true;
    render(gl, canvas);
  }

  document.getElementById( "shadeOff" ).onclick = function () {
    shade = false;
    render(gl, canvas);
  }

  window.onkeydown = function( event ) {
    var key = String.fromCharCode(event.keyCode);
    switch( key ) {
      case 'W':
        xEye -= Math.sin(angleEye * Math.PI/180.0);
        zEye -= Math.cos(angleEye * Math.PI/180.0);
        break;

      case 'S':
        xEye += Math.sin(angleEye * Math.PI/180.0);
        zEye += Math.cos(angleEye * Math.PI/180.0);
        break;

      case 'A':
        angleEye += 5.0;
        break;

      case 'D':
        angleEye -= 5.0;
        break;

      case 'U':
        zLight -= 1.0;
        break;

      case 'J':
        zLight += 1.0;
        break;

      case 'K':
        xLight += 1.0;
        break;

      case 'H':
        xLight -= 1.0;
        break;

      case 'O':
        yLight += 1.0;
        break;

      case 'L':
        yLight -= 1.0;
        break;
    }

    if (angleEye > 360.0) angleEye -= 360.0;
    if (angleEye < 0.0) angleEye += 360.0;

    render(gl, canvas);
  }
}

function render(gl, canvas) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  renderSphere(gl, canvas);
  renderFloor(gl, canvas);
}

function renderFloor(gl, canvas) {
  if (shade) {
    if (!initShaders(gl, FLOOR_PHONG_VSHADER, FLOOR_PHONG_FSHADER)) {
      console.log('Failed to intialize shaders.');
      return;
    }
  }
  else {
    if (!initShaders(gl, FLOOR_PASS_VSHADER, FLOOR_PASS_FSHADER)) {
      console.log('Failed to intialize shaders.');
      return;
    }
  }

  var colors = [];
  var points = [];

  var i = 0;
  for (var z = 100.0; z > -100.0; z -= 5.0) {
      for (var x = -100.0; x < 100.0; x += 5.0) {
          if (i % 2) {
              colors.push(vec3(0.0, 0.5, 0.5));
              colors.push(vec3(0.0, 0.5, 0.5));
              colors.push(vec3(0.0, 0.5, 0.5));
              colors.push(vec3(0.0, 0.5, 0.5));
              colors.push(vec3(0.0, 0.5, 0.5));
              colors.push(vec3(0.0, 0.5, 0.5));
          }
          else {
              colors.push(vec3(0.0, 0.0, 0.0));
              colors.push(vec3(0.0, 0.0, 0.0));
              colors.push(vec3(0.0, 0.0, 0.0));
              colors.push(vec3(0.0, 0.0, 0.0));
              colors.push(vec3(0.0, 0.0, 0.0));
              colors.push(vec3(0.0, 0.0, 0.0));
          }
          points.push(vec3(x, -1.0, z));
          points.push(vec3(x, -1.0, z - 5.0));
          points.push(vec3(x - 5.0, -1.0, z - 5.0));

          points.push(vec3(x, -1.0, z));
          points.push(vec3(x - 5.0, -1.0, z - 5.0));
          points.push(vec3(x - 5.0, -1.0, z));
          ++i;
      }
      ++i;
  }

  var vBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

  var vPosition = gl.getAttribLocation( gl.program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  var cBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

  var vColor = gl.getAttribLocation( gl.program, "vColor" );
  gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vColor );

  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_ModelViewMatrix = gl.getUniformLocation(gl.program, 'u_ModelViewMatrix');

  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

  // Set the light color (white)
  gl.uniform3f(u_LightColor, 0.8, 0.8, 0.8);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_LightPosition, xLight, yLight, zLight);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  var mvpMatrix = new Matrix4(); // Model view projection matrix
  var modelMatrix = new Matrix4();// Model matrix
  var modelViewMatrix = new Matrix4(); // ModelView matrix;

  // Pass the model matrix to u_ModelMatrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  mvpMatrix.setPerspective(60, canvas.width/canvas.height, 1, 100);

  var eyeX = xEye - 10 * Math.sin( (Math.PI/180.0) * angleEye);
  var eyeZ = zEye - 10 * Math.cos( (Math.PI/180.0) * angleEye);

  var atX = xEye - 11 * Math.sin( (Math.PI/180.0) * angleEye);
  var atZ = zEye - 11 * Math.cos( (Math.PI/180.0) * angleEye);

  mvpMatrix.lookAt(eyeX, 0, eyeZ, atX, 0, atZ, 0, 1, 0);
  modelViewMatrix.lookAt(eyeX, 0, eyeZ, atX, 0, atZ, 0, 1, 0);

  mvpMatrix.multiply(modelMatrix);
  modelViewMatrix.multiply(modelMatrix);

  // Pass the model view matrix to u_ModelViewMatrix
  gl.uniformMatrix4fv(u_ModelViewMatrix, false, modelViewMatrix.elements);

  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

function renderSphere(gl, canvas) {
  function initVertexBuffers(gl) { // Create a sphere
    var SPHERE_DIV = 8;

    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;

    var positions = [];
    var indices = [];

    // Generate coordinates
    for (j = 0; j <= SPHERE_DIV; j++) {
      aj = j * Math.PI / SPHERE_DIV;
      sj = Math.sin(aj);
      cj = Math.cos(aj);
      for (i = 0; i <= SPHERE_DIV; i++) {
        ai = i * 2 * Math.PI / SPHERE_DIV;
        si = Math.sin(ai);
        ci = Math.cos(ai);

        positions.push(si * sj);  // X
        positions.push(cj);       // Y
        positions.push(ci * sj);  // Z
      }
    }

    // Generate indices
    for (j = 0; j < SPHERE_DIV; j++) {
      for (i = 0; i < SPHERE_DIV; i++) {
        p1 = j * (SPHERE_DIV+1) + i;
        p2 = p1 + (SPHERE_DIV+1);

        indices.push(p1);
        indices.push(p2);
        indices.push(p1 + 1);

        indices.push(p1 + 1);
        indices.push(p2);
        indices.push(p2 + 1);
      }
    }

    // Write the vertex property to buffers (coordinates and normals)
    // Same data can be used for vertex and normal
    // In order to make it intelligible, another buffer is prepared separately
    if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(positions), gl.FLOAT, 3))  return -1;

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Write the indices to the buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return indices.length;
  }

  function initArrayBuffer(gl, attribute, data, type, num) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return true;
  }

  // Initialize shaders
  if (shade) {
    if (!initShaders(gl, PHONG_VSHADER, PHONG_FSHADER)) {
      console.log('Failed to intialize shaders.');
      return;
    }
  }
  else {
    if (!initShaders(gl, PASS_VSHADER, PASS_FSHADER)) {
      console.log('Failed to intialize shaders.');
      return;
    }
  }

  // Set the vertex coordinates, the color and the normal
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Get the storage locations of uniform variables and so on
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_ModelViewMatrix = gl.getUniformLocation(gl.program, 'u_ModelViewMatrix');
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');

  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  var u_SpecularLight = gl.getUniformLocation(gl.program, 'u_SpecularLight');

  // Set the light color (white)
  gl.uniform3f(u_LightColor, 0.8, 0.8, 0.8);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_LightPosition, xLight, yLight, zLight);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
  // Set the specular light
  gl.uniform3f(u_SpecularLight, 1.0, 1.0, 1.0);

  var modelMatrix = new Matrix4();// Model matrix
  var modelViewMatrix = new Matrix4(); // ModelView matrix;
  var mvpMatrix = new Matrix4();// Model view projection matrix
  var normalMatrix = new Matrix4();// Transformation matrix for normals

  // Pass the model matrix to u_ModelMatrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Calculate the view projection matrix
  mvpMatrix.setPerspective(60, canvas.width/canvas.height, 1, 100);

  var eyeX = xEye - 10 * Math.sin( (Math.PI/180.0) * angleEye);
  var eyeZ = zEye - 10 * Math.cos( (Math.PI/180.0) * angleEye);

  var atX = xEye - 11 * Math.sin( (Math.PI/180.0) * angleEye);
  var atZ = zEye - 11 * Math.cos( (Math.PI/180.0) * angleEye);

  mvpMatrix.lookAt(eyeX, 0, eyeZ, atX, 0, atZ, 0, 1, 0);
  modelViewMatrix.lookAt(eyeX, 0, eyeZ, atX, 0, atZ, 0, 1, 0);

  mvpMatrix.multiply(modelMatrix);
  modelViewMatrix.multiply(modelMatrix);

  // Pass the model view matrix to u_ModelViewMatrix
  gl.uniformMatrix4fv(u_ModelViewMatrix, false, modelViewMatrix.elements);

  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Calculate the matrix to transform the normal based on the model matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  // Draw.
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}
