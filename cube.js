class Cube {
    constructor() {
        this.type = 'Cube';
        this.color = [0.0, 0.0, 0.0, 0.0];
        this.matrix = new Matrix4();
        this.coords = [
            0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0,
            0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0,
            1.0, 0.0, 1.0,   1.0, 1.0, 1.0,   0.0, 1.0, 1.0,
            1.0, 0.0, 1.0,   0.0, 1.0, 1.0,   0.0, 0.0, 1.0,
            1.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 1.0,
            1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0,
            0.0, 0.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 0.0,
            0.0, 0.0, 1.0,   0.0, 1.0, 0.0,   0.0, 0.0, 0.0,
            1.0, 0.0, 0.0,   1.0, 0.0, 1.0,   0.0, 0.0, 1.0,
            1.0, 0.0, 0.0,   0.0, 0.0, 1.0,   0.0, 0.0, 0.0,
            0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0,
            0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0
        ]; 
        this.uvcoords = [
            1,0, 0,1, 0,0,
            1,0, 1,1, 0,1,
            1,0, 1,1, 0,1,
            1,0, 0,1, 0,0,
            1,0, 1,1, 0,1,
            1,0, 0,1, 0,0,
            1,0, 1,1, 0,1,
            1,0, 0,1, 0,0,
            1,0, 1,1, 0,1,
            1,0, 0,1, 0,0,
            1,0, 1,1, 0,1,
            1,0, 0,1, 0,0
        ];
    }

    render() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        if (g_vertexBuffer == null) {
            initTriangle();
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.coords), gl.DYNAMIC_DRAW);
        if (g_uvBuffer == null) {
            initUV();
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvcoords), gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 30);
    }
}
