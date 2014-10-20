
var canvas;
var gl;
var theta = 0.0;
var thetaLoc;
var delta = vec2(0.0,0.0);
var delta_Loc;
var velocity= vec2(0.0,0.0);
var points = [];
var mouseDown =false;
var lastMouseX = null;
var lastMouseY = null;
var time = 0.0;
var paint_buffer;
var paint_mode=false;
var vPosition;
var gasket_buffer
var painter = [];
var container = [
        vec2( -0.5, -0.5 ),
        vec2(  0,  0.2 ),
        vec2(  0.5, -0.5 )];

var vertices = [
        vec2( -0.5, -0.5 ),
        vec2(  0,  0.5 ),
        vec2(  0.5, -0.5 )
];
var NumTimesToSubdivide = 6;
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove; 
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
        
    //
    //  Initialize our data for the Sierpinski Gasket
    //


    // First, initialize the corners of our gasket with three points.
    

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
       

    thetaLoc = gl.getUniformLocation(program, "theta");
    delta_Loc = gl.getUniformLocation(program,"delta");

     vPosition = gl.getAttribLocation( program, "vPosition" );

    //Buttons
    document.getElementById("Rotate").onclick=
    function(){
        theta += 0.5;
        update_container();
    };
    
    document.getElementById("paint_mode").onclick=
     function(){
        paint_mode= true;
    };

    document.getElementById("stop_paint_mode").onclick=
     function(){
        paint_mode= false;
    };

    document.getElementById("stop_mode").onclick=
     function(){
        velocity[0]= 0.0;
        velocity[1]= 0.0;
    };

    //Slider
    document.getElementById("slider").onchange = function(event) {
        points.splice(0,points.length);
        divideTriangle( vertices[0], vertices[1], vertices[2],
                   event.target.value);
        gl.bindBuffer(gl.ARRAY_BUFFER,gasket_buffer);
        gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);

    };


    //keyboard
     window.onkeydown = function(event){
         switch(event.keyCode){
             case 39:
                theta -= 0.5;
                update_container();
                break;
             case 37:
                theta +=0.5;
                update_container();
                break;
     }


     };

     //Mouse
      function handleMouseDown(event){
      var mx =-1 + 2*event.clientX/canvas.width;
      var my =-1 +2*(canvas.height-event.clientY)/canvas.height;
      if(!paint_mode){
       if(in_container(mx,my+0.4)){
         mouseDown = true;
         console.log("hit");
         lastMouseX = mx; lastMouseY = my;
        }
       }else{
        draw_triangle(mx+.4,my+.4);
       }

      }
 
      function handleMouseUp(event){
       if(!paint_mode){
         mouseDown=false;
         var mx =-1 + 2*event.clientX/canvas.width;
         var my =-1 +2*(canvas.height-event.clientY)/canvas.height;
         velocity[0] = (mx - lastMouseX)/10000.0;
         velocity[1] = (my - lastMouseY)/10000.0;
         console.log(Math.abs(lastMouseX-mx),Math.abs(lastMouseY-my));        
         }
       }

      function handleMouseMove(event){
       if(!paint_mode){
        var newX =-1 + 2*event.clientX/canvas.width;
        var newY =-1 + 2*(canvas.height-event.clientY)/canvas.height;
        
        if(!mouseDown){
           return ;
         } 
         
         delta[0] += newX-lastMouseX;
         delta[1] += newY-lastMouseY;
         
         update_container();
         lastMouseX = newX;
         lastMouseY = newY;

       }
      }


    // Load the data into the GPU
    
    gasket_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,gasket_buffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
   
    paint_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,paint_buffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(painter), gl.STATIC_DRAW );


    
    //console.log(points);
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

function update_container()
{
    var s = Math.sin(theta);
    var c = Math.cos(theta);
    for(i=0;i<3;++i){

      if( Math.abs(container[i][0]) > 1){
          console.log("went outside boundary");
          console.log("x = " + container[i][0]);
          velocity[0]  = container[i][0] >1 ? -0.00001 : .00001;
      } 
      if(  Math.abs(container[i][1]) > 1){
          console.log("went outside boundary");
          console.log("y = " + container[i][1]);
          velocity[1]  = container[i][1] >1 ? -0.00001 : .00001;
      }
    }
     
    
    for(i=0;i<3;++i){

       container[i][0]= -s*vertices[i][1] + c*vertices[i][0] +delta[0];
       container[i][1]= s*vertices[i][0] + c*vertices[i][1] +delta[1];
    }
   //console.log(container[0][0] + " , " + container[0][1]);

}

function in_container(mx,my)
{
  var highest_x = container[0][0];
  var highest_y = container[0][1];
  var lowest_x  = container[0][0];
  var lowest_y  = container[0][1];
  
  for(i =1; i< 3 ; ++i){
      if(container[i][0] > highest_x){
        highest_x = container[i][0]
      }
      if(container[i][0] < lowest_x){
        lowest_x = container[i][0]
      }

  }


  for(i =1; i< 3 ; ++i){
      if(container[i][0] > highest_y){
        highest_y = container[i][0]
      }
      if(container[i][0] < lowest_y){
        lowest_y = container[i][0]
      }

  }
  
  console.log("Lowest = " + lowest_x + " , " + lowest_y );
  console.log("Highest = " + highest_x + " , " + highest_y );
  console.log("x,y = " + mx + " , " + my);  
  if( mx > lowest_x && mx < highest_x && my > lowest_y && my < highest_y){
      return true
  }
     return false;

}
function draw_triangle(mx,my){
    painter.push(vec2(mx-.1,my-.1));
    painter.push(vec2(mx,my+.1));
    painter.push(vec2(mx+.1,my-.1));
    gl.bindBuffer( gl.ARRAY_BUFFER, paint_buffer );
    gl.bufferData(gl.ARRAY_BUFFER,flatten(painter),gl.STATIC_DRAW);

    

}

function render()
{
    //update vertices
    time++;
    delta[0] += time*velocity[0];
    delta[1] += time*velocity[1];
    update_container();
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.uniform1f(thetaLoc,theta);
    gl.uniform2fv(delta_Loc,delta); 

    
    
    gl.enableVertexAttribArray( vPosition );
    gl.bindBuffer( gl.ARRAY_BUFFER, gasket_buffer );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.LINES, 0, points.length);
    
    gl.bindBuffer( gl.ARRAY_BUFFER, paint_buffer );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLES,0, painter.length);
    
   requestAnimFrame(render);
}

