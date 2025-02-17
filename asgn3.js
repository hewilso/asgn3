var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }
`;

var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else if (u_whichTexture == 4) {
      gl_FragColor = texture2D(u_Sampler4, v_UV);
    } else {
      gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
    }
  }
`;

let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let g_FOV = 60;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_whichTexture;
var move_front = false;
var move_back = false;
var move_left = false;
var move_right = false;

let camera = new Camera();
let canvas;
let gl;
let a_Position;
let a_UV;
let globalAngleX = 180;
let globalAngleY = 0;
let diamonds_mined = 0;

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  document.onkeydown = keydown;
  document.onkeyup = keyup;

  initTextures();

  canvas.addEventListener("click", async () => {
    await canvas.requestPointerLock();
  });
  canvas.addEventListener("mousemove", mouseMovement);

  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  requestAnimationFrame(tick);
}

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('WebGL failed to load');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('The shaders failed to load');
    return;
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return false;
  }

  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler4');
    return false;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function mouseMovement(event) {
  if (document.pointerLockElement == canvas) {
    if (event.movementX < 0) {
      camera.panLeft(-event.movementX * 0.1);
    } else {
      camera.panRight(event.movementX * 0.1);
    }
  }
}


var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
var fps = 0;
var counter = [];


function tick(timestamp) {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  while (counter.length > 0 && counter[0] <= timestamp - 1000) {
    counter.shift();
  }

  counter.push(timestamp);
  fps = counter.length;
  renderScene();

  requestAnimationFrame(tick);
}

var left_rotate = false;
var right_rotate = false;

function keydown(ev) {
  if (ev.keyCode == 87) {
    move_front = true;
  }
  if (ev.keyCode == 83) {
    move_back = true;
  }
  if (ev.keyCode == 68) {
    move_right = true;
  }
  if (ev.keyCode == 65) {
    move_left = true;
  }
  if (ev.keyCode == 81) {
    left_rotate = true;
  }
  if (ev.keyCode == 69) {
    right_rotate = true;
  }
  if (ev.keyCode == 82) { // R
    addBlock();
  }
  if (ev.keyCode == 70) { // F key
    deleteBlock();
  }
}

function keyup(ev) {
  if (ev.keyCode == 87) { // W
    move_front = false;
  }
  if (ev.keyCode == 83) { // S
    move_back = false;
  }
  if (ev.keyCode == 68) { // D
    move_right = false;
  }
  if (ev.keyCode == 65) { // A
    move_left = false;
  }
  if (ev.keyCode == 81) { // Q
    left_rotate = false;
  }
  if (ev.keyCode == 69) { // E
    right_rotate = false;
  }
  
}
    
function cameraMovement() {
  if (move_front) {
    camera.moveForward();
  }
  if (move_back) {
    camera.moveBackwards();
  }
  if (move_right) {
    camera.moveRight();
  }
  if (move_left) {
    camera.moveLeft();
  }
  if (left_rotate) {
    camera.panLeft(1);
  }
  if (right_rotate) {
    camera.panRight(1);
  }
}

function initTextures() {
  var image0 = new Image();
  if (!image0) {
    console.log('Failed to create Image0');
    return false;
  }

  var image1 = new Image();
  if (!image1) {
    console.log('Failed to create Image1');
    return false;
  }

  var image2 = new Image();
  if (!image2) {
    console.log('Failed to create Image2');
    return false;
  }

  var image3 = new Image();
  if (!image3) {
    console.log('Failed to create Image3');
    return false;
  }

  var image4 = new Image();
  if (!image4) {
    console.log('Failed to create Image4');
    return false;
  }
  image0.onload = function () { img_to_tx_0(image0); };
  image0.src = '../lib/basicafsky.jpg';

  image1.onload = function () { img_to_tx_1(image1); };
  
  image1.src = '../lib/floor_texture.png';
  console.log(' texture loaded successfully');
  img_to_tx_1(image1); 

  image2.onload = function () { img_to_tx_2(image2); };
  image2.src = '../lib/stone.png';

  image3.onload = function () { img_to_tx_3(image3); };
  image3.src = '../lib/polished_blackstone_bricks.png';

  image4.onload = function () { img_to_tx_4(image4); };
  image4.src = '../lib/diamond_ore.jpg';
}

function renderScene() {
  var startTime = performance.now();

  cameraMovement();

  var viewMat = new Matrix4();
  viewMat.setLookAt(
    camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2],
    camera.at.elements[0], camera.at.elements[1], camera.at.elements[2],
    camera.up.elements[0], camera.up.elements[1], camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var projMat = new Matrix4();
  projMat.setPerspective(camera.fov, canvas.width / canvas.height, 0.1, 1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var globalRotMat = new Matrix4();
  globalRotMat.rotate(globalAngleX, 0, 1, 0);
  globalRotMat.rotate((globalAngleY % 360), 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var ground = new Cube();
  var sky = new Cube();

  ground.textureNum = 1;
  sky.textureNum = 0;

  ground.matrix.translate(0, -0.75, 0.0);
  ground.matrix.scale(36, -0.25, 36);
  ground.matrix.translate(-0.5, 0, -0.5);
  ground.render();

  sky.matrix.scale(60, 60, 60);
  sky.matrix.translate(-0.5, 0, -0.5);
  sky.render();

  renderBlocks();

  var duration = performance.now() - startTime;
  sendTextToHTML("fps: " + Math.floor(fps), "numdot");
  sendTextToHTML("<br>" + "Diamonds mined: " + diamonds_mined, "diamonds");

  // in case enough diamonds are mined, give the player the ending they deserve.
  if( diamonds_mined === 15) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const textCanvas = document.getElementById('textCanvas');
    const ctx = textCanvas.getContext('2d');
    ctx.font = '40px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('The END', 100, 109);
    return;
  }


}

function img_to_tx_0(image) {
  var texture0 = gl.createTexture();
  if (!texture0) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture0);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);
}

function img_to_tx_1(image) {
  var texture1 = gl.createTexture();
  if (!texture1) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1);
}

function img_to_tx_2(image) {
  var texture2 = gl.createTexture();
  if (!texture2) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler2, 2);
}

function img_to_tx_3(image) {
  var texture3 = gl.createTexture();
  if (!texture3) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, texture3);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler3, 3);
}

function img_to_tx_4(image) {
  var texture4 = gl.createTexture();
  if (!texture4) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, texture4);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler4, 4);
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}



let map = [
  [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
  [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
  [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
  [9, 9, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 9, 9],
  [9, 9, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 3, 0, 3, 3, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 9, 9],
  [9, 9, 0, 0, 0, 0, 3, 0, 0, 3, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 3, 0, 0, 10, 0, 3, 0, 9, 9],
  [9, 9, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 9, 9],
  [9, 9, 0, 3, 0, 0, 3, 0, 0, 3, 3, 5, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0, 3, 0, 9, 9],
  [9, 9, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9],
  [9, 9, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9],
  [9, 9, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 9, 9],
  [9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 9, 9],
  [9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 9, 9],
  [9, 9, 0, 0, 0, 3, 0, 3, 3, 3, 0, 0, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 9, 9],
  [9, 9, 0, 3, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 3, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 0, 9, 9],
  [9, 9, 0, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 3, 9, 9],
  [9, 9, 0, 0, 0, 0, 3, 0, 0, 4, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 0, 1, 0, 0, 0, 0, 9, 9],
  [9, 9, 0, 1, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 9, 9],
  [9, 9, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 9, 9],
  [9, 9, 0, 1, 0, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 3, 0, 0, 3, 0, 3, 0, 3, 0, 3, 3, 3, 3, 3, 0, 9, 9],
  [9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9],
  [9, 9, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9],
  [9, 9, 0, 0, 3, 0, 3, 0, 3, 0, 0, 3, 0, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 3, 3, 3, 3, 3, 3, 0, 9, 9],
  [9, 9, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9],
  [9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9],
  [9, 9, 0, 3, 0, 0, 3, 3, 0, 3, 3, 3, 3, 3, 3, 3, 0, 0, 3, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0, 9, 9],
  [9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 9, 9],
  [9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 9, 9],
  [9, 9, 0, 3, 0, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 9, 9],
  [9, 9, 9, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 3, 0, 9, 9],
  [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
  [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]
];

function addBlock() {
  const forward = new Vector3();
  forward.set(camera.at);
  forward.sub(camera.eye);
  forward.normalize();

  let blockX = -1 * Math.round(camera.eye.elements[0] + forward.elements[0] -13); 
  let blockZ = -1 * Math.round((camera.eye.elements[2]) + forward.elements[2] -12);

  currentBlockType = 1;
  // Ensure the position is within the map bounds
  if (blockX >= 0 && blockX < 32 && blockZ >= 0 && blockZ < 32) {
    if (map[blockX][blockZ] === 0) { // If no block exists, add one
      //modded = true;
      map[blockX][blockZ] = currentBlockType;
      //rotate through blocktypes maybe
      if (currentBlockType < 4) {
        currentBlockType += 1;
      }
      else {
        currentBlockType = 1;
      }
    }
  }
      /*
  
    
  }
  if (modded) {
    renderBlocks();
  }*/
}


function deleteBlock() {

  const forward = new Vector3();
  forward.set(camera.at);
  forward.sub(camera.eye);
  forward.normalize();

  let blockX = -1 * Math.round(camera.eye.elements[0] + forward.elements[0] -13); 
  let blockZ = -1 * Math.round((camera.eye.elements[2]) + forward.elements[2] -12);

  currentBlockType = 1;
  // Ensure the position is within the map bounds
  if (blockX >= 0 && blockX < 32 && blockZ >= 0 && blockZ < 32) {
    if (map[blockX][blockZ] != 0) {
      if (map[blockX][blockZ] === 1) {
        diamonds_mined += 1;
      }
      map[blockX][blockZ] = 0;
    }
  }
}   


/* method of debugging the map visually.
let outputString = '';

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 0) {
            outputString += '+';
        } else if (map[row][col] === 1) {
            outputString += 'g';
        }
        //wall
        else if (map[row][col] == 9) {
          outputString += 'w';
        } else {
            outputString += '|';
        }
    }
    outputString += '\n';  // Add newline at the end of each row
}

*/

function renderBlocks() {
    for (var x = 0; x < 32; x++) {
        for (var y = 0; y < 32; y++) {
            if (map[x][y] != 0){
                for (var i = 0; i < map[x][y]; i++) {
                    var blocks = new Cube();
                    if(map[x][y] === 9){
                        blocks.textureNum = 3;
                    } else if (map[x][y] === 1){
                        blocks.textureNum = 4;
                    } else{
                        blocks.textureNum = 2;
                    }
                    blocks.matrix.translate(0, -0.8, 0);
                    blocks.matrix.translate(x-14, i, y-12);
                    blocks.render();
                }
            }
        }
    }
}
