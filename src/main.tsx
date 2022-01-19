import ReactDOM from 'react-dom'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";


function minecraft_world() {
  const scene = new THREE.Scene()
  scene.add(new THREE.AxesHelper(5))
  scene.background = new THREE.Color("#212121")


  // const light = new THREE.SpotLight();
  // light.position.set(100, 100, 100)
  const light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add(light);

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

  const loader = new GLTFLoader()
  loader.load(
    '../models/blender-model/untitled.glb',
    function (gltf) {
      gltf.scene.traverse(function (child) {
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
      scene.add(gltf.scene)
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

  function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
    stats.update()
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
