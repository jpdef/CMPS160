
var canvas;
var gl;

var points = [];
var colors = [];

var CB = [];
var CBC = [];

//Angle Variables
// around x
var theta =0.0;
var thetaLoc;

//around y
var phi = 0.0;
var phiLoc;

//around z
var gamma = 0.0;
var gammaLoc;

var dx=0.0;
var dy=0.0;
var dz=0.0;

var dxLoc;
var dyLoc;
var dzLoc;

var NumTimesToSubdivide = 6;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the vertices of our 3D gasket
    // Four vertices on unit circle
    // Intial tetrahedron with equal length sides
    
    var vertices = [
        vec3(  0.0000,  0.0000, -1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
    ];
    
    divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);

    //intialize checker board
    var i = 0;
    for (var z = 100.0; z > -100.0; z -= 5.0) {
        for (var x = -100.0; x < 100.0; x += 5.0) {
            if (i % 2) {
                for(j = 0 ; j< 6 ; ++j ){ CBC.push(vec3(0.0, 0.0, 0.0));} 

            }else{

                for(j = 0 ; j< 6 ; ++j ){ CBC.push(vec3(1.0, 1.0, 1.0));}
            }
            for(j = 0 ; j< 6 ; ++j ){CB.push(vec3(x/100.0,0,z/100.0));}
            ++i;
        }
    ++i;
}


    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    // enable hidden-surface removal
    
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    thetaLoc = gl.getUniformLocation(program, "theta");
    phiLoc   = gl.getUniformLocation(program, "phi");
    gammaLoc = gl.getUniformLocation(program, "gamma");

    dxLoc = gl.getUniformLocation(program, "dx");
    dyLoc = gl.getUniformLocation(program, "dy");
    dzLoc = gl.getUniformLocation(program, "dz");
    
    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var CB_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,CB_buffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(CB),gl.STATIC_DRAW);


    window.onkeydown = function(event){
          switch(event.keyCode){
              case 65:
                phi -= 0.5;
                break;
              case 68:
                phi +=0.5;
                break;
            case 69:
                theta -= 0.5;
                break;
            case 81:
                theta +=0.5;
                break;
            case 87:
                gamma -= 0.5;
                break;
            case 83:
                gamma +=0.5;
                break;
            case 74:
                dx -= 0.1;
                break;
            case 76:
                dx +=0.1;
                break;
            case 73:
                dy -= 0.1;
                break;
            case 75:
                dy +=0.1;
                break;
            case 85:
                dz -= 0.1;
                break;
            case 79:
                dz +=0.1;
                break;

          }
    }

    document.getElementById("slider").onchange = function(event) {
         points.splice(0,points.length);
         divideTetra( vertices[0], vertices[1], vertices[2],vertices[3],
         event.target.value);
         gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
         gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);
    };

    render();
};

function triangle( a, b, c, color )
{

    // add colors and vertices for one triangle

    var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 0.0)
    ];

    colors.push( baseColors[color] );
    points.push( a );
    colors.push( baseColors[color] );
    points.push( b );
    colors.push( baseColors[color] );
    points.push( c );
}

function tetra( a, b, c, d )
{
    // tetrahedron with each side using
    // a different color
    
    triangle( a, c, b, 0 );
    triangle( a, c, d, 1 );
    triangle( a, b, d, 2 );
    triangle( b, c, d, 3 );
}

function divideTetra( a, b, c, d, count )
{
    // check for end of recursion
    
    if ( count === 0 ) {
        tetra( a, b, c, d );
    }
    
    // find midpoints of sides
    // divide four smaller tetrahedra
    
    else {
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var ad = mix( a, d, 0.5 );
        var bc = mix( b, c, 0.5 );
        var bd = mix( b, d, 0.5 );
        var cd = mix( c, d, 0.5 );

        --count;
        
        divideTetra(  a, ab, ac, ad, count );
        divideTetra( ab,  b, bc, bd, count );
        divideTetra( ac, bc,  c, cd, count );
        divideTetra( ad, bd, cd,  d, count );
    }
}


function render()
{
    //phi += 0.2
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(thetaLoc,theta);
    gl.uniform1f(phiLoc,phi);
    gl.uniform1f(gammaLoc,gamma);

    gl.uniform1f(dxLoc,dx);
    gl.uniform1f(dyLoc,dy);
    gl.uniform1f(dzLoc,dz);

    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    requestAnimFrame(render);
    
}
