
var canvas;
var gl;
var theta = 0.0;
var thetaLoc;
var points = [];

var NumTimesToSubdivide = 6;
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
        
    //
    //  Initialize our data for the Sierpinski Gasket
    //


    // First, initialize the corners of our gasket with three points.
    
    var vertices = [
        vec2( -0.95, -0.95 ),
        vec2(  0,  0.95 ),
        vec2(  0.95, -0.95 )
    ];

     divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //button 
    thetaLoc = gl.getUniformLocation(program, "theta");
    
    document.getElementById("Rotate").onclick=
    function(){
        theta += 0.5; 
    };

    //slider
    document.getElementById("slider").onchange = function(event) {
        points.splice(0,points.length);
        divideTriangle( vertices[0], vertices[1], vertices[2],
                   event.target.value);
        gl.bindBuffer(gl.ARRAY_BUFFER,bufferId);
        gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);

    };

   

    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    console.log(points);
    render();
};



function triangle( a, b, c )
{   
    points.push( a, b );
    points.push( b, c );
    points.push( c, a );

    
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion
    
    if ( count === 0 ) {
        triangle( a, b, c );
    }else {
    
        //bisect the sides
        
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

       //perturb
       
       var alpha = .02;
       var sign_num = Math.floor(Math.random()*2) ==1 ? 1 : -1;
        ab[0] += sign_num*alpha*Math.random();
        ab[1] += sign_num*alpha*Math.random();
        ac[0] += sign_num*alpha*Math.random();
        ac[1] += sign_num*alpha*Math.random();
        bc[0] += sign_num*alpha*Math.random();
        bc[1] += sign_num*alpha*Math.random();
                --count;

        // three new triangles
        
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.uniform1f(thetaLoc,theta);
    gl.drawArrays( gl.LINES, 0, points.length );
    requestAnimFrame(render);
}

