import * as THREE from 'https://unpkg.com/three@0.121.1/build/three.module.js';
import {FBXLoader} from 'https://unpkg.com/three@0.121.1/examples/jsm/loaders/FBXLoader.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.1/examples/jsm/controls/OrbitControls.js';

//HOMEPAGE ELEMENTS
var startButton, gameElements, loadingScreen, navButLeft, navButRight, world;

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
var cameraFinalY = 140;
var stopPoint;
var cameraTarget;

var choices;
var choicesDone = [];
var playerWealth = 50;
var playerHealth = 50;
var playerWealthBar, playerHealthBar;
var intersectionElementBeforeChoice;
var intersectionElementResult;
var htmlLeftChoiceTitle, htmlRightChoiceTitle, htmlQuestionTitle;
var htmlResultTitle, htmlWealthResultIcon, htmlHealthResultIcon;
var htmlGameOverScreen, htmlReplayButton, htmlDeathTitle;
var currentQuestion, cqTitle, cqLeftChoice, cqRightChoice, cqLeftTitle, cqRightTitle, cqLeftResponse, cqRightResponse, cqLeftMoneyChange, cqRightMoneyChange, cqLeftHealthChange, cqRightHealthChange, cqLeftIsAlive, cqRightIsAlive;
var isPlayerLoaded = false;
var isLeafLoaded = false;
var isRoadLoaded = false;
var isBgLoaded = false;
var isLoadingScreenVisible = true;
var isResultBeingDisplayed = false;
var isTrackLoaded = false;

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

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemiLight.position.set( 0, 500, 0 );
    scene.add( hemiLight );


    var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.position.set( -1, 0.75, 1 );
    dirLight.position.multiplyScalar( 50);
    dirLight.name = "dirlight";
    scene.add(dirLight);
    dirLight.castShadow = true;
    dirLight.shadow.MapWidth = dirLight.shadow.MapHeight = 1024*2;
     
    scene.add(new THREE.AmbientLight(0x777777));

    var cubeTextureLoader = new THREE.CubeTextureLoader();
    cubeTextureLoader.setPath( '../3d_assets/Sky/' );
    var cubeTexture = cubeTextureLoader.load( [
        'px.jpg', 'nx.jpg',
        'py.jpg', 'ny.jpg',
        'pz.jpg', 'nz.jpg',
    ], ()=>{
        console.log("BG loaded");
        isBgLoaded = true;
        scene.background = cubeTexture;
    } );
    scene.background = cubeTexture;

    container = document.getElementById('canvas');
    homepage = document.getElementById('homepage');
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', ()=>{
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth/ window.innerHeight;
        camera.updateProjectionMatrix()
    });

    loadingScreen = document.getElementById('loading-screen');
    world = document.getElementById('world');

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
    intersectionElementResult = document.getElementById('intersection-elements-result');
    
    htmlResultTitle = document.getElementById('result-title');
    htmlWealthResultIcon = document.getElementById('wealth-result-icon');
    htmlHealthResultIcon = document.getElementById('health-result-icon');

    htmlReplayButton = document.getElementById('replay-button');
    htmlGameOverScreen = document.getElementById('game-over-screen');
    htmlDeathTitle = document.getElementById('death-title');

    intersectionElementBeforeChoice.style.display = "none";
    gameElements.style.display = "none";
    intersectionElementResult.style.display = 'none';
    htmlGameOverScreen.style.display = 'none';

    createjs.Sound.alternateExtensions = ["mp3"];
    createjs.Sound.registerSound({src:"../src/theroadnottaken-audio.mp3", id:"track"});
    createjs.Sound.on("fileload", ()=>{
        isTrackLoaded = true;
    });
    
    intersectionElementBeforeChoice.style.display = "none";
    gameElements.style.display = "none";
    intersectionElementResult.style.display = 'none';

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
            var props = new createjs.PlayPropsConfig().set({interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1, volume: 0.5})
            createjs.Sound.play("track", props);
        }
    });

    navButLeft.addEventListener('click', ()=>{
        console.log("left click");
        if(turnEnabled) {
            console.log("left");
            
            playerHealth += cqLeftHealthChange;
            playerWealth += cqLeftMoneyChange;

            playerHealth = Math.min(playerHealth, 100);
            playerWealth = Math.min(playerWealth, 100);
            playerHealth = Math.max(playerHealth, 0);
            playerWealth = Math.max(playerWealth, 0);

            playerHealthBar.value = playerHealth;
            playerWealthBar.value = playerWealth;

            console.log("RESPONSE => "+cqLeftResponse);

            htmlResultTitle.innerHTML = cqLeftResponse;

            if(cqLeftHealthChange < 0)
            htmlHealthResultIcon.innerHTML = "🔽";
            else if(cqLeftHealthChange == 0)
            htmlHealthResultIcon.innerHTML = "🔁";
            else
            htmlHealthResultIcon.innerHTML = "🔼";

            if(cqLeftMoneyChange < 0)
            htmlWealthResultIcon.innerHTML = "🔽";
            else if(cqLeftMoneyChange == 0)
            htmlWealthResultIcon.innerHTML = "🔁";
            else
            htmlWealthResultIcon.innerHTML = "🔼";
    

			walkAngle += Math.PI/3; 
			playerObject.rotation.y += Math.PI/3;
            lastPos = anglePath[angleCurrentlyUsed].leftPath[2].position;
            intersectionElementBeforeChoice.classList.remove('fade-in');
            intersectionElementBeforeChoice.classList.add('fade-out');
            
            
            setTimeout(function(){ 
                intersectionElementBeforeChoice.style.display = "none";
                intersectionElementResult.classList.remove('fade-out');
                intersectionElementResult.classList.add('fade-in');
                if(!((playerHealth <= 0) || (playerWealth <=0)))
                {
                    intersectionElementResult.style.display = "block";
                    isResultBeingDisplayed = true;
                }
                else
                {
                    htmlDeathTitle.innerHTML = cqLeftResponse;
                    htmlGameOverScreen.classList.add('fade-in');
                    htmlGameOverScreen.style.display = "block";
                }
            }, 800);
        }
    });

    navButRight.addEventListener('click', ()=>{
        console.log("right click");
        if(turnEnabled) {
            console.log("right");
            
            playerHealth += cqRightHealthChange;
            playerWealth += cqRightMoneyChange;

            playerHealth = Math.min(playerHealth, 100);
            playerWealth = Math.min(playerWealth, 100);
            playerHealth = Math.max(playerHealth, 0);
            playerWealth = Math.max(playerWealth, 0);

            playerHealthBar.value = playerHealth;
            playerWealthBar.value = playerWealth;

            console.log("RESPONSE => "+cqRightResponse);

            htmlResultTitle.innerHTML = cqRightResponse;

            if(cqRightHealthChange < 0)
            htmlHealthResultIcon.innerHTML = "🔽";
            else if(cqRightHealthChange == 0)
            htmlHealthResultIcon.innerHTML = "🔁";
            else
            htmlHealthResultIcon.innerHTML = "🔼";

            if(cqRightMoneyChange < 0)
            htmlWealthResultIcon.innerHTML = "🔽";
            else if(cqRightMoneyChange == 0)
            htmlWealthResultIcon.innerHTML = "🔁";
            else
            htmlWealthResultIcon.innerHTML = "🔼";

			walkAngle -= Math.PI/3; 
			playerObject.rotation.y -= Math.PI/3;
            lastPos = anglePath[angleCurrentlyUsed].rightPath[2].position;
            intersectionElementBeforeChoice.classList.remove('fade-in');
            intersectionElementBeforeChoice.classList.add('fade-out');
            intersectionElementBeforeChoice.style.display = "block";
            
            setTimeout(function(){ 
                intersectionElementBeforeChoice.style.display = "none";
                intersectionElementResult.classList.remove('fade-out');
                intersectionElementResult.classList.add('fade-in');
                if(!((playerHealth <= 0) || (playerWealth <=0)))
                {
                    intersectionElementResult.style.display = "block";
                    isResultBeingDisplayed = true;
                }
                else
                {
                    htmlDeathTitle.innerHTML = cqLeftResponse;
                    htmlGameOverScreen.classList.add('fade-in');
                    htmlGameOverScreen.style.display = "block";
                }
            }, 800);
        }
    });


    htmlReplayButton.addEventListener('click',()=>{
        location.reload();
    });

    document.addEventListener('click', ()=>{
        console.log("clicked!!");
        if(isResultBeingDisplayed)
        {
            isResultBeingDisplayed = false;
            if(!((playerHealth <= 0) || (playerWealth <=0)))
            addAnglePath(true);
            intersectionElementResult.classList.remove('fade-in');
            intersectionElementResult.classList.add('fade-out');
            setTimeout(()=>{
                intersectionElementResult.style.display = 'none';
                if(((playerHealth <= 0) || (playerWealth <=0)))
                {
                    //game end;
                    isResultBeingDisplayed = false;
                }
            });
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
                gameElements.style.display = "block";   
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
            var cameraTargetX = playerObject.position.x - Math.sin(walkAngle) * 600;
            var cameraTargetZ = playerObject.position.z - Math.cos(walkAngle) * 600;
            var cameraTargetY = playerObject.position.y + cameraFinalY;
            camera.position.x = cameraTargetX;
            camera.position.y = cameraTargetY;
            camera.position.z = cameraTargetZ;			
        }

    });
}

function pause(milliseconds) {
	var dt = new Date();
	while ((new Date()) - dt <= milliseconds) { /* Do nothing */ }
}

function init_loader(){

    var leafTexture = new THREE.TextureLoader().load("../3d_assets/Leaf/leaf_texture.jpg");
    var lt1= new THREE.TextureLoader().load("../3d_assets/Leaf/leaf_t1_ed.png");
    var lt2 = new THREE.TextureLoader().load("../3d_assets/Leaf/leaf_t2_ed.png");
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
        isLeafLoaded = true;
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
        isPlayerLoaded = true;
        animate();
    });

    var roadTexture = new THREE.TextureLoader().load("../3d_assets/Road/road_texture_2.jpg");
	  var roadTriTexture = new THREE.TextureLoader().load("../3d_assets/Road/road_tri_texture_4.png");
	  var roadMaterial = new THREE.MeshBasicMaterial({map: roadTexture, side: THREE.DoubleSide});
	  var roadTriMaterial = new THREE.MeshBasicMaterial({map: roadTriTexture, side: THREE.DoubleSide});
    var roadGeo = new THREE.PlaneGeometry(3 * walkscale, 3 * walkscale);

    var treeLoader = new FBXLoader();
    treeLoader.load('../3d_assets/Tree/3DPaz_fir-tree_01.FBX', (object3d)=>{
        console.log(object3d);
        var treeObject = object3d;
        var treeGeo = treeObject.children[0].geometry;
        var treeMat = treeObject.children[0].material;
      
        ///Roads Now
        for(var j = 0; j<3; j++)
        {
            var ap = new Object();
            ap.leftPath = [];
            ap.rightPath = [];
            ap.leftTrees = [];
            ap.rightTrees = [];
            for(var i = 0; i<3; i++)
            {
                ap.leftPath.push(new THREE.Mesh(roadGeo, roadMaterial));
                ap.leftPath[i].rotation.x = Math.PI/2;
                ap.leftPath[i].position.y = -3000 - i*7;
                scene.add(ap.leftPath[i]);
                
                var lts = [];
                var lt1 = new THREE.Mesh(treeGeo, treeMat);
                lt1.scale.set(20,30,20);
                lt1.position.y = -3300 - i*300;
                lt1.rotation.x = -Math.PI/2;
                scene.add(lt1);
                var lt2 = new THREE.Mesh(treeGeo, treeMat);
                lt2.scale.set(20,30,20);
                lt2.position.y = -3300 - i*300;
                lt2.rotation.x = -Math.PI/2;
                scene.add(lt2);
                lts.push(lt1);
                lts.push(lt2);
                ap.leftTrees.push(lts);
                
                ap.rightPath.push(new THREE.Mesh(roadGeo, roadMaterial));
                ap.rightPath[i].rotation.x = Math.PI/2;
                ap.rightPath[i].position.y = -3000 - i*2;
                scene.add(ap.rightPath[i]);

                var rts = [];
                var rt1 = new THREE.Mesh(treeGeo, treeMat);
                rt1.scale.set(20,30,20);
                rt1.position.y = -3300 - i*300;
                rt1.rotation.x = -Math.PI/2;
                scene.add(rt1);
                var rt2 = new THREE.Mesh(treeGeo, treeMat);
                rt2.scale.set(20,30,20);
                rt2.position.y = -3300 - i*300;
                rt2.rotation.x = -Math.PI/2;
                scene.add(rt2);
                rts.push(rt1);
                rts.push(rt2);
                ap.rightTrees.push(rts);
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

            var t1 = new THREE.Mesh(treeGeo, treeMat);
            t1.scale.set(20,30,20);
            t1.position.y = yoffset;
            t1.position.x = - walkscale * 1.4;
            t1.position.z = zoffset + i * walkscale*3;
            t1.rotation.x = -Math.PI/2;
            scene.add(t1);
            var t2 = new THREE.Mesh(treeGeo, treeMat);
            t2.scale.set(20,30,20);
            t2.position.y = yoffset;
            t2.position.x = walkscale * 1.4;
            t2.position.z = zoffset + i * walkscale*3;
            t2.rotation.x = -Math.PI/2;
            scene.add(t2);

        }


        for(var i = -12; i < 2; i+=3)
        {
            var road = new THREE.Mesh(roadGeo, roadMaterial);
            road.rotation.x = Math.PI/2;
            road.position.z = walkscale * i + zoffset;
            road.position.y = yoffset;
            scene.add(road);

            var t1 = new THREE.Mesh(treeGeo, treeMat);
            t1.scale.set(20,30,20);
            t1.position.y = yoffset;
            t1.position.x = - walkscale * 1.4;
            t1.position.z = zoffset + i * walkscale;
            t1.rotation.x = -Math.PI/2;
            scene.add(t1);
            var t2 = new THREE.Mesh(treeGeo, treeMat);
            t2.scale.set(20,30,20);
            t2.position.y = yoffset;
            t2.position.x = walkscale * 1.4;
            t2.position.z = zoffset + i * walkscale;
            t2.rotation.x = -Math.PI/2;
            scene.add(t2);
        }
        
        planesDrawn = totalNoOfRoads;
        isRoadLoaded = true;


    });

	
    

	

	

    var fontlink = 'https://unpkg.com/three@0.121.1//examples/fonts/helvetiker_regular.typeface.json';

   
    
    // var textLoader = new THREE.FontLoader();
    // textLoader.load(fontlink, (font)=>{
    //     textFont = font;
    // });

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

        var lltx = RX + walkscale*3*it * Math.sin(la) - Math.sin(ra) * walkscale * 1.4;
        var lltz = RZ + walkscale*3*it * Math.cos(la) - Math.cos(ra) * walkscale * 1.4;
        var lrtx = RX + walkscale*3*it * Math.sin(la) + Math.sin(ra) * walkscale * 1.4;
        var lrtz = RZ + walkscale*3*it * Math.cos(la) + Math.cos(ra) * walkscale * 1.4;

        anglePath[an].leftTrees[it][0].position.x = lltx;
        anglePath[an].leftTrees[it][0].position.z = lltz;
        anglePath[an].leftTrees[it][0].position.y = yoffset;
        anglePath[an].leftTrees[it][1].position.x = lrtx;
        anglePath[an].leftTrees[it][1].position.z = lrtz;
        anglePath[an].leftTrees[it][1].position.y = yoffset;
                

		anglePath[an].rightPath[it].position.x = LX + walkscale*3*it * Math.sin(ra);
		anglePath[an].rightPath[it].position.z = LZ + walkscale*3*it * Math.cos(ra);
		anglePath[an].rightPath[it].rotation.z = -walkAngle + Math.PI/3;
        anglePath[an].rightPath[it].position.y = yoffset;
        
        var rltx = LX + walkscale*3*it * Math.sin(ra) - Math.sin(la) * walkscale * 1.4;
        var rltz = LZ + walkscale*3*it * Math.cos(ra) - Math.cos(la) * walkscale * 1.4;
        var rrtx = LX + walkscale*3*it * Math.sin(ra) + Math.sin(la) * walkscale * 1.4;
        var rrtz = LZ + walkscale*3*it * Math.cos(ra) + Math.cos(la) * walkscale * 1.4;

        anglePath[an].rightTrees[it][0].position.x = rltx;
        anglePath[an].rightTrees[it][0].position.z = rltz;
        anglePath[an].rightTrees[it][0].position.y = yoffset;
        anglePath[an].rightTrees[it][1].position.x = rrtx;
        anglePath[an].rightTrees[it][1].position.z = rrtz;
        anglePath[an].rightTrees[it][1].position.y = yoffset;

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

    if(isLoadingScreenVisible && isPlayerLoaded && isLeafLoaded && isRoadLoaded && isBgLoaded && isTrackLoaded)
    {
        setTimeout(()=>{
            fade(loadingScreen)
        }, 1500);
        isLoadingScreenVisible = false;
        world.style.display = 'block';
        console.log("done!!!");
    }
    
    if(zoomIteration < 100 && zoomStart)
    {
        gameElements.style.display = "block";
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
            intersectionElementBeforeChoice.classList.remove('fade-out');
            intersectionElementBeforeChoice.classList.add('fade-in');
            intersectionElementBeforeChoice.style.display = "block"; 
            
            if(choices.length == 0)
            {
                choices = choicesDone;
                choicesDone = [];
            }

            var qno = Math.floor(Math.random()*100) % choices.length;            
            currentQuestion = choices[qno];
            choicesDone.push(currentQuestion);

            choices.splice(qno, 1);

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
            if(cqLeftIsAlive != "end"){
                cqLeftHealthChange = cqlr[cqLeftResponse][2];
                cqLeftMoneyChange = cqlr[cqLeftResponse][1];
            }
            else
            {
                cqLeftHealthChange = -playerHealth;
                cqLeftMoneyChange = -playerWealth;
            }
            
            cqRightResponse = Object.keys(cqrr)[0];
            cqRightIsAlive = cqrr[cqRightResponse][0];
            if(cqRightIsAlive != "end") 
            {
                cqRightHealthChange = cqrr[cqRightResponse][2];
                cqRightMoneyChange = cqrr[cqRightResponse][1];
            }
            else
            {
                cqRightHealthChange = -playerHealth;
                cqRightMoneyChange = -playerWealth;
            }            

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
        var cameraTargetY = playerObject.position.y + cameraFinalY;

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

function fade(element) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.5;
    }, 50);
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


init();