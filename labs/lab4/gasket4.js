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

//Local Rotation variables
var angle_x = 0.0;
var angle_y = 0.0;
var angle_z = 0.0;
var axLoc,ayLoc,azLoc;


//Camera Rotation Variable
var theta =0.0;
var phi = 0.0;
var gamma = 0.0;
var thetaLoc,phiLoc,gammaLoc;

//Camera Initial Position
var cx = 0.0;
var cy = 0.0;
var cz = -5.0;


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

//fun
var rotator_bool = false;
var t_bool = true;
var last_mouse_x;
var last_mouse_y;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    //define location of mouse functions
    document.onmousedown = handleMouseDown;
    document.onmousemove = handleMouseMove;
    
    //define aspect
    aspect = canvas.width/canvas.height;
    
    

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
    
    //Intializes plane
    terrain();
    // make_plane(1.0,1.0,1.0);




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
    

    //Model position and rotation variables
    axLoc = gl.getUniformLocation(program, "ax");
    ayLoc = gl.getUniformLocation(program, "ay");
    azLoc = gl.getUniformLocation(program, "az");

    dxLoc = gl.getUniformLocation(program, "dx");
    dyLoc = gl.getUniformLocation(program, "dy");
    dzLoc = gl.getUniformLocation(program, "dz");
    
    
    //Projection rotation variables
    thetaLoc = gl.getUniformLocation(program, "theta");
    phiLoc   = gl.getUniformLocation(program, "phi");
    gammaLoc = gl.getUniformLocation(program, "gamma");


    //Total matrix model and perspective
    pMLoc = gl.getUniformLocation( program, "projectionMatrix" );
    mMLoc = gl.getUniformLocation( program, "modelViewMatrix" );

    //Color Gasket  Buffer 
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
   
    vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    //Vertex Gasket  Buffer
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    //Checkboard Vertex Buffer
    CB_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,CB_buffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(CB),gl.STATIC_DRAW);

    //Checkboard Color Buffer
    CBC_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,CBC_buffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(CBC),gl.STATIC_DRAW);




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
                dy += 0.1;
                break;
              case 75:
                dy -=0.1;
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

    //Camera Movement Buttons
    document.getElementById("Button1").onclick = function(){cx += 0.5};
    document.getElementById("Button2").onclick = function(){cx -=0.5};
    document.getElementById("Button3").onclick = function(){cy += 0.5};
    document.getElementById("Button4").onclick = function(){cy -=0.5};
    document.getElementById("Button5").onclick = function(){cz += 0.5};
    document.getElementById("Button6").onclick = function(){cz -=0.5};

    //Camera Rotation Buttons
    document.getElementById("Button7").onclick = function(){theta += 0.1;};
    document.getElementById("Button8").onclick = function(){theta -= 0.1;};
    document.getElementById("Button9").onclick = function(){phi -= 0.1;};
    document.getElementById("Button10").onclick = function(){phi += 0.1;};
    document.getElementById("Button11").onclick = function(){gamma -= 0.1;};
    document.getElementById("Button12").onclick = function(){gamma += 0.1;};

    //Camera FOV Buttons
    document.getElementById("Button13").onclick = function(){fov += 2.0;};
    document.getElementById("Button14").onclick = function(){fov -= 2.0;};

    //Reset 
    document.getElementById("Button15").onclick = function(){
        gamma = 0.0;phi=0.0;theta=0.0;
        cx = 0.0; cy =0.0; cz =-5.0;
        dx = 0.0; dy =0.0; dz =0.0;
        fov = 45;
    };

    function handleMouseDown(event){
       if(event.shiftKey){
         CB.splice(0,CB.length);
         terrain();
         t_bool = false;
         return;
       }
       if(rotator_bool){
          rotator_bool=false;
       }else{
          rotator_bool =true;
          last_mouse_x = -1+ 2*event.clientX/canvas.width;
          last_mouse_y = -1+2*(canvas.height-event.clientY)/canvas.height;
       }

     }   



    function handleMouseMove(event){
       var mx =-1 + 2*event.clientX/canvas.width;
       var my =-1 +2*(canvas.height-event.clientY)/canvas.height;
       if(rotator_bool){
          angle_y += Math.atan2((mx-last_mouse_x),Math.sqrt(dz*dz + dy*dy))/100.0;
          angle_x  += Math.atan2((my-last_mouse_y),Math.sqrt(dz*dz + dx*dx))/100.0;
          last_mouse_x =mx;
          last_mouse_y =my;
       }
     } 


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


//Makes terrain in background
function terrain(){

  gl.bindBuffer(gl.ARRAY_BUFFER,CB_buffer);
  for (var z = 0; z <25.6; z += 0.1) {
      for (var x = 0; x < 25.6; x += 0.1) {
          CB.push(vec3((x-12.8),altitude(x*10,z*10)-1.0,(z-12.8)));
          CBC.push(vec3(0.0,0.0,0.0));
     }
  }

  for (var x = 0; x < 25.6; x += 0.1) {
      for (var z =0; z < 25.6; z += 0.1) {
         CB.push(vec3((x-12.8),altitude(x*10,z*10)-1.0,z-12.8));
         CBC.push(vec3(0.0,0.0,0.0));
     }
  }

}

//Make checkerboard terrain
function make_plane(x,y,z){
    
    gl.bindBuffer(gl.ARRAY_BUFFER,CB_buffer);
    var i = 0;
    for (var z = 100; z > -100; z -= 1.0) {
        for (var x = -100; x < 100; x += 1.0) {
            if (i % 2) {
                for(j = 0 ; j< 6 ; ++j ){ CBC.push(vec3(0.0, 0.0, 0.0));} 

            }else{

                for(j = 0 ; j< 6 ; ++j ){ CBC.push(vec3(1.0,1.0,1.0));}
            }
            CB.push(vec3(x,-1.0,z));
            CB.push(vec3(x,-1.0,z+1.0));
            CB.push(vec3(x+1.0,-1.0,z));

            CB.push(vec3(x,-1.0,z+1.0));
            CB.push(vec3(x+1.0,-1.0,z+1.0));
            CB.push(vec3(x+1.0,-1.0,z));

            ++i;
        }
    ++i;
    }

}

//Returns altitude for mountain terrian
function altitude(x,z){
   return rawData[Math.floor(x)+Math.floor(256*z)]/max;
}


//Renders checkerboard
function draw_plane(){
    gl.bindBuffer(gl.ARRAY_BUFFER,CB_buffer);
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    set_uniform_plane();
    gl.bindBuffer(gl.ARRAY_BUFFER,CBC_buffer);
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLES, 0, CB.length );
}

//Renders Island
function draw_terrain(){
    gl.bindBuffer(gl.ARRAY_BUFFER,CB_buffer);
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    set_uniform_plane();
    gl.bindBuffer(gl.ARRAY_BUFFER,CBC_buffer);
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.LINE_STRIP, 0, CB.length );
}

//Renders Gasket
function draw_tetra(){
    gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    set_uniform_tetra();
    gl.bindBuffer(gl.ARRAY_BUFFER,cBuffer);
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

//Sets angles for 
function set_uniform_tetra(){
    gl.uniform1f(thetaLoc,theta);
    gl.uniform1f(phiLoc,phi);
    gl.uniform1f(gammaLoc,gamma);
    gl.uniform1f(dxLoc,dx);
    gl.uniform1f(dyLoc,dy);
    gl.uniform1f(dzLoc,dz);
}

function set_uniform_plane(){
    gl.uniform1f(thetaLoc,0.1);
    gl.uniform1f(phiLoc,0.0);
    gl.uniform1f(gammaLoc,0.0);
    gl.uniform1f(dxLoc,0.0);
    gl.uniform1f(dyLoc,0.0);
    gl.uniform1f(dzLoc,0.0);

}

function set_uniform_camera(){
  pM = perspective( fov, aspect, near, far )
  mM = translate(cx,cy,cz);
  gl.uniform1f(axLoc, angle_x);
  gl.uniform1f(ayLoc, angle_y);
  gl.uniform1f(azLoc, angle_z);
  gl.uniformMatrix4fv(pMLoc,false,flatten(pM));
  gl.uniformMatrix4fv(mMLoc,false, flatten(mM));

}



function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    set_uniform_camera();
    if(t_bool){
      draw_plane();
    }else{
      draw_terrain(); 
    }
    draw_tetra();
    requestAnimFrame(render);
    
}
