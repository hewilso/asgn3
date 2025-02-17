class Triangle {
    constructor() {
        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }
    
    render() {
        var xy = this.position;
        var rgba = this.color;
        
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
       
        var d = this.size/200.0;
        drawTriangle([xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d]);
    }
}

function drawTriangle(vertices) {
    var n = 3; 
    
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawCube(vertices, buffer) {
  var vertexBuffer;
  if (!buffer) {
    vertexBuffer = gl.createBuffer();
    console.log("creating buffer");
  } else {
    vertexBuffer = buffer;
  }

  if (!vertexBuffer) {
      console.log('Failed to create/load the buffer object');
      return -1;
  }

  var n = 3; 
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  
 
  gl.enableVertexAttribArray(a_Position);
  
  
  gl.drawArrays(gl.TRIANGLES, 0, n);
}


var g_vertexBuffer = null;
var g_uvBuffer = null;
function initTriangle() {
  g_vertexBuffer = gl.createBuffer();
  if (!g_vertexBuffer) {
    console.log('Failed to create/load the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(a_Position);
}

function initUV() {
  g_uvBuffer = gl.createBuffer();
  if (!g_uvBuffer) {
    console.log('Failed to create/load the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);

  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(a_UV);
}
