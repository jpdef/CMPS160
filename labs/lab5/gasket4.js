//Global Setups
var canvas;
var gl;


//Buffers
var points = [];
var colors = [];
var normals= [];

var CB = [];
var CBC = [];
var CBN=[];

var  CB_buffer,  CBC_buffer, CBN_buffer;
var vBuffer, cBuffer, nBuffer;
var vPosition, vColor, vNormal;

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
var cz = -5;


//Translation Variables
var dx=0.0;
var dy=0.0;
var dz=0.0;
var dxLoc, dyLoc, dzLoc;

//Subdivisions
var numTimesToSubdivide = 4;
var index = 0;

//Intial DeFinition of Sphere
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

//
//Lighting Variables
//


//Color of Light and Position    
var lightPosition = vec4(3.0, 0.5, 3.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var lx = 0.0;
var ly = 0.0;
var lz = 0.0;

var lxLoc, lyLoc, lzLoc;
var specularLoc,ambientLoc,diffuseLoc;

//Color of Sphere
var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 0.0, 0.4, 0.3, 1.0 );
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

//Color of plane
var plane_materialAmbient = vec4( 0.2, 0.2, 0.0, 1.0 );
var plane_materialDiffuse = vec4( 0.8, 0.0, 1.0, 1.0 );
var plane_materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var plane_materialShininess = 100.0;
var num_board= 10;
var incr_board = 0.1;
var ctm;

//Color result of light and material
var ambientColor, diffuseColor, specularColor;


//Camera Variables
var pM, mM;
var pMLoc, mMLoc;

var fov = 45;
var far = 1000;
var near = 1;
var aspect;

//fun
var rotator_bool = false;
var last_mouse_x;
var last_mouse_y;
var bm_bool = true;
var perin = 1.0;
var shade = 1.0;
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
    
    //noise4()   
    //Intializes sphere
    tetrahedron(va,vb,vc,vd,numTimesToSubdivide);    
 
    //Intializes plane
     make_plane(1.0,1.0,1.0);

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);


    plane_ambientProduct = mult(lightAmbient,plane_materialAmbient);
    plane_diffuseProduct = mult(lightDiffuse, plane_materialDiffuse);
    plane_specularProduct = mult(lightSpecular, plane_materialSpecular);

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

   //Lighting Aspects   
    ambientLoc = gl.getUniformLocation(program,"ambientProduct");
    diffuseLoc = gl.getUniformLocation(program,"diffuseProduct");
    specularLoc = gl.getUniformLocation(program,"specularProduct");

   lxLoc = gl.getUniformLocation(program,"lx");
   lyLoc = gl.getUniformLocation(program,"ly");
   lzLoc = gl.getUniformLocation(program,"lz");

   perinLoc = gl.getUniformLocation(program,"perin");
   shadeLoc = gl.getUniformLocation(program,"shade"); 

   gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),materialShininess );    


    //Sphere color buffer 
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
   
    vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    //Sphere vertex buffer
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    //Sphere normal buffer
    nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);


    //Checkboard Vertex Buffer
    CB_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,CB_buffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(CB),gl.STATIC_DRAW);

    CBN_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,CBN_buffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(CBN),gl.STATIC_DRAW);

    //Checkboard Color Buffer
    CBC_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,CBC_buffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(CBC),gl.STATIC_DRAW);



    window.onkeydown = function(event){
          //defined in keyboard.js 
          keys(event.keyCode);
    }


    //Camera Movement Buttons
    document.getElementById("Button1").onclick = function(){cx += 0.5};
    document.getElementById("Button2").onclick = function(){cx -=0.5};
    document.getElementById("Button3").onclick = function(){cy += 0.5};
    document.getElementById("Button4").onclick = function(){cy -=0.5};
    document.getElementById("Button5").onclick = function(){cz += 0.5};
    document.getElementById("Button6").onclick = function(){cz -=0.5};

    //Camera Rotation Buttons
    document.getElementById("Button7").onclick = function(){angle_z += 0.1;};
    document.getElementById("Button8").onclick = function(){angle_z -= 0.1;};

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

    document.getElementById("Button16").onclick = function(){
    //bump map or not
      if(bm_bool){
          bm_bool = false;
          CB =[]; CBN = [] ; CBC = [];
          make_bump(1.0,1.0,1.0);
          gl.bindBuffer(gl.ARRAY_BUFFER,CB_buffer);
          gl.bufferData(gl.ARRAY_BUFFER,flatten(CB),gl.STATIC_DRAW);

          gl.bindBuffer(gl.ARRAY_BUFFER,CBN_buffer);
          gl.bufferData(gl.ARRAY_BUFFER,flatten(CBN),gl.STATIC_DRAW);

          gl.bindBuffer(gl.ARRAY_BUFFER,CBC_buffer);
          gl.bufferData(gl.ARRAY_BUFFER,flatten(CBC),gl.STATIC_DRAW);

       }else{
          bm_bool = true;
          CB =[]; CBN = [] ; CBC = [];
          make_plane(1.0,1.0,1.0);
          gl.bindBuffer(gl.ARRAY_BUFFER,CB_buffer);
          gl.bufferData(gl.ARRAY_BUFFER,flatten(CB),gl.STATIC_DRAW);

          gl.bindBuffer(gl.ARRAY_BUFFER,CBN_buffer);
          gl.bufferData(gl.ARRAY_BUFFER,flatten(CBN),gl.STATIC_DRAW);

          gl.bindBuffer(gl.ARRAY_BUFFER,CBC_buffer);
          gl.bufferData(gl.ARRAY_BUFFER,flatten(CBC),gl.STATIC_DRAW);
      }  
    };
    
    document.getElementById("Button17").onclick = function(){
          if(perin == 0.0){
             //console.log("perin on ");
             perin = 1.0;
          }else{
            // console.log("perin off");
             perin = 0.0;
          }

    }

    document.getElementById("Button18").onclick = function(){
          if(shade == 0.0){
             //console.log("shade on ");
             shade= 1.0;
          }else{
             //console.log("shade off ");
             shade = 0.0;
          }

    }

    function handleMouseDown(event){
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




// Sphere Constuctors
// triangle(), divide_triangle() tetrahedron()
function triangle(a, b, c) {

     normals.push(a);
     normals.push(b);
     normals.push(c);


     colors.push(0.0,0.0,0.0);
     colors.push(0.0,0.0,0.0);
     colors.push(0.0,0.0,0.0);
     points.push(a);
     points.push(b);
     points.push(c);

     index += 3;
}



function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

//Make checkerboard terrain
function make_plane(x,y,z){
    
    var i = 0;
    for (var z = num_board; z > -num_board; z -= 1) {
        for (var x = -num_board; x < num_board; x += 1) {
            if (i % 2) {
                for(j = 0 ; j< 6 ; ++j ){ CBC.push(vec3(1.0, 1.0, 1.0));} 

            }else{

                for(j = 0 ; j< 6 ; ++j ){ CBC.push(vec3(0.0,0.0,0.0));}
            }
            CB.push(vec4(x,-1.0,z,1.0));
            CB.push(vec4(x,-1.0,z+1.0,1.0));
            CB.push(vec4(x+1.0,-1.0,z,1.0));

            CB.push(vec4(x,-1.0,z+1.0,1.0));
            CB.push(vec4(x+1.0,-1.0,z+1.0,1.0));
            CB.push(vec4(x+1.0,-1.0,z,1.0));


            CBN.push(normalize(vec4(0.0,1.0,0.0,1.0)));
            CBN.push(normalize(vec4(0.0,1.0,0.0,1.0)));
            CBN.push(normalize(vec4(0.0,1.0,0.0,1.0)));

            CBN.push(normalize(vec4(0.0,1.0,0.0,1.0)));
            CBN.push(normalize(vec4(0.0,1.0,0.0,1.0)));
            CBN.push(normalize(vec4(0.0,1.0,0.0,1.0)));





            ++i;
        }
    ++i;
    }

}



function make_bump(x,y,z){
    
    var i = 0;
    for (var z = num_board; z > -num_board; z -= incr_board) {
        for (var x = -num_board; x < num_board; x += incr_board) {
            if (i % 2) {
                for(j = 0 ; j< 6 ; ++j ){ CBC.push(vec3(0.0, 0.0, 1.0));} 

            }else{

                for(j = 0 ; j< 6 ; ++j ){ CBC.push(vec3(0.0,0.0,1.0));}
            }
            CB.push(vec4(x,-1.0,z,1.0));
            CB.push(vec4(x,-1.0,z+1.0,1.0));
            CB.push(vec4(x+1.0,-1.0,z,1.0));

            CB.push(vec4(x,-1.0,z+1.0,1.0));
            CB.push(vec4(x+1.0,-1.0,z+1.0,1.0));
            CB.push(vec4(x+1.0,-1.0,z,1.0));

            CBN.push(normalize(vec4(x,x,z,1.0)));
            CBN.push(normalize(vec4(x,z,z+1.0,1.0)));
            CBN.push(normalize(vec4(x+1.0,x,z,1.0)));

            CBN.push(normalize(vec4(x,-1.0,z,1.0)));
            CBN.push(normalize(vec4(x+1.0,x,z+1.0,1.0)));
            CBN.push(normalize(vec4(x+1.0,z,z,1.0)));


            ++i;
        }
    ++i;
    }

}



//Renders checkerboard
function draw_plane(){
    set_uniform_plane();
    gl.bindBuffer(gl.ARRAY_BUFFER,CB_buffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    
    gl.bindBuffer(gl.ARRAY_BUFFER,CBN_buffer);
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT,false,0,0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER,CBC_buffer);
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLES, 0, CB.length );
}


//Renders Sphere
function draw_tetra(){
    set_uniform_tetra();


    gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    
    gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    
    gl.bindBuffer(gl.ARRAY_BUFFER,cBuffer);
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    
    for(var i=0; i<index; i+=3){
      gl.drawArrays( gl.TRIANGLES, i, 3 );
    }
}

//Sets angles for 
function set_uniform_tetra(){
    gl.uniform1f(thetaLoc,theta);
    gl.uniform1f(phiLoc,phi);
    gl.uniform1f(gammaLoc,gamma);
    gl.uniform1f(dxLoc,dx);
    gl.uniform1f(dyLoc,dy);
    gl.uniform1f(dzLoc,dz);
    gl.uniform4fv( ambientLoc,flatten(ambientProduct) );
    gl.uniform4fv( diffuseLoc,flatten(diffuseProduct) );
    gl.uniform4fv( specularLoc,flatten(specularProduct) );
}

function set_uniform_plane(){
    gl.uniform1f(thetaLoc,0.1);
    gl.uniform1f(phiLoc,0.0);
    gl.uniform1f(gammaLoc,0.0);
    gl.uniform1f(dxLoc,0.0);
    gl.uniform1f(dyLoc,0.0);
    gl.uniform1f(dzLoc,0.0);
    gl.uniform4fv( ambientLoc,flatten(plane_ambientProduct) );
    gl.uniform4fv( diffuseLoc,flatten(plane_diffuseProduct) );
    gl.uniform4fv( specularLoc,flatten(plane_specularProduct) );

}

function set_uniform_camera(){
  pM = perspective( fov, aspect, near, far )
  mM = translate(cx,cy,cz);
  gl.uniform1f(perinLoc, perin);
  gl.uniform1f(shadeLoc, shade);
  gl.uniform1f(axLoc, angle_x);
  gl.uniform1f(ayLoc, angle_y);
  gl.uniform1f(azLoc, angle_z);
  gl.uniform1f(lxLoc, lx);
  gl.uniform1f(lyLoc, ly);
  gl.uniform1f(lzLoc, lz);
  gl.uniformMatrix4fv(pMLoc,false,flatten(pM));
  gl.uniformMatrix4fv(mMLoc,false, flatten(mM));

}



function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    set_uniform_camera();
    draw_tetra();
    draw_plane(); 
    requestAnimFrame(render);
    
}






