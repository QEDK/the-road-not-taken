import * as THREE from 'https://unpkg.com/three@0.121.1/build/three.module.js';
import {FBXLoader} from 'https://unpkg.com/three@0.121.1/examples/jsm/loaders/FBXLoader.js';
import {OrbitControls} from 'https://unpkg.com/three@0.121.1/examples/jsm/controls/OrbitControls.js';

var clock = new THREE.Clock();
let scene, camera, renderer, orbitControl;
var walk = false; 
var playerObject, playerMixer, textFont, player;
var yoffset = -100;
var walkscale = 150;
var zoffset = walkscale/2;
var noOfPlanes = 5;
var currPlane = 0;
var planesDrawn = 0;
var duration = 1.3333;
var zoomIteration = 0; 
var zoomStart = false;

var planes = [];

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 2000);
    camera.position.set(90, 700, -1000);
    // camera.position.set(90,100,-400);
    // camera.rotation.y = -60/180 * Math.PI; 
    renderer = new THREE.WebGLRenderer({alpha: true, antialias:true});

    orbitControl = new OrbitControls(camera, renderer.domElement);
    orbitControl.addEventListener('change', animate);


    // renderer.setClearColor("#555555");
    renderer.setSize(window.innerWidth, window.innerHeight);

    // scene.background = new THREE.Color( 0xa0a0a0 );
	// scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );

    var hemiLight = new THREE.HemisphereLight( 0xffffbb,  0xffffff, .3 );
    scene.add( hemiLight );

    var shadowLight = new THREE.DirectionalLight(0xffffff, .8);
    shadowLight.position.set(1, 1, 1);
 	scene.add(shadowLight);

	// var directionLight = new THREE.DirectionalLight( 0xffffff );
	// directionLight.position.set( 0, 1000, -1000 );
	// directionLight.castShadow = true;
	// directionLight.shadow.camera.top = 100;
	// directionLight.shadow.camera.bottom = - 400;
	// directionLight.shadow.camera.left = - 100;
	// directionLight.shadow.camera.right = 400;
    // scene.add( directionLight );
     
    scene.add(new THREE.AmbientLight(0x777777))

    var container = document.getElementById('world');
    container.appendChild(renderer.domElement);
    // document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', ()=>{
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth/ window.innerHeight;
        camera.updateProjectionMatrix();
    });

    init_keypress();
    init_loader();
}

function init_keypress(){
    document.addEventListener('keypress', function(event) {
        if(event.key == ' ') {
            if(!zoomStart)
            {
                zoomStart = true;
            }
            else
            walk = !walk;
        }
        if(event.key == 'r') {
            player.rotation.y += Math.PI/2;
        }
    });
}

function pause(milliseconds) {
	var dt = new Date();
	while ((new Date()) - dt <= milliseconds) { /* Do nothing */ }
}

function init_loader(){
    var playerLoader = new FBXLoader();
    playerLoader.load('../3d_assets/Dave/Dave.fbx', function(object3d){
        playerObject = object3d;
        playerObject.scale.set(0.3,0.3,0.3);
        playerObject.position.y += yoffset;
        playerObject.position.z = walkscale / 2;
        playerMixer = new THREE.AnimationMixer(object3d);
        var action = playerMixer.clipAction(object3d.animations[0]);
        action.play();
        scene.add(playerObject);
        playerMixer.update(0);
        playerObject.updateMatrix();
        renderer.render(scene, camera);
        animate();
        planesDrawn = 6;
        for(var i = -2; i <7; i++)
        {
            addPlane(i, "Level Name");
        }
        zoomStart = true;
        // setTimeout(init_cameraMove(0), 3000);
    });

    var fontlink = 'https://unpkg.com/three@0.121.1//examples/fonts/helvetiker_regular.typeface.json';
    
    var textLoader = new THREE.FontLoader();
    textLoader.load(fontlink, (font)=>{
        textFont = font;
    });

}

function animate(){
    
    if(zoomIteration < 100 && zoomStart)
    {
        // camera.position.x += 3;
        camera.position.y -= 6;
        camera.position.z += 6;
        zoomIteration++;
        
        // camera.rotation.x -= Math.PI/1200;
        camera.rotation.y = -60/(180*100) * Math.PI; 
        if(zoomIteration%50==0)
        {
            console.log(zoomIteration);
            console.log(camera.position);
            
        }
        // if(zoomIteration%10==0)
        // orbitControl.update();
        if(zoomIteration == 99)
        walk = true;
    }

    var delta = clock.getDelta();
    if ( playerMixer && walk){
        playerMixer.update( delta );
        playerObject.position.z += 3; 
        camera.position.z += 3;
    }

    camera.lookAt (playerObject.position);

    playerObject.updateMatrix();
    renderer.render(scene, camera);

    currPlane = (Math.floor(playerObject.position.z / walkscale));
    if(planesDrawn - currPlane < noOfPlanes)
    {
        planesDrawn++;
        addPlane(planesDrawn, "Level Name");
    }

    requestAnimationFrame(animate);
}

function addPlane(levelNo, levelName)
{
    var text = `Level ${levelNo}\n${levelName}`;
    if(levelNo <= 0) text = "";
    var geo = new THREE.TextGeometry(
        text,
        {
            font: textFont,
            size: 10,
            height: 10
        }
    );
    geo.computeBoundingBox();
    geo.computeVertexNormals();
    let centreOffset = 0.5 * ( geo.boundingBox.max.x - geo.boundingBox.min.x );
    let textmat = new THREE.MeshBasicMaterial({color:0x3d3d3d, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(geo, textmat);
    mesh.position.x = centreOffset;
    mesh.position.z = walkscale * levelNo + zoffset;
    mesh.rotation.y = Math.PI;
    mesh.position.y = yoffset + ( geo.boundingBox.max.y - geo.boundingBox.min.y );;

    let planemat = new THREE.MeshBasicMaterial({color:0xf5f5f5, side: THREE.DoubleSide});
    var planegeo = new THREE.PlaneGeometry(walkscale-5, walkscale-5);
    var plane = new THREE.Mesh(planegeo, planemat);
    plane.rotation.x = Math.PI/2;
    // plane.position.x = centreOffset;
    plane.position.z = walkscale * levelNo + zoffset + 5;
    plane.position.y = yoffset;
    scene.add(plane);
    scene.add(mesh); //add text
}



init();