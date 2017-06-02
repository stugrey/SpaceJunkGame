

/* Open when someone clicks on the span element */
function openNav() {
    document.getElementById("myNav").style.width = "100%";
    game_state = "paused";
    overlay_state = "open";
	LEO_debris_generation_rate = 0;
	MEO_debris_generation_rate = 0;
	GEO_debris_generation_rate = 0;
}

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeNav() {
    document.getElementById("myNav").style.width = "0%";
    console.log("Close NAV!");
    level_state = level_state + 1;
    game_state = "active";
    overlay_state = "closed";
}


function createPlanet(scene_name,radius,colour,group) {
	var material = new THREE.MeshLambertMaterial( {
		color: colour,
        shading: THREE.SmoothShading,
        // transparent: true, 
        // opacity: 1.0
	} );
	var geometry = new THREE.SphereGeometry(radius,16,8);

	var meshname = new THREE.Mesh(geometry, material);
	group.add(meshname);

	scene_name.add(group);
}

function createClearPlanet(scene_name,radius,colour,group) {
	var material = new THREE.MeshBasicMaterial( {
		color: colour,
        transparent: true, 
        opacity: 0.0
	} );
	var geometry = new THREE.SphereGeometry(radius,8,4);
	// var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var meshname = new THREE.Mesh(geometry, material);
	group.add(meshname);

	scene_name.add(group);
}

function createCleanerObject(scene_name,radius,colour,group) {
	var material = new THREE.MeshBasicMaterial( {
		color: colour,
	} );
	var geometry = new THREE.SphereGeometry(radius,8,4);
	// var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	// var geometry = new THREE.CylinderGeometry( 0, radius, radius*2, 16 );
	var meshname = new THREE.Mesh(geometry, material);
	group.add(meshname);

	scene_name.add(group);
}

function create_debris(altitude, position_array, velocity_array, object_array, state_array, destroyed_array, colour, axis)
{
	var speed = Math.sqrt(GM / altitude); 
	var pos = new THREE.Vector3(1,0,0);
	// var axis = new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
	var angle = Math.random()*2*3.14;
	pos.applyAxisAngle(axis, angle);
	var vel = axis.cross(pos).normalize().multiplyScalar(speed);
	position_array.push(pos.multiplyScalar(altitude));
	vel.x = vel.x + (Math.random()-0.5)/(altitude * 0.2)
	vel.y = vel.y + (Math.random()-0.5)/(altitude * 0.2)
	vel.z = vel.z + (Math.random()-0.5)/(altitude * 0.2)
	velocity_array.push(vel);
	// var color = new THREE.Color( 0.8, Math.random()*0.25, Math.random()*0.25 );
	scobject = new THREE.Object3D();
	// createPlanet(scene, 5 , colour, scobject);
	object_array.push(scobject);
	state_array.push(0);
	destroyed_array.push(0);
}

function create_game_debris(altitude, position_array, velocity_array, object_array, state_array, destroyed_array, colour, axis, invisible_object_array)
{
	var speed = Math.sqrt(GM / altitude); 
	var pos = new THREE.Vector3(1,0,0);
	// var axis = new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
	var angle = Math.random()*2*3.14;
	pos.applyAxisAngle(axis, angle);
	var vel = axis.cross(pos).normalize().multiplyScalar(speed);
	position_array.push(pos.multiplyScalar(altitude));
	vel.x = vel.x + (Math.random()-0.5)/(altitude * 0.2)
	vel.y = vel.y + (Math.random()-0.5)/(altitude * 0.2)
	vel.z = vel.z + (Math.random()-0.5)/(altitude * 0.2)
	velocity_array.push(vel);
	var color = new THREE.Color( 0.8, Math.random()*0.25, Math.random()*0.25 );
	scobject = new THREE.Object3D();
	createPlanet(scene, 15 , colour, scobject);
	// console.log(scobject);

	var obj_name = String(Math.random()*100000).substring(0,6);

	scobject.children[0].name = obj_name;
	object_array.push(scobject);
	state_array.push(Math.random()/2);
	destroyed_array.push(0);

	scobject = new THREE.Object3D();

	createClearPlanet(scene, 75 , colour, scobject);
	scobject.children[0].name = obj_name;
	// console.log(scobject.mesh.material);
	invisible_object_array.push(scobject);
}


function create_collision_debris(impact_pos, impact_vel, position_array, velocity_array, object_array, state_array, destroyed_array, colour, axis)
{

	// Piece 1
	new_pos = impact_pos.clone();
	position_array.push(new_pos);
	// console.log(new_pos);

	new_vel = impact_vel.clone();
	new_vel.multiplyScalar(-1.0);
	velocity_array.push(new_vel);
	// console.log(new_vel);

	var color = new THREE.Color( 0.8, Math.random()*0.25, Math.random()*0.25 );
	scobject = new THREE.Object3D();
	createPlanet(scene, 15 , colour, scobject);
	// console.log(scobject);

	var obj_name = String(Math.random()*100000).substring(0,6);

	scobject.children[0].name = obj_name;
	object_array.push(scobject);
	state_array.push(Math.random()/2);
	destroyed_array.push(0);

	scobject = new THREE.Object3D();

	createClearPlanet(scene, 75 , colour, scobject);
	scobject.children[0].name = obj_name;
	// console.log(scobject.mesh.material);
	invisible_object_array.push(scobject);




	// Piece 2
	new_pos = impact_pos.clone();
	position_array.push(new_pos);
	// console.log(new_pos);


	new_vel = impact_vel.clone();
	// new_vel.normalize();

	// new_pos.normalize()

	// new_vel.cross(new_pos);

	// new_vel.multiplyScalar( 0.01 );

	var new_vel = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5);

	//new_vel = impact_vel.clone();
	//new_vel.multiplyScalar(-1.0);
	velocity_array.push(new_vel);
	// console.log(new_vel);

	var color = new THREE.Color( 0.8, Math.random()*0.25, Math.random()*0.25 );
	scobject = new THREE.Object3D();
	createPlanet(scene, 15 , colour, scobject);
	// console.log(scobject);

	var obj_name = String(Math.random()*100000).substring(0,6);

	scobject.children[0].name = obj_name;
	object_array.push(scobject);
	state_array.push(Math.random()/2);
	destroyed_array.push(0);

	scobject = new THREE.Object3D();

	createClearPlanet(scene, 75 , colour, scobject);
	scobject.children[0].name = obj_name;
	// console.log(scobject.mesh.material);
	invisible_object_array.push(scobject);




}

function create_cleaner(regime, target)
{
	// Basic Removal
	number_of_debris = number_of_debris - 1;
	// document.getElementById("pieces_of_junk").innerHTML=number_of_debris;
	altitude = 55;

	// Create a cleaner
	var pos = new THREE.Vector3(1,0,0);
	var axis = new THREE.Vector3(0,1,0).normalize();

	var angle = Math.random()*2*3.14;
	pos.applyAxisAngle(axis, angle);
	var speed = Math.sqrt(GM / altitude);
	var vel = axis.cross(pos).normalize().multiplyScalar(speed);

	cleaner_positionArray.push(pos.multiplyScalar(altitude));
	cleaner_velocityArray.push(vel);
	var color = new THREE.Color( 1,1,1 );
	scobject = new THREE.Object3D();
	createCleanerObject(scene, 8 , color, scobject);
	cleaner_objectArray.push(scobject);
	cleaner_regime_array.push(regime);
	cleaner_target_array.push(target);
	cleaner_state_array.push(0);
	console.log(scobject.up);
}





function reset_pressed(e)
{
	console.log("Reset");
	reset();
	ga('send', 'event', 'button', 'click', 'new game');

}

$( "#reset" ).click(function(e) {
   reset_pressed(e);
});

$('#reset').on('touchstart', function(e)
{
  reset_pressed(e);
  e.preventDefault();
});


function close_overlay_pressed(e)
{
	console.log("close_overlay");
	closeNav();
}

$( "#close_button" ).click(function(e) {
   close_overlay_pressed(e);
});

$('#close_button').on('touchstart', function(e)
{
  close_overlay_pressed(e);
  e.preventDefault();
});