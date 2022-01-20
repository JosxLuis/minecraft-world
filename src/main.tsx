import ReactDOM from 'react-dom'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";


function minecraft_world() {
  const scene = new THREE.Scene()
  scene.add(new THREE.AxesHelper(5))
  scene.background = new THREE.Color()

  // Day and night
  var clock = new THREE.Clock();

  const colors = [
    new THREE.Color("#88CEEB"),
    new THREE.Color("#88CEEB"),
    new THREE.Color("#000000"),
    new THREE.Color("#000000"),
  ];

  const duration = 20; // 4s


  // const light = new THREE.SpotLight();
  // light.position.set(100, 100, 100)
  const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
  scene.add( light );// soft white light

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )

  // Sound
  // create an AudioListener and add it to the camera
  const listener = new THREE.AudioListener();
  camera.add( listener );

  // create a global audio source
  const sound = new THREE.Audio( listener );

  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load( '../music/minecraft-music.ogg', function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop( true );
    sound.setVolume( 0.5 );
    sound.play();
  });

  camera.position.set(0, 40, 10);

  const renderer = new THREE.WebGLRenderer({antialias: false})
  // renderer.physicallyCorrectLights = true
  // renderer.shadowMap.enabled = true
  // renderer.outputEncoding = THREE.sRGBEncoding
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.zoomSpeed = 1.5;


  const loader = new GLTFLoader()
  loader.load(
    '../models/blender-model/untitled.glb',
    function (gltf) {

      var model = gltf.scene;
      var animations = gltf.animations;
      const mixer = new THREE.AnimationMixer(model);

      model.traverse(function (child) {
        if ( child.isMesh ) {
          // child.castShadow = true;
          // child.receiveShadow = true;
          // child.geometry.computeVertexNormals();
        }
        // if ((child as THREE.Light).isLight) {
        //   const l = child as THREE.Light
        //   l.castShadow = true
        //   l.shadow.bias = -0.003
        //   l.shadow.mapSize.width = 2048
        //   l.shadow.mapSize.height = 2048
        // }
      })

      scene.add(model)

      animations.forEach(function(clip) {
	      mixer.clipAction(clip).play();
      });
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
      console.log(error)
    }
  )

  window.addEventListener('resize', onWindowResize, false)
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
  }

  const stats = Stats()
  document.body.appendChild(stats.dom)


  function animateBackground(t) {
    const f = Math.floor(duration / colors.length);
    const i1 = Math.floor((t / f) % colors.length);
    let i2 = i1 + 1;

    if (i2 === colors.length) i2 = 0;
    const color1 = colors[i1];
    const color2 = colors[i2];
    const a = (t / f) % colors.length % 1;

    scene.background.copy(color1);
    scene.background.lerp(color2, a);
  }

  function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
    stats.update()
    const time = clock.getElapsedTime();
    animateBackground(time)
  }

  function render() {
    renderer.render(scene, camera)
  }

  animate()
}

ReactDOM.render(
  minecraft_world(),
  document.getElementById('root')
)
