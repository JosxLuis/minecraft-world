import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";


//-----------------------------------------------------------
//-- Create scene's base
//-----------------------------------------------------------
function create_scene() {
    const scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(5));
    scene.background = new THREE.Color();
    return scene
}


//-----------------------------------------------------------
//-- Create camera
//-----------------------------------------------------------
function create_camera() {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(-34.907, -49.676, 22.583);
  return camera
}


//-----------------------------------------------------------
//-- Create renderer
//-----------------------------------------------------------
function create_renderer() {
  const renderer = new THREE.WebGLRenderer({antialias: false});
  // renderer.physicallyCorrectLights = true
  // renderer.shadowMap.enabled = true
  // renderer.outputEncoding = THREE.sRGBEncoding
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  return renderer
}


//-----------------------------------------------------------
//-- Create controls
//-----------------------------------------------------------
function create_controls(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.zoomSpeed = 1.5;
  return controls
}


//-----------------------------------------------------------
//-- Create stats
//-----------------------------------------------------------
function create_stats() {
  const stats = Stats();
  document.body.appendChild(stats.dom);
  return stats
}


//-----------------------------------------------------------
//-- Add light to scene
//-----------------------------------------------------------
function load_light(scene: THREE.Scene): void {
  const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(light);
}


//-----------------------------------------------------------
//-- Loads minecraft world audio
//-----------------------------------------------------------
function load_audio(camera: THREE.PerspectiveCamera): void {
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const sound = new THREE.Audio( listener );
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load(window.location.origin + '/music/minecraft-music.ogg', function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop( true );
    sound.setVolume( 0.5 );
    sound.play();
  });
}


//-----------------------------------------------------------
//-- Loads blender model
//-----------------------------------------------------------
var mixer: THREE.AnimationMixer;

function load_blender(scene: THREE.Scene, path: string): void {
  const loader = new GLTFLoader();

  loader.load(
    path,
    function (gltf) {

      var model = gltf.scene;
      var animations = gltf.animations;
      mixer = new THREE.AnimationMixer(model);

      animations.forEach(function(clip) {
	      mixer.clipAction(clip).play();
      });

      scene.add(model)
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
      console.log(error)
    }
  );
}


//-----------------------------------------------------------
//-- Creates scene's day system
//-----------------------------------------------------------
function day_system(scene: THREE.Scene, duration: number, time: number, colors: THREE.Color[]): void {
    const f = Math.floor(duration / colors.length);
    const i1 = Math.floor((time / f) % colors.length);
    let i2 = i1 + 1;

    if (i2 === colors.length) i2 = 0;
    const color1 = colors[i1];
    const color2 = colors[i2];
    const a = (time / f) % colors.length % 1;

    if (scene?.background) {
      // @ts-ignore
      scene.background.copy(color1);
      // @ts-ignore
      scene.background.lerp(color2, a);
    }
}


//-----------------------------------------------------------
//-- Initialize minecraft world!
//-----------------------------------------------------------
function minecraft_world() {

  // Create scene and load light
  var scene = create_scene();
  load_light(scene);
  load_blender(scene, window.location.origin + "/models/blender-model/minecraft-world.glb");


  // Create camera and load audio
  var camera = create_camera();
  load_audio(camera);


  // Create stats
  var stats = create_stats();


  // Create renderer
  var renderer = create_renderer();


  // Create controls
  var controls = create_controls(camera, renderer);


  // Define variables for day system function
  var clock = new THREE.Clock();
  const duration = 46;
  const colors: THREE.Color[] = [
    new THREE.Color("#88CEEB"),
    new THREE.Color("#88CEEB"),
    new THREE.Color("#88CEEB"),
    new THREE.Color("#88CEEB"),
    new THREE.Color("#88CEEB"),
    new THREE.Color("#000000"),
    new THREE.Color("#000000"),
    new THREE.Color("#000000"),
    new THREE.Color("#000000"),
    new THREE.Color("#000000")
  ];

  // Resize scene depending on the size of the window
  window.addEventListener('resize', onWindowResize, false)
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
  }


  // Render scene, animations, controls stats and day's system
  function animate() {
    requestAnimationFrame(animate)
    controls.update()
    if (mixer) mixer.update(clock.getDelta());
    renderer.render(scene, camera)
    stats.update()
    day_system(scene, duration, clock.getElapsedTime(), colors)
  }


  // Call animate to render minecraft world
  animate()
}


//-----------------------------------------------------------
//-- Initialize scene in Three.js
//-----------------------------------------------------------
minecraft_world()
