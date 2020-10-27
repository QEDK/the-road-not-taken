import * as THREE from 'https://unpkg.com/three@0.121.1/build/three.module.js';
import {FBXLoader} from 'https://unpkg.com/three@0.121.1/examples/jsm/loaders/FBXLoader.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.1/examples/jsm/controls/OrbitControls.js';

//HOMEPAGE ELEMENTS
var startButton, gameElements, navButtons, navButLeft, navButRight;

//GAME ELEMENTS
var clock = new THREE.Clock();
var container, homepage;
let scene, camera, renderer, orbitControl;
var walk = false; 
var playerObject, playerMixer, textFont, player;
var yoffset = -100;
var walkscale = 150;
var zoffset = walkscale/2;
var noOfRoadsInSight = 12;
var totalNoOfRoads = 20;
var currPlane = 0;
var planesDrawn = 0;
var duration = 1.3333;
var zoomIteration = 0; 
var zoomStart = false;
var lookAtUser = false;
var cameraPoint;
var leafSize = 5;
var leafHeight = 1500;
var walkAngle = 0.0;
var turnEnabled = false;
var lastPos;
var cameraTarget;
var stopPoint;

var choices;
var choicesDone = [];
var playerWealth = 50;
var playerHealth = 50;
var playerWealthBar, playerHealthBar;
var intersectionElementBeforeChoice;
var htmlLeftChoiceTitle, htmlRightChoiceTitle, htmlQuestionTitle;
var currentQuestion, cqTitle, cqLeftChoice, cqRightChoice, cqLeftTitle, cqRightTitle, cqLeftResponse, cqRightResponse, cqLeftMoneyChange, cqRightMoneyChange, cqLeftHealthChange, cqRightHealthChange, cqLeftIsAlive, cqRightIsAlive;


fetch("../src/choices.json")
.then(response => {
   return response.json();
})
.then(data => {
    console.log("json data");
    choices = data;
});



var anglePath = [];
var angleCurrentlyUsed = -1;

var leaves = [];
var grasses = [];
var roads = [];

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 3000);
    camera.position.set(90, 700, -1000);
    camera.rotation.x = Math.PI/2;
    renderer = new THREE.WebGLRenderer({alpha: true, antialias:true});
    stopPoint = new THREE.Vector3(-1000,-1000,-1000);
    orbitControl = new OrbitControls(camera, renderer.domElement);

    renderer.setSize(window.innerWidth, window.innerHeight);
	cameraPoint = new THREE.Vector3(1300,0, 0);
	cameraTarget = new THREE.Vector3(90, 100, -400);
    camera.lookAt(cameraPoint);

    var hemiLight = new THREE.HemisphereLight( 0xffffbb,  0xffffff, .3 );
    scene.add( hemiLight );

    var shadowLight = new THREE.DirectionalLight(0xffffff, .8);
    shadowLight.position.set(1, 1, 1);
 	scene.add(shadowLight);

	var directionLight = new THREE.DirectionalLight( 0xffffff );
	directionLight.position.set( 0, 1000, -1000 );
	directionLight.castShadow = true;
	directionLight.shadow.camera.top = 100;
	directionLight.shadow.camera.bottom = - 400;
	directionLight.shadow.camera.left = - 100;
	directionLight.shadow.camera.right = 400;
    scene.add( directionLight );
     
    scene.add(new THREE.AmbientLight(0x777777))

    container = document.getElementById('canvas');
    homepage = document.getElementById('homepage');
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', ()=>{
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth/ window.innerHeight;
        camera.updateProjectionMatrix()
    });

    startButton = document.getElementById('gameStart');
    gameElements = document.getElementById('game-elements');
    navButLeft = document.getElementById('nav-left');
    navButRight = document.getElementById('nav-right');
    
    htmlLeftChoiceTitle = document.getElementById('left-choice-title');
    htmlRightChoiceTitle = document.getElementById('right-choice-title');
    htmlQuestionTitle = document.getElementById('question-title');

    playerHealthBar = document.getElementById('healthbar');
    playerWealthBar = document.getElementById('wealthbar');
    playerHealthBar.value = playerHealth;
    playerWealthBar.value = playerWealth;

    intersectionElementBeforeChoice = document.getElementById('intersection-elements-before-choice');

    intersectionElementBeforeChoice.style.display = "none";
    gameElements.style.display = "none";


    init_keypress();
    init_loader();
}

function init_keypress(){

    startButton.addEventListener('click', ()=>{
        if(!zoomStart)
        {
            homepage.style.display = "none";
            container.style.display = "block";
            zoomStart = true;
            lookAtUser = true;
            addAnglePath(false);
            gameElements.style.display = "block";
        }
    });

    navButLeft.addEventListener('click', ()=>{
        console.log("left click");
        if(turnEnabled) {
            console.log("left");
            
            playerHealth += cqLeftHealthChange;
            playerWealth += cqLeftMoneyChange;

            playerHealthBar.value = playerHealth;
            playerWealthBar.value = playerWealth;

            console.log("RESPONSE => "+cqLeftResponse);

			walkAngle += Math.PI/3; 
			playerObject.rotation.y += Math.PI/3;
			lastPos = anglePath[angleCurrentlyUsed].leftPath[2].position;
            addAnglePath(true);
            intersectionElementBeforeChoice.style.display = "none";
        }
    });

    navButRight.addEventListener('click', ()=>{
        console.log("right click");
        if(turnEnabled) {
            console.log("right");
            
            playerHealth += cqRightHealthChange;
            playerWealth += cqRightMoneyChange;

            playerHealthBar.value = playerHealth;
            playerWealthBar.value = playerWealth;

            console.log("RESPONSE => "+cqRightResponse);

			walkAngle -= Math.PI/3; 
			playerObject.rotation.y -= Math.PI/3;
			lastPos = anglePath[angleCurrentlyUsed].rightPath[2].position;
            addAnglePath(true);
            intersectionElementBeforeChoice.style.display = "none";
        }
    });

    document.addEventListener('keypress', function(event) {
        if(event.key == ' ') {
            if(!zoomStart)
            {
                homepage.style.display = "none";
                container.style.display = "block";
                zoomStart = true;
                lookAtUser = true;
                addAnglePath(false);
            }
            else
            {
                walk = !walk;
                // if(walk)
                // container.style.display = "none";
                // else
                // container.style.display = "block";
            }
        }
        if(event.key == 'r' && turnEnabled) {
			console.log("right");
			walkAngle -= Math.PI/3; 
			playerObject.rotation.y -= Math.PI/3;
			lastPos = anglePath[angleCurrentlyUsed].rightPath[2].position;
            addAnglePath(true);
            intersectionElementBeforeChoice.style.display = "none";
		}
		if(event.key == 'l' && turnEnabled) {
			console.log("left");
			walkAngle += Math.PI/3; 
			playerObject.rotation.y += Math.PI/3;
			lastPos = anglePath[angleCurrentlyUsed].leftPath[2].position;
            addAnglePath(true);
            intersectionElementBeforeChoice.style.display = "none";
        }

        if(event.key == 'p') {
			console.log("playerObjectPosition");
            console.log(playerObject.position);
            console.log("currPlane");
            console.log(currPlane);
        }
    });
}

function pause(milliseconds) {
	var dt = new Date();
	while ((new Date()) - dt <= milliseconds) { /* Do nothing */ }
}

function init_loader(){

    var leafTexture = new THREE.TextureLoader().load("../3d_assets/Leaf/leaf_texture.jpg");
    var lt1= new THREE.TextureLoader().load("../3d_assets/Leaf/leaf_t1.png");
    var lt2 = new THREE.TextureLoader().load("../3d_assets/Leaf/leaf_t2.png");
    // leafTexture.wrapS = THREE.RepeatWrapping;
    // leafTexture.wrapT = THREE.RepeatWrapping;
    // leafTexture.repeat.set( 4, 4 );
    var leafMaterial = new THREE.MeshBasicMaterial({map: leafTexture, side: THREE.DoubleSide});
    var lm1 = new THREE.MeshBasicMaterial({map: lt1, side: THREE.DoubleSide});
    var lm2 = new THREE.MeshBasicMaterial({map: lt2, side: THREE.DoubleSide});
    var leafGeo = new THREE.PlaneGeometry(leafSize, leafSize/2);

    var leafLoader = new FBXLoader();
    leafLoader.load('../3d_assets/Leaf/leaf.fbx', (leaf3d)=>{
        console.log("leaf below");
        console.log(leaf3d);
        console.log(leaf3d.children[0].geometry);
        for(var i = 0; i<1000; i++)
        {        
            var leaf = leaf3d;
            leaf.scale.set(30,30,30);
            var r0 = Math.floor(Math.random()*5) % 2;
            var lmat = lm1;
            if(r0==0)
            lmat = lm2;
            leaf = new THREE.Mesh(leaf.children[0].geometry, lmat);
            leaf.rotation.x = Math.random() * Math.PI;
            leaf.rotation.y = Math.random() * Math.PI;
            leaf.rotation.z = Math.random() * Math.PI;
            var r1 = Math.floor(Math.random()*5) % 2;
            if(r1==0)r1=-1;
            leaf.position.x = Math.floor(Math.random() * 500) * r1;
            var r2 = Math.random();
            if(r2>0.9)
            r2 = (r2-0.9)* -1;
            leaf.position.y = Math.floor( r2 * leafHeight);
            var r3 = Math.random();
            if(r3>0.7)
            r3 = (r3-0.7)* -1;
            leaf.position.z = Math.floor( r3 * 1000);

            var leaf2 = new THREE.Mesh(leaf3d.children[0].geometry, lmat);
            leaf2.rotation.x = Math.random() * Math.PI;
            leaf2.rotation.y = Math.random() * Math.PI;
            leaf2.rotation.z = Math.random() * Math.PI;
            leaf2.position.x = (Math.floor(Math.random() * 500) * r1 + 1300);
            leaf2.position.y = Math.floor( r2 * leafHeight);
            leaf2.position.z = Math.floor( -r3 * 1000);
            
            leaves.push(leaf);
            scene.add(leaf);
            leaves.push(leaf2);
            scene.add(leaf2);
        }
    });

    var playerLoader = new FBXLoader();
    playerLoader.load('../3d_assets/Dave/Dave.fbx', function(object3d){
        playerObject = object3d;
        playerObject.scale.set(0.3,0.3,0.3);
        playerObject.position.y += yoffset;
        playerObject.position.z = walkscale / 2;
        cameraPoint.y = playerObject.position.y;
        cameraPoint.z = playerObject.position.z;
        playerMixer = new THREE.AnimationMixer(object3d);
        var action = playerMixer.clipAction(object3d.animations[0]);
        action.play();
        scene.add(playerObject);
        playerMixer.update(0);
        playerObject.updateMatrix();
        renderer.render(scene, camera);
        animate();
    });

    ///////////////////
    // GRASS

    // var gtex = new THREE.TextureLoader().load("../3d_assets/Grass/grassTexture5.jpg");
    // var gmat = new THREE.MeshBasicMaterial({map: gtex, side: THREE.DoubleSide});
    // var ggeo = new THREE.PlaneGeometry(3 * walkscale, 3 * walkscale);
    // var span = 50;
    // for(var i = -span; i<=span; i++)
    // {
    //     grasses.push([]);
    //     for(var j = -span; j<=span; j++)
    //     {
    //         var tgo = new THREE.Mesh(ggeo, gmat);
    //         tgo.position.x = i * walkscale;
    //         tgo.position.z = j * walkscale;
    //         tgo.rotation.x = Math.PI/2;
    //         tgo.position.y = yoffset - 25;
    //         grasses[i+span][j+span] = tgo;
    //         scene.add(tgo);
    //     }
            
    // } 

    // var grassLoader = new FBXLoader();
    // grassLoader.load('../3d_assets/Grass/grass_new3.fbx', function(object3d){
    //     console.log("grass_object");
    //     console.log(object3d);
    //     var grassObject = object3d;
    //     grassObject.position.y = yoffset - 25;
    //     grassObject.position.y = 100;
    //     grassObject.rotation.x = Math.PI;

    //     // scene.add(grassObject);

    //     var gtex = new THREE.TextureLoader().load("../3d_assets/Grass/grassTexture2.png");
    //     var gmat = new THREE.MeshBasicMaterial({map: gtex, side: THREE.DoubleSide});
    //     // var gmesh = new THREE.Mesh(grassObject.children[0].geometry, gmat);

    //     for(var i = -50; i<=50; i++)
    //     {
    //         grasses.push([]);
    //         for(var j = -50; j<=50; j++)
    //         {
    //             var tgo = new THREE.Mesh(grassObject.children[0].geometry, gmat);
    //             tgo.position.x = i * walkscale;
    //             tgo.position.z = j * walkscale;
    //             tgo.rotation.x = Math.PI;
    //             tgo.position.y = 100;
    //             grasses[i+50][j+50] = tgo;
    //             scene.add(tgo);
    //         }
            
    //     }        
    // });

	var roadTexture = new THREE.TextureLoader().load("../3d_assets/Road/road_texture_2.jpg");
	var roadTriTexture = new THREE.TextureLoader().load("../3d_assets/Road/road_tri_texture_4.png");
	var roadMaterial = new THREE.MeshBasicMaterial({map: roadTexture, side: THREE.DoubleSide});
	var roadTriMaterial = new THREE.MeshBasicMaterial({map: roadTriTexture, side: THREE.DoubleSide});
	var roadGeo = new THREE.PlaneGeometry(3 * walkscale, 3 * walkscale);
	

	for(var j = 0; j<3; j++)
	{
		var ap = new Object();
		ap.leftPath = [];
		ap.rightPath = [];
		for(var i = 0; i<3; i++)
		{
			ap.leftPath.push(new THREE.Mesh(roadGeo, roadMaterial));
			ap.leftPath[i].rotation.x = Math.PI/2;
			ap.leftPath[i].position.y = -3300 - i*2;
			scene.add(ap.leftPath[i]);
			ap.rightPath.push(new THREE.Mesh(roadGeo, roadMaterial));
			ap.rightPath[i].rotation.x = Math.PI/2;
			ap.rightPath[i].position.y = -3000 - i*2;
			scene.add(ap.rightPath[i]);
		}
		ap.tri = new THREE.Mesh(roadGeo, roadTriMaterial);
		ap.tri.rotation.x = Math.PI/2;
		ap.tri.position.y = -2500 - j*10;
		anglePath.push(ap);
		scene.add(ap.tri);
	}

    for(var i = 0; i<3; i++)
    {
        var iniroad = new THREE.Mesh(roadGeo, roadMaterial);
        iniroad.rotation.x = Math.PI/2;
        iniroad.position.z = zoffset + i * walkscale*3;
        iniroad.position.y = yoffset;
        lastPos = iniroad.position;
        scene.add(iniroad);
    }


    for(var i = -12; i < 2; i+=3)
    {
        var road = new THREE.Mesh(roadGeo, roadMaterial);
        road.rotation.x = Math.PI/2;
        road.position.z = walkscale * i + zoffset;
        road.position.y = yoffset;
        scene.add(road);
	}
	
    planesDrawn = totalNoOfRoads;

    var fontlink = 'https://unpkg.com/three@0.121.1//examples/fonts/helvetiker_regular.typeface.json';
    
    var textLoader = new THREE.FontLoader();
    textLoader.load(fontlink, (font)=>{
        textFont = font;
    });

}

function addAnglePath(situation)
{
	var an = 0;
	switch(angleCurrentlyUsed){
		case -1: {
			an = 0;
			angleCurrentlyUsed = 0;
			break;
		}
		case 0: {
			an = 1;
			angleCurrentlyUsed = 1;
			break;
		}
		case 1: {
			an = 2;
			angleCurrentlyUsed = 2;
			break;
		}
		case 2: {
			an = 0;
			angleCurrentlyUsed = 0;
			break;
		}
	}
	
	var TriX = lastPos.x + walkscale * 3 * Math.sin(walkAngle);
	var TriZ = lastPos.z + walkscale * 3 * Math.cos(walkAngle);
	anglePath[an].tri.position.x = TriX;
	anglePath[an].tri.position.y = lastPos.y+1;
	anglePath[an].tri.position.z = TriZ;
    anglePath[an].tri.rotation.z = -walkAngle;
    
    stopPoint.x = lastPos.x + walkscale * 2.36602 * Math.sin(walkAngle);
    stopPoint.z = lastPos.z + walkscale * 2.36602 * Math.cos(walkAngle);
    stopPoint.y = yoffset;
    // console.log(stopPoint.x+" -- "+stopPoint.y+" -- "+stopPoint.z+" - STOP POINT -- ");


	// var geometry = new THREE.SphereGeometry( 5,32,32 );
	// var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	// var sphere = new THREE.Mesh( geometry, material );
	// sphere.position.x = anglePath[an].tri.position.x;
	// sphere.position.y = anglePath[an].tri.position.y;
	// sphere.position.z = anglePath[an].tri.position.z;
    // scene.add( sphere );
    

	var midX = (TriX + lastPos.x) /2;
	var midZ = (TriZ + lastPos.z) /2;
	console.log(TriX+" -- "+TriZ+" -- "+lastPos.x+" -- "+lastPos.z+" -- "+midX+ " -- "+midZ);

	var erx = Math.cos(walkAngle-Math.PI/3) * (walkscale*1.5) - Math.sin(walkAngle-Math.PI/3) * (walkscale * 1.5) + lastPos.x + walkscale;
	var erz = Math.sin(walkAngle-Math.PI/3) * (walkscale*1.5) + Math.cos(walkAngle-Math.PI/3) * (walkscale * 1.5) + lastPos.z +  1.5 * walkscale;

	var elx = Math.cos(walkAngle+Math.PI/3) * (walkscale*1.5) - Math.sin(walkAngle+Math.PI/3) * (walkscale * 1.5) + lastPos.x - walkscale;
	var elz = Math.sin(walkAngle+Math.PI/3) * (walkscale*1.5) + Math.cos(walkAngle+Math.PI/3) * (walkscale * 1.5) + lastPos.z + 1.5 * walkscale;



	var RPX = Math.cos(-Math.PI/2) * (TriX - midX) - Math.sin(-Math.PI/2) * (TriZ - midZ) + midX;
	var RPZ = Math.sin(-Math.PI/2) * (TriX - midX) + Math.cos(-Math.PI/2) * (TriZ - midZ) + midZ;
	var LPX = Math.cos(Math.PI/2) * (TriX - midX) - Math.sin(Math.PI/2) * (TriZ - midZ) + midX;
	var LPZ = Math.sin(Math.PI/2) * (TriX - midX) + Math.cos(Math.PI/2) * (TriZ - midZ) + midZ;


	var RX = Math.cos(-Math.PI/3) * (TriX - RPX) - Math.sin(-Math.PI/3) * (TriZ - RPZ) + RPX;
	var RZ = Math.sin(-Math.PI/3) * (TriX - RPX) + Math.cos(-Math.PI/3) * (TriZ - RPZ) + RPZ;
	var LX = Math.cos(Math.PI/3) * (TriX - LPX) - Math.sin(Math.PI/3) * (TriZ - LPZ) + LPX;
	var LZ = Math.sin(Math.PI/3) * (TriX - LPX) + Math.cos(Math.PI/3) * (TriZ - LPZ) + LPZ;



	var la = walkAngle + Math.PI/3;
	var ra = walkAngle - Math.PI/3;

	for(var it = 0; it < 3; it++)
	{
		anglePath[an].leftPath[it].position.x = RX + walkscale*3*it * Math.sin(la);
		anglePath[an].leftPath[it].position.z = RZ + walkscale*3*it * Math.cos(la);
		anglePath[an].leftPath[it].rotation.z = -walkAngle - Math.PI/3;
		anglePath[an].leftPath[it].position.y = yoffset;

		anglePath[an].rightPath[it].position.x = LX + walkscale*3*it * Math.sin(ra);
		anglePath[an].rightPath[it].position.z = LZ + walkscale*3*it * Math.cos(ra);
		anglePath[an].rightPath[it].rotation.z = -walkAngle + Math.PI/3;
		anglePath[an].rightPath[it].position.y = yoffset;
	}

	var textpos = new THREE.Vector3();
	textpos.x = lastPos.x + walkscale * 9 * Math.sin(walkAngle);
	textpos.z = lastPos.z + walkscale * 9 * Math.cos(walkAngle);
	textpos.y = 0;
    // addText("Question", "Choice 1", "Choice 2", textpos);
    
    walk = situation;
    turnEnabled = false;
}

function animate(){
    
    if(zoomIteration < 100 && zoomStart)
    {
        camera.position.y -= 6;
        camera.position.z += 6;
        zoomIteration++;

        if(zoomIteration%50==0)
        {
            console.log(zoomIteration);
            console.log(camera.position);
            
        }

        if(cameraPoint.x>playerObject.position.x)
        {
            cameraPoint.x -= 13; 
        }
        else
        {
            console.log("here");
            var pos = playerObject.position;
            camera.lookAt (pos.x, pos.y+100, pos.z);
        }

        if(zoomIteration == 99)
        walk = true;
    }

    if(walk)
    {
        if( (Math.abs(stopPoint.x - playerObject.position.x)<=13.0) && (Math.abs(stopPoint.z - playerObject.position.z)<=13.0) )
        {
            console.log("STOP!!!!");
            turnEnabled = true;
            walk = false;
            playerObject.position.x = stopPoint.x;
            playerObject.position.y = stopPoint.y;
            playerObject.position.z = stopPoint.z;
            intersectionElementBeforeChoice.style.display = "block"; 
            
            if(choices.length == 0)
            {
                choices = choicesDone;
                choicesDone = [];
            }

            var qno = Math.floor(Math.random()*100) % choices.length;            
            currentQuestion = choices[qno];
            choicesDone.push(currentQuestion);

            array_remove_index_by_value(choices, qno);

            cqTitle = Object.keys(currentQuestion);
            var chs = currentQuestion[cqTitle];

            var nl = Math.floor(Math.random()*100) % chs.length;
            var nr = nl;
            while(nl == nr)
            {
                nr = Math.floor(Math.random()*100) % chs.length;
            }

            cqLeftChoice = chs[nl];
            cqRightChoice = chs[nr];

            cqLeftTitle = Object.keys(cqLeftChoice)[0];
            cqRightTitle = Object.keys(cqRightChoice)[0];
            var allLeftRes = cqLeftChoice[cqLeftTitle];
            var allRightRes = cqRightChoice[cqRightTitle];

            var cqlr = allLeftRes[(Math.floor(Math.random()*100))%allLeftRes.length];
            var cqrr = allRightRes[(Math.floor(Math.random()*100))%allRightRes.length];

            cqLeftResponse = Object.keys(cqlr)[0];
            cqLeftIsAlive = cqlr[cqLeftResponse][0];
            cqLeftHealthChange = cqlr[cqLeftResponse][2];
            cqLeftMoneyChange = cqlr[cqLeftResponse][1];

            cqRightResponse = Object.keys(cqrr)[0];
            cqRightIsAlive = cqrr[cqRightResponse][0];
            cqRightHealthChange = cqrr[cqRightResponse][2];
            cqRightMoneyChange = cqrr[cqRightResponse][1];

            //ADD THE CALCULATED VALUES TO ELEMENTS
            htmlQuestionTitle.innerHTML = cqTitle;
            htmlLeftChoiceTitle.innerHTML = cqLeftTitle;
            htmlRightChoiceTitle.innerHTML = cqRightTitle;

        }
    }

    var delta = clock.getDelta();
	var move = false;
	
	var walkspeed = 6;

    if ( playerMixer && walk){
        playerMixer.update( delta );
        playerObject.position.z += walkspeed * Math.cos(walkAngle); 
		camera.position.z += walkspeed * Math.cos(walkAngle); 
		playerObject.position.x += walkspeed * Math.sin(walkAngle); 
        camera.position.x += walkspeed * Math.sin(walkAngle); 
        move = true;
        MouseEvent = true;
        
        var cameraTargetX = playerObject.position.x - Math.sin(walkAngle) * 600;
        var cameraTargetZ = playerObject.position.z - Math.cos(walkAngle) * 600;
        var cameraTargetY = playerObject.position.y + 40;

        if(cameraTargetX < camera.position.x) camera.position.x -= 3;
        if(cameraTargetX > camera.position.x) camera.position.x += 3;
        if(cameraTargetY < camera.position.y) camera.position.y -= 3;
        if(cameraTargetY > camera.position.y) camera.position.y += 3;
        if(cameraTargetZ < camera.position.z) camera.position.z -= 3;
        if(cameraTargetZ > camera.position.z) camera.position.z += 3;
    }

    if(lookAtUser)
    {
        if(zoomIteration < 100)
        {
            var pos = cameraPoint;
            camera.lookAt (pos.x, pos.y+100, pos.z);
        }
        else
        {
            var pos = playerObject.position;
            camera.lookAt (pos.x, pos.y+100, pos.z);
        }
    }

    playerObject.updateMatrix();
    renderer.render(scene, camera);

    currPlane = (Math.floor(playerObject.position.z / walkscale));
    // if(planesDrawn - currPlane < noOfRoadsInSight)
    // {
    //     console.log(currPlane);
    //     roads[(currPlane - (totalNoOfRoads - noOfRoadsInSight + 1))%totalNoOfRoads].position.z += (totalNoOfRoads) * walkscale;
    //     planesDrawn++;
    // }

	

    leaves.forEach((leaf)=>{
        leaf.position.y -= 3;
        if(leaf.position.y < (yoffset-50))
        leaf.position.y = leafHeight;
        if(move)
        {
			leaf.position.z += walkspeed * Math.cos(walkAngle);
			leaf.position.x += walkspeed * Math.sin(walkAngle);
		}
        leaf.rotation.x += 0.1; 
        leaf.rotation.y += 0.1; 
        leaf.rotation.z += 0.1; 
    });

    requestAnimationFrame(animate);
}

function addText(question, leftChoice, rightChoice, position)
{
	console.log("here");
    var text = `${question}\nLeft Path [L] : ${leftChoice}\nRight Path [R] : ${rightChoice}`;
    var geo = new THREE.TextGeometry(
        text,
        {
            font: textFont,
            size: 30,
            curveSegments: 12,
			bevelThickness: 2,
			bevelSize: 5,
			bevelEnabled: true
        }
    );
    geo.computeBoundingBox();
    geo.computeVertexNormals();
    let centreOffset = 0.5 * ( geo.boundingBox.max.x - geo.boundingBox.min.x );
    let textmat = new THREE.MeshBasicMaterial({color:0x3d3d3d, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(geo, textmat);
    mesh.position.x = position.x + centreOffset;
    mesh.position.z = position.z;
    mesh.rotation.y = Math.PI + walkAngle;
    mesh.position.y = position.y + ( geo.boundingBox.max.y - geo.boundingBox.min.y );
    scene.add(mesh); //add text
}

function array_remove_index_by_value(arr, item)
{
    for (var i = arr.length; i--;)
    {
    if (arr[i] === item) {arr.splice(i, 1);}
    }
}


init();