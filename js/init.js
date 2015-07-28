var scene, camera, renderer, controls, stats;    
var lights = [];
var tree = [];
var lightHeight = 250;
var mountainWidth = 500;
var worldWidth = 64;
var terrain = [];
var firefliesNumber = 40;
var fireflies;
var firefliesCoordianteX = [];
var firefliesCoordianteY = [];
var firefliesCoordianteZ = [];
var starParticle;
var boxSize = 5000;
var firefliesUpperBoundary = 55;
var lightDistance = 30;
var clock = new THREE.Clock();
$(document).ready(function(){

    scene = new THREE.Scene();

    //////////
    //camera//
    //////////


    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 100000 );
    camera.position.set(0, 300, -500);
    ////////////
    //renderer//
    ////////////

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x000000, 1);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.autoClear = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;


    document.body.appendChild( renderer.domElement );

    ////////////
    //mountain//
    ////////////


    
    var smoothinFactor = 0;
    var treeNumber = 200;

    var geometry = new THREE.PlaneGeometry( mountainWidth, mountainWidth, worldWidth - 1, worldWidth - 1 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    var grassTex = THREE.ImageUtils.loadTexture('img/grass.png');
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.x = 16;
    grassTex.repeat.y = 16;


    var mountainMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe:false, side:THREE.DoubleSide, map:grassTex } );
    mountain = new THREE.Mesh( geometry, mountainMaterial  );
    generateHeight(worldWidth, smoothinFactor, treeNumber);
    
    mountain.receiveShadow = true;
    mountain.castShadow = true;
    scene.add( mountain );


    //////////
    //skybox//
    //////////

    var skyGeometry = new THREE.BoxGeometry( boxSize, boxSize, boxSize );   
    
    var skyMaterial = new THREE.MeshBasicMaterial({color:0x000000});
    
    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    scene.add( skyBox );
    


    ////////
    //info//
    ////////

    info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '30px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.style.color = '#fff';
    info.style.fontWeight = 'bold';
    info.style.backgroundColor = 'transparent';
    info.style.zIndex = '1';
    info.style.fontFamily = 'Monospace';
    info.innerHTML = 'Fireflies Generator Project by johnhckuo';
    document.body.appendChild( info );

    ////////
    //Stat//
    ////////

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '20px';
    stats.domElement.style.left = '20px';
    document.body.appendChild(stats.domElement);

    ////////////
    //CONTROLS//
    ////////////

    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.rotateSpeed = 0.1;
    controls.zoomSpeed = 2.2;
    controls.panSpeed = 0.2;
     
    controls.noZoom = false;
    controls.noPan = false;
     
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.3;
     
    controls.minDistance = 0.1;
    controls.maxDistance = mountainWidth/2;
     
    controls.keys = [ 16, 17, 18 ]; // [ rotateKey, zoomKey, panKey ] 


    /////////
    //panel//
    /////////

    var gui = new dat.GUI({
        height : 5 * 32 - 1
    });

    var params = {
        TreeNumber: treeNumber,
        Smooth : smoothinFactor,
        FirefliesNumber : firefliesNumber,
        BasicMaterial : false,
        Wireframe : false,
        FirstPerson : false,
        LightDistance : lightDistance
    };


    var button = { Regenerate:function(){ generateHeight(worldWidth, smoothinFactor, treeNumber); }};
    gui.add(button,'Regenerate');

    gui.add(params, 'Smooth').min(0).max(1000).step(1).onFinishChange(function(){
        //smoothinFactor = params.Smooth;
        //generateHeight(worldWidth, smoothinFactor, boundaryHeight, treeNumber);
        alert("This function isn't available yet");
        params.Smooth = 0;
    });

    gui.add(params, 'TreeNumber').min(0).max(300).step(1).onFinishChange(function(){
        treeNumber = params.TreeNumber;
        generateHeight(worldWidth, smoothinFactor, treeNumber);
    });

    gui.add(params, 'Wireframe').onFinishChange(function(){
        
        if(params.Wireframe == true){

            mountain.material.wireframe = true;
            for (var i = 0 ; i < tree.length ; i ++){
                tree[i].material = new THREE.MeshFaceMaterial([
                    new THREE.MeshBasicMaterial({ color: 0x3d2817, wireframe:params.Wireframe}), // brown
                    new THREE.MeshBasicMaterial({ color: 0x2d4c1e, wireframe:params.Wireframe}), // green
                ]);;
            }
        }
        else{

            mountain.material.wireframe = false;
            for (var i = 0 ; i < tree.length ; i ++){
                tree[i].material = new THREE.MeshFaceMaterial([
                    new THREE.MeshLambertMaterial({ color: 0x3d2817, wireframe:params.Wireframe}), // brown
                    new THREE.MeshLambertMaterial({ color: 0x2d4c1e, wireframe:params.Wireframe}), // green
                ]);;
            }
        }
    });

    gui.add(params, 'BasicMaterial').onFinishChange(function(){
        
        if(params.BasicMaterial == true){

            mountain.material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe:params.Wireframe, side:THREE.DoubleSide} );
            mountain.receiveShadow = false;
            mountain.castShadow = false;

            for (var i = 0 ; i < tree.length ; i ++){
                tree[i].material = new THREE.MeshFaceMaterial([
                    new THREE.MeshBasicMaterial({ color: 0x3d2817, wireframe:params.Wireframe}), // brown
                    new THREE.MeshBasicMaterial({ color: 0x2d4c1e, wireframe:params.Wireframe}), // green
                ]);;
            }
        }
        else{
            var grassTex = THREE.ImageUtils.loadTexture('img/grass.png');
            grassTex.wrapS = THREE.RepeatWrapping;
            grassTex.wrapT = THREE.RepeatWrapping;
            grassTex.repeat.x = 16;
            grassTex.repeat.y = 16;
            mountain.material = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe:params.Wireframe, side:THREE.DoubleSide, map:grassTex } );
            mountain.receiveShadow = true;
            mountain.castShadow = true;

            for (var i = 0 ; i < tree.length ; i ++){
                tree[i].material = new THREE.MeshFaceMaterial([
                    new THREE.MeshLambertMaterial({ color: 0x3d2817, wireframe:params.Wireframe}), // brown
                    new THREE.MeshLambertMaterial({ color: 0x2d4c1e, wireframe:params.Wireframe}), // green
                ]);;
            }
        }
    });

    gui.add(params, 'FirstPerson').onFinishChange(function(){
        if(params.FirstPerson == true){
            setControlsFirstPerson();
        }else{
            setControlsOrbit();
        }


    });



    gui.add(params, 'FirefliesNumber').min(0).max(firefliesUpperBoundary).step(1).onFinishChange(function(){
        firefliesNumber = params.FirefliesNumber;
        buildFireflies(firefliesNumber, false);
    });

    gui.add(params, 'LightDistance').min(0).max(50).step(10).onFinishChange(function(){
        lightDistance = params.LightDistance;
        modifyDistance(lightDistance);
    });



    ////////
    //star//
    ////////

    createStar('normal');

    /////////////
    //fireflies//
    /////////////

    buildFireflies(firefliesNumber, true);

    ////////////////////////
    //subtle ambient light//
    ////////////////////////
    
    var ambientLight = new THREE.AmbientLight(0x191970);
    scene.add(ambientLight);

    ////////
    //test//
    ////////

    //material = new THREE.ParticleMaterial( { color: 0xffffff} );
        // make the particle
    //console.log(fireflies.materials[ 0 ].color.setHex( 0xff0000 ))
    

    ///////////
    //animate//
    ///////////

    var render = function () {
        
        requestAnimationFrame( render );
        renderer.render(scene, camera);
        controls.update(clock.getDelta()); //for cameras

        if (camera.position.y != 10 && controls instanceof THREE.FirstPersonControls)
            camera.position.y = 10;

        stats.update();
        //lightUpdate();
        lightUpdate(firefliesNumber);


    };

    render();
    window.addEventListener('resize', onWindowResize, false);
});


function lightUpdate(number){
    // update lights

    var time = Date.now() * 0.0005;
    var x, y, z;

    var flyHeight = 15;

    fireflies.geometry.verticesNeedUpdate = true;

    for ( var i = 0, il = number; i < il; i ++ ) {

        var light = lights[ i ];

        if ( i > 0 ) {

            x = firefliesCoordianteX[i] + Math.sin( time + i * 1.7 ) * 80;
            //y = Math.cos( time + i * 1.5 ) * 40;
            y = firefliesCoordianteY[i] + flyHeight + Math.cos( time + i * 1.5 ) * flyHeight;
            z = firefliesCoordianteZ[i] + Math.cos( time + i * 1.3 ) * 30;

        } else {

            x = firefliesCoordianteX[i] + Math.sin( time * 3 ) * 20;
            y = firefliesCoordianteY[i] + flyHeight + Math.cos( time + i * 1.5 ) * flyHeight;
            z = firefliesCoordianteZ[i] + Math.cos( time * 3 ) * 25 + 10;

        }

        light.position.x = x;  
        light.position.y = y;  
        light.position.z = z; 

        fireflies.geometry.vertices[i].x = light.position.x;
        fireflies.geometry.vertices[i].y = light.position.y;
        fireflies.geometry.vertices[i].z = light.position.z;
    }
}

function buildFireflies(number, init){

/*


    if (lights != null){
        for (var i  = 0 ; i< lights.length ; i++){
            lights[i].intensity = 0;
        }
        lights = [];
    }

    if (firefliesCoordianteY != null){

        firefliesCoordianteX = [];
        firefliesCoordianteY = [];
        firefliesCoordianteZ = [];
    }
*/
    var firefliesGeometry = new THREE.Geometry();
    var material = new THREE.PointCloudMaterial( { size: 0.1, color:0xffff00 } );

    if (init == true){

        for(var i = 0; i < firefliesUpperBoundary; i++) {

            var randomPosition = Math.ceil(Math.random()*(worldWidth-1)*(worldWidth-1));

            var vertex = new THREE.Vector3();

            vertex.x = mountain.geometry.vertices[randomPosition].x;
            vertex.y = mountain.geometry.vertices[randomPosition].y;
            vertex.z = mountain.geometry.vertices[randomPosition].z;


            //firefliesGeometry.vertices.push( vertex );

            firefliesCoordianteX.push(vertex.x);
            firefliesCoordianteY.push(vertex.y+1);
            firefliesCoordianteZ.push(vertex.z);

            //sunLight.castShadow = true;
            var light = new THREE.PointLight( 0xffffff, 0, lightDistance );
            light.position.set(vertex.x, vertex.y, vertex.z);
            lights.push(light);
            scene.add(light);
        }
        for ( var i = 0 ; i < firefliesNumber ; i ++){
            lights[i].intensity = 1;

            var randomPosition = Math.ceil(Math.random()*(worldWidth-1)*(worldWidth-1));

            var vertex = new THREE.Vector3();
            vertex.x = mountain.geometry.vertices[randomPosition].x;
            vertex.y = mountain.geometry.vertices[randomPosition].y;
            vertex.z = mountain.geometry.vertices[randomPosition].z;
            firefliesGeometry.vertices.push( vertex );

        }



    }else{
        for (var i = 0 ; i < lights.length ; i++){
            lights[i].intensity = 0;

        }

        scene.remove(fireflies);
        firefliesGeometry = new THREE.Geometry();;

        for (var i = 0 ; i < number ; i++){
            lights[i].intensity = 1;
            firefliesGeometry.vertices.push(lights[i].position);
        }


    }
    fireflies = new THREE.PointCloud( firefliesGeometry, material );    


    //create mesh and add to scene
    scene.add(fireflies);

    //var particle =fireflies.vertices[0];
    //alert(fireflies.vertices.length)
}

function buildTree() {


    var treeMaterial = new THREE.MeshFaceMaterial([
        new THREE.MeshLambertMaterial({ color: 0x3d2817, wireframe:false}), // brown
        new THREE.MeshLambertMaterial({ color: 0x2d4c1e, wireframe:false }), // green
    ]);

    var c0 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6, 1, true));
    c0.position.y = 6;
    var c1 = new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 14, 8));
    c1.position.y = 18;
    var c2 = new THREE.Mesh(new THREE.CylinderGeometry(0, 9, 13, 8));
    c2.position.y = 25;
    var c3 = new THREE.Mesh(new THREE.CylinderGeometry(0, 8, 12, 8));
    c3.position.y = 32;

    var g = new THREE.Geometry();
    c0.updateMatrix();
    c1.updateMatrix();
    c2.updateMatrix();
    c3.updateMatrix();
    g.merge(c0.geometry, c0.matrix);
    g.merge(c1.geometry, c1.matrix);
    g.merge(c2.geometry, c2.matrix);
    g.merge(c3.geometry, c3.matrix);

    var b = c0.geometry.faces.length;
    for (var i = 0, l = g.faces.length; i < l; i++) {
      g.faces[i].materialIndex = i < b ? 0 : 1;
    }

    var m = new THREE.Mesh(g, treeMaterial);

    m.scale.x = m.scale.z = 3;
    m.scale.y = 5;
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
}

function generateHeight(worldWidth, smoothinFactor, treeNumber){
    var terrainGeneration = new TerrainBuilder(worldWidth, worldWidth, worldWidth, smoothinFactor);
    terrain = terrainGeneration.diamondSquare();

    mountain.geometry.verticesNeedUpdate = true;
    mountain.geometry.normalsNeedUpdate = true;

    var index = 0;
    for(var i = 0; i < worldWidth; i++) {
        for(var j = 0; j < worldWidth; j++) {
            mountain.geometry.vertices[index].y = terrain[i][j];
            index++;
        }
    }

    

    //build tree
    if (tree != null){
        for (var i = 0 ; i <tree.length ; i++){
            scene.remove(tree[i]);
        }
    }



    for(var i = 0; i < treeNumber; i++) {
        tree[i] = buildTree();
        var randomPosition = Math.ceil(Math.random()*(worldWidth-1)*(worldWidth-1));
        tree[i].position.x = mountain.geometry.vertices[randomPosition].x;
        tree[i].position.y = mountain.geometry.vertices[randomPosition].y;
        tree[i].position.z = mountain.geometry.vertices[randomPosition].z;
        tree[i].scale.set(0.8,0.8,0.8)
        scene.add(tree[i])
 
        
    }


  

}

function createStar(type) {
    var starNumber;
    scene.remove(starParticle);
    if (type == 'max'){
        starNumber = 500;
    }else if ( type == 'normal'){
        starNumber = 250
    }else if (type == 'min'){
        starNumber = 150;
    }else{
        starNumber = 0;
    }


    var geometry = new THREE.Geometry();
    var material = new THREE.PointCloudMaterial( { size: 1 } );
    //top
    for (var i = 0; i < starNumber; i++) 
    {
        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * boxSize - boxSize/2;
        vertex.y = boxSize/2 -2;
        vertex.z = Math.random() * boxSize - boxSize/2;

        geometry.vertices.push( vertex );
         //sunLight.castShadow = true;
    

    //north

        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * boxSize - boxSize/2;
        vertex.y = Math.random() * boxSize - boxSize/2;
        vertex.z = boxSize/2 -1;

        geometry.vertices.push( vertex );
        //sunLight.castShadow = true;
    

    //west
        var vertex = new THREE.Vector3();
        vertex.x = boxSize/2 -1;
        vertex.y = Math.random() * boxSize - boxSize/2;
        vertex.z = Math.random() * boxSize - boxSize/2;

        geometry.vertices.push( vertex );
        //sunLight.castShadow = true;
    

    //south

        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * boxSize - boxSize/2;
        vertex.y = Math.random() * boxSize - boxSize/2;
        vertex.z = -boxSize/2 +1;

        geometry.vertices.push( vertex );
                //sunLight.castShadow = true;
    

    //east

        var vertex = new THREE.Vector3();
        vertex.x = -boxSize/2 +1;
        vertex.y = Math.random() * boxSize - boxSize/2;
        vertex.z = Math.random() * boxSize - boxSize/2;

        geometry.vertices.push( vertex );
        //sunLight.castShadow = true;
    }

    starParticle = new THREE.PointCloud( geometry, material );   
    //create mesh and add to scene
    scene.add(starParticle);

    

}

function modifyDistance(distance){
    for (var i = 0 ; i <lights.length ; i++){
        lights[i].distance = distance;
    }
}


function setControlsFirstPerson() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100000 );
    camera.position.set( 0, 10, 0 );
    controls = new THREE.FirstPersonControls(camera);
    controls.lookSpeed = 0.2;
    controls.movementSpeed = 20;
    controls.noFly = true;



}


function setControlsOrbit() {


    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 100000 );
    camera.position.set(0, 300, -500);

    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.rotateSpeed = 0.1;
    controls.zoomSpeed = 2.2;
    controls.panSpeed = 0.2;
     
    controls.noZoom = false;
    controls.noPan = false;
     
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.3;
     
    controls.minDistance = 0.1;
    controls.maxDistance = mountainWidth/2;
     
    controls.keys = [ 16, 17, 18 ]; // [ rotateKey, zoomKey, panKey ] 
}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}
