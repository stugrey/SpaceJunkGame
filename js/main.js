debug = false;

openNav();
document.getElementById("reset").style.visibility="hidden";

// Data Variables

var cleaner_positionArray, cleaner_velocityArray, cleaner_objectArray;
var velocity = [];
var pointLight;

var rotationamount = 0;
var camheight = 0;
var x = 0.0;
var z = 0.0;
var number_of_debris = 60;

// Game Variables

var game_state = "paused";
var level_state = 0;
var game_total_score = 0;
var game_level_score = 0;
var LEO_debris_generation_rate = 1;
var MEO_debris_generation_rate = 1;
var GEO_debris_generation_rate = 1;

var total_cleaned = 0;

var overlay_state = "open";
var game_debris_decay_rate = 0.000;


// Three JS Variables

// set the scene size
WIDTH = window.innerWidth,
HEIGHT = window.innerHeight;
var VIEW_ANGLE = 45,
ASPECT = WIDTH / (HEIGHT),
NEAR = 0.1,
FAR = 100000;
var mouse = new THREE.Vector2(), INTERSECTED;
raycaster = new THREE.Raycaster();

// create a WebGL renderer, camera
// and a scene
var renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );
var camera = new THREE.PerspectiveCamera(  VIEW_ANGLE,
ASPECT,
NEAR,
FAR  );
var scene = new THREE.Scene();


pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position.x = 0.5;
pointLight.position.y = 0.5;
pointLight.position.z = 0.5;

var uniforms = {
	sunDirection: { type: "v3", value: new THREE.Vector3(0.0, 0.0, 0.0) }, // Not Used!
	viewDirection: { type: "v3", value: new THREE.Vector3(0.0, 0.0, 0.0) }, // Not Used!
	texture1: { type: "t", value: THREE.ImageUtils.loadTexture( "textures/earth1024.jpg" ) },
	texture2: { type: "t", value: THREE.ImageUtils.loadTexture( "textures/EarthNight1024.jpg" ) }, 
	spectexture: { type: "t", value: THREE.ImageUtils.loadTexture( "textures/EarthSpec.png" ) },
	cloudtexture: { type: "t", value: THREE.ImageUtils.loadTexture( "textures/clouds1024.jpg" ) }
};

var vertShader = document.getElementById('vertexShader').innerHTML;
var fragShader = document.getElementById('fragmentShader').innerHTML;

// create the sphere's material
var shaderMaterial = new THREE.ShaderMaterial({
	uniforms: uniforms,
	vertexShader:   vertShader,
	fragmentShader: fragShader
});

// set up the sphere vars
var radius = 50, segments = 64, rings = 64;

// create a new mesh with sphere geometry -
// we will cover the sphereMaterial next!
var earth = new THREE.Mesh(
new THREE.SphereGeometry(radius, segments, rings),
shaderMaterial);

// add to the scene
scene.add(pointLight);

// add the sphere to the scene
scene.add(earth);
scene.add(camera);

camera.position.x = 1000;
camera.position.y = 1000;
camera.position.z = 0;

camera.lookAt(earth.position);

bg_debris_objectArray = [];
bg_debris_positionArray = [];
bg_debris_velocityArray = [];
bg_debris_state_array = [];
bg_debris_destroyed_array = [];

var game_debris_objectArray = [];
var game_debris_positionArray = [];
var game_debris_velocityArray = [];
var game_debris_state_array = [];
var game_debris_destroyed_array = [];

var invisible_object_array = [];

var cleaner_objectArray = [];
var cleaner_positionArray = [];
var cleaner_velocityArray = [];
var cleaner_regime_array = [];
var cleaner_target_array = [];
var cleaner_state_array = [];

var scale = 1.0;
var acc_scale = 1;
var vel_scale = 1;

game_destroyed = 0;

leo_start_index = 0;
leo_end_index = 4000;

meo_start_index = 0;
meo_end_index = 1000;

geo_start_index = 0;
geo_end_index = 2000;

//Create Debris
var GM = 200;



leo_target = 0;
meo_target = 0;
geo_target = 0;

leo_colour = new THREE.Color( Math.random()*0.1 + 0.3 , Math.random()*0.1 + 0.6, Math.random()*0.1 + 0.3 );

// Background Debris
// Create LEO
for(var i=leo_start_index; i<leo_end_index; i++) {
	leo_axis = new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
	create_debris(120, bg_debris_positionArray, bg_debris_velocityArray, bg_debris_objectArray, bg_debris_state_array, bg_debris_destroyed_array, leo_colour, leo_axis );
}

// // Create MEO
for(var i=meo_start_index; i<meo_end_index; i++) {
	meo_axis = new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
	create_debris(240, bg_debris_positionArray, bg_debris_velocityArray, bg_debris_objectArray, bg_debris_state_array, bg_debris_destroyed_array, leo_colour, meo_axis );
}

// // Create GEO
for(var i=geo_start_index; i<geo_end_index; i++) {
	geo_axis = new THREE.Vector3(0,1,0).normalize();
	create_debris(400, bg_debris_positionArray, bg_debris_velocityArray, bg_debris_objectArray, bg_debris_state_array, bg_debris_destroyed_array, leo_colour, geo_axis );
}

scene.add( new THREE.AmbientLight( 0x444444 ) );

var triangles = leo_end_index + meo_end_index + geo_end_index;

var geometry = new THREE.BufferGeometry();

// break geometry into
// chunks of 21,845 triangles (3 unique vertices per triangle)
// for indices to fit into 16 bit integer number
// floor(2^16 / 3) = 21845

var chunkSize = 21845;

var indices = new Uint16Array( triangles * 3 );

for ( var i = 0; i < indices.length; i ++ ) {

	indices[ i ] = i % ( 3 * chunkSize );

}

positions = new Float32Array( triangles * 3 * 3 );
var normals = new Float32Array( triangles * 3 * 3 );
var colors = new Float32Array( triangles * 3 * 3 );

var color = new THREE.Color();

var n = 800, n2 = n/2;	// triangles spread in the cube
var d = 12, d2 = d/2;	// individual triangle size

var pA = new THREE.Vector3();
var pB = new THREE.Vector3();
var pC = new THREE.Vector3();

var cb = new THREE.Vector3();
var ab = new THREE.Vector3();

for ( var i = 0; i < positions.length; i += 9 ) {

	d = Math.random()*12+8;

	// velocity
	velocity.push(new THREE.Vector3( Math.random()-0.5, Math.random()-0.5 , Math.random()-0.5 ));

	// positions

	var x = bg_debris_positionArray[i/9].x;
	var y = bg_debris_positionArray[i/9].y;
	var z = bg_debris_positionArray[i/9].z;

	var ax = x + Math.random() * d - d2;
	var ay = y + Math.random() * d - d2;
	var az = z + Math.random() * d - d2;

	var bx = x + Math.random() * d - d2;
	var by = y + Math.random() * d - d2;
	var bz = z + Math.random() * d - d2;

	var cx = x + Math.random() * d - d2;
	var cy = y + Math.random() * d - d2;
	var cz = z + Math.random() * d - d2;

	positions[ i ]     = ax;
	positions[ i + 1 ] = ay;
	positions[ i + 2 ] = az;

	positions[ i + 3 ] = bx;
	positions[ i + 4 ] = by;
	positions[ i + 5 ] = bz;

	positions[ i + 6 ] = cx;
	positions[ i + 7 ] = cy;
	positions[ i + 8 ] = cz;

	// flat face normals

	pA.set( ax, ay, az );
	pB.set( bx, by, bz );
	pC.set( cx, cy, cz );

	cb.subVectors( pC, pB );
	ab.subVectors( pA, pB );
	cb.cross( ab );

	cb.normalize();

	var nx = cb.x;
	var ny = cb.y;
	var nz = cb.z;

	normals[ i ]     = nx;
	normals[ i + 1 ] = ny;
	normals[ i + 2 ] = nz;

	normals[ i + 3 ] = nx;
	normals[ i + 4 ] = ny;
	normals[ i + 5 ] = nz;

	normals[ i + 6 ] = nx;
	normals[ i + 7 ] = ny;
	normals[ i + 8 ] = nz;

	// colors

	grey = 0.4 + Math.random()/5

	var vx = grey;
	var vy = grey;
	var vz = grey;

	color.setRGB( vx, vy, vz );

	colors[ i ]     = color.r;
	colors[ i + 1 ] = color.g;
	colors[ i + 2 ] = color.b;

	colors[ i + 3 ] = color.r;
	colors[ i + 4 ] = color.g;
	colors[ i + 5 ] = color.b;

	colors[ i + 6 ] = color.r;
	colors[ i + 7 ] = color.g;
	colors[ i + 8 ] = color.b;

}

geometry.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );
geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

var offsets = triangles / chunkSize;

for ( var i = 0; i < offsets; i ++ ) {

	var offset = {
		start: i * chunkSize * 3,
		index: i * chunkSize * 3,
		count: Math.min( triangles - ( i * chunkSize ), chunkSize ) * 3
	};

	geometry.offsets.push( offset );

}

geometry.computeBoundingSphere();

var material = new THREE.MeshPhongMaterial( {
	color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
	vertexColors: THREE.VertexColors
} );

mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );


function render(){
renderer.render(scene, camera);


function render_debris(position_array, velocity_array, object_array, i)
{

	radius = position_array[i].length();

	acceleration = -GM / (radius*radius);

	acc_vector = position_array[i].clone();

	acc_vector.divideScalar(radius).multiplyScalar(acceleration);

	velocity_array[i].x = velocity_array[i].x + acc_vector.x/acc_scale;
	velocity_array[i].y = velocity_array[i].y + acc_vector.y/acc_scale;
	velocity_array[i].z = velocity_array[i].z + acc_vector.z/acc_scale;

	position_array[i].x = position_array[i].x + velocity_array[i].x/vel_scale;
	position_array[i].y = position_array[i].y + velocity_array[i].y/vel_scale;
	position_array[i].z = position_array[i].z + velocity_array[i].z/vel_scale;

	object_array[i].position.set(position_array[i].x*scale, position_array[i].y*scale, position_array[i].z*scale);

}


if ( game_state != "game_over")
{

// // Render LEO Debris
for(var i=leo_start_index; i<bg_debris_objectArray.length; i++) {
	if (bg_debris_destroyed_array[i] == 0){
		render_debris(bg_debris_positionArray, bg_debris_velocityArray, bg_debris_objectArray, i);
	}
}

// Render Game Debris
for(var i=0; i<game_debris_objectArray.length; i++) {
		
	if ( game_debris_state_array[i] < 2 ){
		game_debris_state_array[i] = game_debris_state_array[i] + game_debris_decay_rate;
	}

	if ( game_debris_state_array[i] < 1 ){
		game_debris_objectArray[i].children[0].material.color.setRGB( 1.0, 1-game_debris_state_array[i], 0 )
	}

	render_debris(game_debris_positionArray, game_debris_velocityArray, game_debris_objectArray, i);

	invisible_object_array[i].position.x = game_debris_positionArray[i].x;
	invisible_object_array[i].position.y = game_debris_positionArray[i].y;
	invisible_object_array[i].position.z = game_debris_positionArray[i].z;

	if ( game_debris_state_array[i] > 1 && game_debris_state_array[i] < 2 && game_debris_destroyed_array[i] != 1){
		create_collision_debris(
			game_debris_positionArray[i], 
			game_debris_velocityArray[i], 
			game_debris_positionArray, 
			game_debris_velocityArray, 
			game_debris_objectArray, 
			game_debris_state_array, 
			game_debris_destroyed_array, 
			game_colour, 
			leo_axis 
			);
		
		game_debris_state_array[i] = 2.5
	}
		
}

// Render LEO Cleaner
if ( cleaner_objectArray.length > 0){

	for(var i=0; i<cleaner_objectArray.length; i++) {
		if (cleaner_state_array[i] != -1){

			if (cleaner_regime_array[i] == 1){

				var target_vec = new THREE.Vector3();
				target_vec.subVectors(game_debris_positionArray[cleaner_target_array[i]], cleaner_positionArray[i]);
				target_distance = target_vec.length();
				target_dir = target_vec.normalize();

				// cleaner_objectArray[i].lookAt(game_debris_positionArray[cleaner_target_array[i]]);
				// cleaner_objectArray[i].up = new THREE.Vector3(0,0,1);

				if (target_distance > 12.0)
				{
					cleaner_positionArray[i].x = cleaner_positionArray[i].x + target_vec.x*5;
					cleaner_positionArray[i].y = cleaner_positionArray[i].y + target_vec.y*5;
					cleaner_positionArray[i].z = cleaner_positionArray[i].z + target_vec.z*5;
					game_debris_destroyed_array[cleaner_target_array[i]] = 1;
				}
				else if (game_debris_state_array[cleaner_target_array[i]] < 1.0)
				{
					cleaner_positionArray[i] = game_debris_positionArray[cleaner_target_array[i]];
					cleaner_objectArray[i].children[0].material.color.b = 0.0;

					scale_factor = 1 - game_debris_state_array[cleaner_target_array[i]];

					cleaner_objectArray[i].children[0].scale.set(scale_factor,scale_factor,scale_factor);
					game_debris_objectArray[cleaner_target_array[i]].children[0].scale.set(scale_factor,scale_factor,scale_factor);

					game_debris_state_array[cleaner_target_array[i]] = game_debris_state_array[cleaner_target_array[i]] + 0.02;
					
				}
				else
				{
					cleaner_positionArray[i] = new THREE.Vector3( 0.0, 0.0, 0.0 );
					game_debris_positionArray[cleaner_target_array[i]] = new THREE.Vector3( 0.0, 0.0, 0.0 );
					game_destroyed = game_destroyed +1;

					game_debris_state_array[cleaner_target_array[i]] = -0.01;
					cleaner_state_array[i] = -1;
					scene.remove(game_debris_objectArray[cleaner_target_array[i]]);
					scene.remove(invisible_object_array[cleaner_target_array[i]]);
					scene.remove(cleaner_objectArray[i]); 
					game_debris_destroyed_array[cleaner_target_array[i]] = 1;

					if (debug == true) {
						console.log(cleaner_objectArray);
					}

					game_total_score = game_total_score + 1;

				}
				
				cleaner_objectArray[i].position.set(cleaner_positionArray[i].x*scale,cleaner_positionArray[i].y*scale,cleaner_positionArray[i].z*scale);
			}
			
		}

	}

}

for ( var i = 0; i < positions.length; i += 9 ) {

	positions[ i ]     = positions[ i ] + bg_debris_velocityArray[i/9].x;
	positions[ i + 1 ] = positions[ i + 1] + bg_debris_velocityArray[i/9].y;
	positions[ i + 2 ] = positions[ i + 2] + bg_debris_velocityArray[i/9].z;

	positions[ i + 3 ] = positions[ i + 3] + bg_debris_velocityArray[i/9].x;
	positions[ i + 4 ] = positions[ i + 4] + bg_debris_velocityArray[i/9].y;
	positions[ i + 5 ] = positions[ i + 5] + bg_debris_velocityArray[i/9].z;

	positions[ i + 6 ] = positions[ i + 6] + bg_debris_velocityArray[i/9].x;
	positions[ i + 7 ] = positions[ i + 7] + bg_debris_velocityArray[i/9].y;
	positions[ i + 8 ] = positions[ i + 8] + bg_debris_velocityArray[i/9].z;

}

mesh.geometry.attributes.position.needsUpdate = true;
	
}


}

function fireRay(mouse, camera){

	raycaster.setFromCamera( mouse, camera );

	intersects = raycaster.intersectObjects( invisible_object_array, true );

	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			INTERSECTED = intersects[ 0 ].object;

			INTERSECTED.material.color.setHex( 0x11ee22 );
			INTERSECTED.scale.set(0.1, 0.1, 0.1);

			for ( var i = 0; i < game_debris_objectArray.length; i += 1 ) {
				if (game_debris_objectArray[i].children[0].name == INTERSECTED.name){

					create_cleaner(1, i);
					game_debris_objectArray[i].children[0].currentHex = game_debris_objectArray[i].children[0].material.emissive.getHex();
					game_debris_objectArray[i].children[0].material.emissive.setHex(  0x11ee22 );
				}
			}

		}

	} else {

		INTERSECTED = null;

	}

	}

function checkIntersection(){
	fireRay(mouse, camera);
}

function onTouch(event){
	mouse.x = ( event.originalEvent.touches[0].pageX / window.innerWidth ) * 2 - 1;
	mouse.y = ( ( event.originalEvent.touches[0].pageY / window.innerHeight ) * 2 - 1) *-1;
	checkIntersection();
}

function onClick(event){
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	checkIntersection();
}

$("body").click(function(event) {
	event.preventDefault();
	onClick(event);
});

$("body").on('touchstart', function(event){
  	event.preventDefault();
	onTouch(event);
});

function update(){

	if (game_state != "paused" && game_state != "game_over")
	{

	rotationamount += 0.002
	
	uniforms["sunDirection"].value = new THREE.Vector3(Math.sin( -rotationamount * 2.9),0.2,Math.cos( rotationamount * 2.9));
	uniforms["viewDirection"].value = new THREE.Vector3(camera.position.x,camera.position.y,camera.position.z);

	pointLight.position.x = uniforms["sunDirection"].value.x * 1000;
	pointLight.position.y = uniforms["sunDirection"].value.y * 1000;
	pointLight.position.z = uniforms["sunDirection"].value.z * 1000;

	// + (rotationamount/100)

	if (Math.random() < 0.001 * LEO_debris_generation_rate  )
	{
		game_colour = new THREE.Color( 0.9, 0.1, 0.2 );
		leo_axis = new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
		create_game_debris(120, game_debris_positionArray, game_debris_velocityArray, game_debris_objectArray, game_debris_state_array, game_debris_destroyed_array, game_colour, leo_axis, invisible_object_array );
	}

	if (Math.random() < 0.001 * MEO_debris_generation_rate )
	{
		game_colour = new THREE.Color( 0.9, 0.1, 0.2 );
		leo_axis = new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
		create_game_debris(240, game_debris_positionArray, game_debris_velocityArray, game_debris_objectArray, game_debris_state_array, game_debris_destroyed_array, game_colour, leo_axis, invisible_object_array );
	}

	if (Math.random() < 0.001 * GEO_debris_generation_rate )
	{
		game_colour = new THREE.Color( 0.9, 0.1, 0.2 );
		geo_axis = new THREE.Vector3(0,1,0).normalize();
		create_game_debris(400, game_debris_positionArray, game_debris_velocityArray, game_debris_objectArray, game_debris_state_array, game_debris_destroyed_array, game_colour, geo_axis, invisible_object_array );
	}


	}

	for(var i=0; i<game_debris_positionArray.length; i++) {
		// console.log( game_debris_positionArray[i].length() );
		if ( game_debris_positionArray[i].length() < 60 || game_debris_positionArray[i].length() > 600 ){
			scene.remove(game_debris_objectArray[i]);
			game_debris_destroyed_array[i] = 1;
		}
	}

	total_cleaned = 0;
	for(var i=0; i<cleaner_state_array.length; i++) {
		if (cleaner_state_array[i] == -1){
			total_cleaned = total_cleaned + 1;
		}
	}

	total_debris = 0;
	for(var i=0; i<game_debris_destroyed_array.length; i++) {
		if (game_debris_destroyed_array[i] == 0){
			total_debris = total_debris + 1;
		}
	}

	if (total_debris > 50){
		// reset();
		game_state = "game_over"
		document.getElementById("reset").style.visibility="visible";

	}

	if (debug == true) {
		console.log(level_state, game_state, overlay_state, game_total_score)
	}

	

}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}


question_order = Array.apply(null, {length: 14}).map(Number.call, Number)
shuffleArray(question_order);
console.log(question_order);

correct_preamble = "<a id=\"answer_button_pressed_correct\" onclick=\"incrementScore(10);close_overlay_pressed()\">"
incorrect_preamble = "<a id=\"answer_button_pressed_incorrect\" onclick=\"decrementScore(10);close_overlay_pressed()\">"
// 

function check_state() {

	if ( level_state == 1 ){

		// game_debris_decay_rate = level_state*0.0004;
		
		document.getElementById("score").innerHTML="Score: " + game_total_score; 
		LEO_debris_generation_rate = level_data[ question_order[level_state-1] ][0];
		MEO_debris_generation_rate = level_data[ question_order[level_state-1] ][1];
		GEO_debris_generation_rate = level_data[ question_order[level_state-1] ][2];

		if ( total_cleaned > 10 && overlay_state == "closed") {
			openNav();
			questions = [ correct_preamble + level_data[ question_order[level_state-1] ][4] + "</a>", incorrect_preamble + level_data[ question_order[level_state-1] ][5] + "</a>", incorrect_preamble + level_data[ question_order[level_state-1] ][6] + "</a>", incorrect_preamble + level_data[ question_order[level_state-1] ][7] + "</a>" ];
			shuffleArray(questions);
			document.getElementById("overlay_description_text").textContent="Question Number " + level_state.toString();
			document.getElementById("overlay_questions").innerHTML=level_data[ question_order[level_state-1] ][3] + questions[0] + questions[1] + questions[2] + questions[3];

			$('#answer_button_pressed_correct').on('touchstart', function(e){incrementScore(10);close_overlay_pressed(e);e.preventDefault();});

			$('#answer_button_pressed_incorrect').on('touchstart', function(e){decrementScore(10);close_overlay_pressed(e);e.preventDefault();});

		}
	}


	if ( level_state == 2 ){

		// game_debris_decay_rate = level_state*0.0004;
		
		document.getElementById("score").innerHTML="Score: " + game_total_score; 
		LEO_debris_generation_rate = level_data[ question_order[level_state-1] ][0];
		MEO_debris_generation_rate = level_data[ question_order[level_state-1] ][1];
		GEO_debris_generation_rate = level_data[ question_order[level_state-1] ][2];

		if ( total_cleaned > 10 && overlay_state == "closed") {
			openNav();
			questions = [ correct_preamble + level_data[ question_order[level_state-1] ][4] + "</a>", incorrect_preamble + level_data[ question_order[level_state-1] ][5] + "</a>", incorrect_preamble + level_data[ question_order[level_state-1] ][6] + "</a>", incorrect_preamble + level_data[ question_order[level_state-1] ][7] + "</a>" ];
			shuffleArray(questions);
			document.getElementById("overlay_description_text").textContent="Question Number " + level_state.toString();
			document.getElementById("overlay_questions").innerHTML=level_data[ question_order[level_state-1] ][3] + questions[0] + questions[1] + questions[2] + questions[3];

			$('#answer_button_pressed_correct').on('touchstart', function(e){incrementScore(10);close_overlay_pressed(e);e.preventDefault();});

			$('#answer_button_pressed_incorrect').on('touchstart', function(e){decrementScore(10);close_overlay_pressed(e);e.preventDefault();});

		}
	}

	if ( level_state == 3 ){

		// game_debris_decay_rate = level_state*0.0004;
		
		document.getElementById("score").innerHTML="Score: " + game_total_score; 
		LEO_debris_generation_rate = level_data[ question_order[level_state-1] ][0];
		MEO_debris_generation_rate = level_data[ question_order[level_state-1] ][1];
		GEO_debris_generation_rate = level_data[ question_order[level_state-1] ][2];

		if ( total_cleaned > 10 && overlay_state == "closed") {
			openNav();
			questions = [ correct_preamble + level_data[ question_order[level_state-1] ][4] + "</a>", incorrect_preamble + level_data[ question_order[level_state-1] ][5] + "</a>", incorrect_preamble + level_data[ question_order[level_state-1] ][6] + "</a>", incorrect_preamble + level_data[ question_order[level_state-1] ][7] + "</a>" ];
			shuffleArray(questions);
			document.getElementById("overlay_description_text").textContent="Question Number " + level_state.toString();
			document.getElementById("overlay_questions").innerHTML=level_data[ question_order[level_state-1] ][3] + questions[0] + questions[1] + questions[2] + questions[3];

			$('#answer_button_pressed_correct').on('touchstart', function(e){incrementScore(10);close_overlay_pressed(e);e.preventDefault();});

			$('#answer_button_pressed_incorrect').on('touchstart', function(e){decrementScore(10);close_overlay_pressed(e);e.preventDefault();});

		}
	}

	if ( level_state == 4 ){

		// game_debris_decay_rate = level_state*0.0004;
		
		document.getElementById("score").innerHTML="Score: " + game_total_score; 
		LEO_debris_generation_rate = level_data[ question_order[level_state-1] ][0];
		MEO_debris_generation_rate = level_data[ question_order[level_state-1] ][1];
		GEO_debris_generation_rate = level_data[ question_order[level_state-1] ][2];

		if ( total_cleaned > 10 && overlay_state == "closed") {
			openNav();
			questions = [ correct_preamble + level_data[ question_order[level_state-1] ][4] + "</a>", incorrect_preamble + level_data[ question_order[level_state-1] ][5] + "</a>", incorrect_preamble + level_data[ question_order[level_state-1] ][6] + "</a>", incorrect_preamble + level_data[ question_order[level_state-1] ][7] + "</a>" ];
			shuffleArray(questions);
			document.getElementById("overlay_description_text").textContent="Question Number " + level_state.toString();
			document.getElementById("overlay_questions").innerHTML=level_data[ question_order[level_state-1] ][3] + questions[0] + questions[1] + questions[2] + questions[3];

			$('#answer_button_pressed_correct').on('touchstart', function(e){incrementScore(10);close_overlay_pressed(e);e.preventDefault();});

			$('#answer_button_pressed_incorrect').on('touchstart', function(e){decrementScore(10);close_overlay_pressed(e);e.preventDefault();});

		}
	}

	if ( level_state == 5 ){
		document.getElementById("score").innerHTML="Final Score: " + game_total_score; 
		openNav();
		document.getElementById("overlay_description_text").innerHTML="🚀🚯🕹️<br><br>\
    👩🏻‍🚀💬 \"Thankyou! You saved the 🌍!\"<br><br>\
    <span class=\"final_score\">Debris Removed: " + game_total_score + "</span><br><br>" +
    "<span class=\"final_score\">Time Taken: " + game_total_score + " seconds</span><br><br>" +
    "<span class=\"final_score\">Total Score: " + game_total_score + "</span>"; 

    document.getElementById("overlay_questions").innerHTML="";

	}

}












function animate() 
{
	check_state();
	requestAnimationFrame( animate );
	render();		
	update();
	
}

function reset(){

	document.getElementById("reset").style.visibility="hidden";

	for(var i=0; i<game_debris_objectArray.length; i++) {
		scene.remove(game_debris_objectArray[i]);
	}

	for(var i=0; i<invisible_object_array.length; i++) {
		scene.remove(invisible_object_array[i]);
	}

	for(var i=0; i<cleaner_objectArray.length; i++) {
		scene.remove(cleaner_objectArray[i]);
	}

	rotationamount = 0;

	game_debris_objectArray = [];
	game_debris_positionArray = [];
	game_debris_velocityArray = [];
	game_debris_state_array = [];
	game_debris_destroyed_array = [];

	invisible_object_array = [];

	cleaner_objectArray = [];
	cleaner_positionArray = [];
	cleaner_velocityArray = [];
	cleaner_regime_array = [];
	cleaner_target_array = [];
	cleaner_state_array = [];

}

animate();