//Global Setups
var canvas;
var gl;


//Buffers
var points = [];
var colors = [];
var CB = [];
var CBC = [];

var  CB_buffer,  CBC_buffer;
var vBuffer, cBuffer;
var vPosition, vColor;

//Rotation variables
var angle_x =0.0;
var angle_y = 0.0;
var angle_z = 0.0;
var gammaLoc,phiLoc,thetaLoc;

//Translation Variables
var dx=0.0;
var dy=0.0;
var dz=0.0;
var dxLoc, dyLoc, dzLoc;

//Gasket Variables
var NumTimesToSubdivide = 6;


//Camera Variables
var pM, mM;
var pMLoc, mMLoc;


var fov = 45;
var far = 1000;
var near = .01;
var aspect;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    aspect = canvas.width/canvas.height;
    
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
    make_plane(1.0,1.0,1.0);




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

    pMLoc = gl.getUniformLocation( program, "projectionMatrix" );
    mMLoc = gl.getUniformLocation( program, "modelViewMatrix" );

    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader
    
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    CB_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,CB_buffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(CB),gl.STATIC_DRAW);

    CBC_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,CBC_buffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(CBC),gl.STATIC_DRAW);




    window.onkeydown = function(event){
          switch(event.keyCode){
              case 65:
                angle_y -= 0.5;
                break;
              case 68:
                angle_y +=0.5;
                break;
            case 69:
                angle_x -= 0.5;
                break;
            case 81:
                angle_x +=0.5;
                break;
            case 87:
                angle_z -= 0.5;
                break;
            case 83:
                angle_z +=0.5;
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

    document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1;};
    document.getElementById("Button2").onclick = function(){near *= 0.9; far *= 0.9;};
    document.getElementById("Button3").onclick = function(){fov += 2.0;};
    document.getElementById("Button3").onclick = function(){fov += 2.0;};


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

function make_plane(x,y,z){


    
    gl.bindBuffer(gl.ARRAY_BUFFER,CB_buffer);

    var i = 0;
    for (var z = 100; z > -100; z -= 1.0) {
        for (var x = -100; x < 100; x += 1.0) {
            if (i % 2) {
                for(j = 0 ; j< 6 ; ++j ){ CBC.push(vec3(0.0, 0.0, 0.0));} 

            }else{

                for(j = 0 ; j< 4 ; ++j ){ CBC.push(vec3(1.0, 1.0, 1.0));}
            }
            CB.push(vec3(x,-1.2,z));
            CB.push(vec3(x,-1.0,z+1.0));
            CB.push(vec3(x+1.0,-1.2,z));
            CB.push(vec3(x+1.0,-1.0,z+1.0));

            ++i;
        }
    ++i;
    }
    console.log(CB);
    

}


function draw_plane(){
   gl.bindBuffer(gl.ARRAY_BUFFER,CB_buffer);
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    set_uniform_plane();
    gl.bindBuffer(gl.ARRAY_BUFFER,CBC_buffer);
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, CB.length );


}

function draw_tetra(){
    gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    set_uniform_tetra();
    gl.bindBuffer(gl.ARRAY_BUFFER,cBuffer);
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

function set_uniform_tetra(){
    gl.uniform1f(thetaLoc,angle_x);
    gl.uniform1f(phiLoc,angle_y);
    gl.uniform1f(gammaLoc,angle_z);
    gl.uniform1f(dxLoc,dx);
    gl.uniform1f(dyLoc,dy);
    gl.uniform1f(dzLoc,dz);
}

function set_uniform_plane(){
    gl.uniform1f(thetaLoc,.1);
    gl.uniform1f(phiLoc,0.0);
    gl.uniform1f(gammaLoc,0.0);
    gl.uniform1f(dxLoc,0.0);
    gl.uniform1f(dyLoc,0.0);
    gl.uniform1f(dzLoc,0.0);

}

function set_uniform_camera(){
  pM = perspective( fov, aspect, near, far )
  mM = translate(0.0,0.0,-5);
  gl.uniformMatrix4fv(pMLoc, false, flatten(pM));
  gl.uniformMatrix4fv(mMLoc,false, flatten(mM));

}


function render()
{
    //phi += 0.2
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    set_uniform_camera();
    draw_plane();
    draw_tetra();
    
   



  

    requestAnimFrame(render);
    
}
