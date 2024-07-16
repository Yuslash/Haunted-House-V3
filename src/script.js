import * as THREE from 'three'
import { OrbitControls, Timer } from 'three/examples/jsm/Addons.js'
import { Sky } from 'three/examples/jsm/Addons.js'
import { FontLoader } from 'three/examples/jsm/Addons.js'
import { TextGeometry } from 'three/examples/jsm/Addons.js'
import * as CANNON from 'cannon-es'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import GUI from 'lil-gui'

// Debug flag
const gui = new GUI()

/**
 * Canvas
*/
const canvas = document.querySelector('canvas.webgl')

/**
 * scene
*/
const scene = new THREE.Scene()

/**
 * Models
 */

let mixer = null

const gltfLoader = new GLTFLoader()
gltfLoader.load(
    '/fox/Fox.gltf',
    (gltf)=>{

        gltf.scene.scale.setScalar(0.02)
        gltf.scene.position.set(-2,0,5)
        gltf.scene.rotation.y = 1

        mixer = new THREE.AnimationMixer(gltf.scene)
        const action = mixer.clipAction(gltf.animations[0])

        action.play()

        scene.add(gltf.scene)
    }
)


/**
 * sky
 */
const sky = new Sky()
sky.scale.setScalar(100)
scene.add(sky)

sky.material.uniforms['turbidity'].value = 10
sky.material.uniforms['rayleigh'].value = 3
sky.material.uniforms['mieCoefficient'].value = 0.1
sky.material.uniforms['mieDirectionalG'].value = 0.95
sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)



/**
 * Textures Loader
 */
const textureloader = new THREE.TextureLoader()

//fontloaders
const fontloader = new FontLoader()
fontloader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        const textGeometry = new TextGeometry(
            'Sibikrishna',
            {
                font: font,
                size: 1,
                depth: 0.2
            }
        )
        const text = new THREE.Mesh(
            textGeometry, new THREE.MeshStandardMaterial({
                map: textTextures
            })
        )
        textGeometry.center()
        text.position.x = -4.505
        text.position.y = 0.5
        text.position.z = 2.379
        text.rotation.y = 1
        // gui.add(text.position, 'x').min(-10).max(10).step(0.001)
        // gui.add(text.position, 'y').min(-10).max(10).step(0.001)
        // gui.add(text.position, 'z').min(-10).max(10).step(0.001)

        // gui.add(text.rotation, 'x').min(-10).max(10).step(0.001)
        // gui.add(text.rotation, 'y').min(-10).max(10).step(0.001)
        // gui.add(text.rotation, 'z').min(-10).max(10).step(0.001)

        textTextures.castShadow = true
        textTextures.receiveShadow = true

    

        textTextures.colorSpace = THREE.SRGBColorSpace
        textTextures.castShadow = true
        textTextures.receiveShadow = true
        textTextures.repeat.set(1, 1)
        textTextures.wrapS = THREE.RepeatWrapping
        textTextures.wrapT = THREE.RepeatWrapping

        scene.add(text)
    }
)


const textTextures = textureloader.load('/halloween/images.webp')



/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("#86cdff" , 0.275)
const directionalLight = new THREE.DirectionalLight("#86cdff" , 0.5)
directionalLight.position.set(3,2,-8)
scene.add(ambientLight,directionalLight)

/**
 * objects
 */
const house  = new THREE.Group()
scene.add(house)

//floor texture
const floorAlphaTexture = textureloader.load('/floor/alpha.webp')
const floorColorTexture = textureloader.load('/floor/snow_field_aerial_col_1k.webp')
const floorARMTexture = textureloader.load('/floor/snow_field_aerial_arm_1k.webp')
const floorNormalTexture = textureloader.load('/floor/snow_field_aerial_nor_gl_1k.webp')

//floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20,20,100,100),
    new THREE.MeshStandardMaterial({
        map : floorColorTexture,
        transparent : true,
        alphaMap : floorAlphaTexture,
        aoMap : floorARMTexture,
        normalMap : floorNormalTexture,
        roughnessMap : floorARMTexture,
        metalnessMap: floorARMTexture,
        // displacementBias: -0.2,
        // displacementScale: 0.3
    })
    
)
floorColorTexture.colorSpace = THREE.SRGBColorSpace
// floorColorTexture.repeat.set(8,8)
// floorColorTexture.wrapS = THREE.RepeatWrapping
// floorColorTexture.wrapT = THREE.RepeatWrapping

floor.rotation.x = - Math.PI / 2

//wall textures
const wallsColorTexture = textureloader.load('/walls/dark_brick_wall_diff_1k.webp')
const wallsARMTexture = textureloader.load('/walls/dark_brick_wall_arm_1k.webp')
const wallsNormalTexture = textureloader.load('/walls/dark_brick_wall_nor_gl_1k.webp')


const wall = new THREE.Mesh(
    new THREE.BoxGeometry(4,2.5,4),
    new THREE.MeshStandardMaterial({
        map: wallsColorTexture,
        aoMap: wallsARMTexture,
        normalMap: wallsNormalTexture,
        roughnessMap: wallsARMTexture,
        metalnessMap: wallsARMTexture
    })
)
wallsColorTexture.colorSpace = THREE.SRGBColorSpace
wall.position.y = 1.25


//doof texture
const doorAlphaTexture = textureloader.load('/door/alpha.webp')
const doorColorTexture = textureloader.load('/door/color.webp')
const doorAOMApTexture = textureloader.load('/door/ambientOcclusion.webp')
const doorHeightTexture = textureloader.load('/door/height.webp')
const doorRoughnessTexture = textureloader.load('/door/roughness.webp')
const doorMetalnessTexture = textureloader.load('/door/metalness.webp')
// const doorARMTexture = textureloader.load('/door/ambientOcclusion.webp')
const doorNormalTexture = textureloader.load('/door/normal.webp')


const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2,2.2,100,100),
    new THREE.MeshStandardMaterial({
        map : doorColorTexture,
        transparent : true,
        alphaMap : doorAlphaTexture,
        aoMap : doorAOMApTexture,
        roughnessMap : doorRoughnessTexture,
        metalnessMap : doorMetalnessTexture,
        normalMap : doorNormalTexture,
        displacementMap : doorHeightTexture,
        displacementBias: - 0.04,
        displacementScale: 0.15
    })
)
doorColorTexture.colorSpace = THREE.SRGBColorSpace
door.position.y = 1
door.position.z = 2 + 0.01

//door ligh
const doorLight = new THREE.PointLight("#ff7d46",5)
doorLight.position.set(0,2.2,2.5)
scene.add(doorLight)

//roof textures
const roofColorTexture = textureloader.load('/roof/clay_roof_tiles_02_diff_1k.webp')
const roofARMTexture = textureloader.load('/roof/clay_roof_tiles_02_arm_1k.webp')
const roofNormalTexture = textureloader.load('/roof/clay_roof_tiles_02_nor_gl_1k.webp')


const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5,1.5,4,100,100),
    new THREE.MeshStandardMaterial({
        map: roofColorTexture,
        aoMap: roofARMTexture,
        normalMap: roofNormalTexture,
        roughnessMap: roofARMTexture,
        metalnessMap: roofARMTexture,
        side : THREE.DoubleSide
    })
)
roofColorTexture.colorSpace = THREE.SRGBColorSpace
roofColorTexture.repeat.set(3,1)
roofColorTexture.wrapS = THREE.RepeatWrapping
roofColorTexture.wrapT = THREE.RepeatWrapping

roof.rotation.y = Math.PI / 4
roof.position.y = 2.5 + 0.50

house.add(floor,wall,door,roof)

//bush texture
const bushColorTexture = textureloader.load('/bush/snow_02_diff_1k.webp')
const bushARMTexture = textureloader.load('/bush/snow_02_arm_1k.webp')
const bushNormalTexture = textureloader.load('/bush/snow_02_nor_gl_1k.webp')

const bushGeometry  = new THREE.SphereGeometry(1,16,16)
const bushMaterial = new THREE.MeshStandardMaterial({
    map : bushColorTexture,
    aoMap : bushARMTexture,
    normalMap : bushNormalTexture,
    roughnessMap : bushARMTexture,
    metalnessMap: bushARMTexture
})

const bush1 = new THREE.Mesh(bushGeometry,bushMaterial)
bush1.rotation.x = 0.5
bush1.scale.setScalar(0.5)
bush1.position.set(0.8,0.2,2)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.rotation.x = 0.5
bush2.scale.setScalar(0.26)
bush2.position.set(1.4, 0.1, 2.1)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.rotation.x = 0.5
bush3.scale.setScalar(0.4)
bush3.position.set(-1, 0.2, 2)

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.rotation.x = 0.5
bush4.scale.setScalar(0.16)
bush4.position.set(-1.4, 0.1, 2.3)


house.add(bush1,bush2,bush3,bush4)

/**
 * Graves
 */
const graves = new THREE.Group()
scene.add(graves)

//grave texture
const graveColorTexture = textureloader.load('/grave/plastered_stone_wall_diff_1k.webp')
const graveARMTexture = textureloader.load('/grave/plastered_stone_wall_arm_1k.webp')
const graveNormalTexture = textureloader.load('/grave/plastered_stone_wall_nor_gl_1k.webp')

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({
        map : graveColorTexture,
        aoMap : graveARMTexture,
        normalMap : graveNormalTexture,
        roughnessMap : graveARMTexture,
        metalnessMap : graveARMTexture
})
graveColorTexture.colorSpace = THREE.SRGBColorSpace

for(let i = 0 ; i < 30 ; i ++)
    {
        const grave = new THREE.Mesh(graveGeometry,graveMaterial)

    const angle = Math.random() * Math.PI * 2
    const radius = 3 + Math.random() * 4
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius
    grave.position.x = x
    grave.position.y = Math.random() * 0.4
    grave.position.z = z
    grave.rotation.x = (Math.random() - 0.5) * 0.4
    grave.rotation.y = (Math.random() - 0.5) * 0.4
    grave.rotation.z = (Math.random() - 0.5) * 0.4
    graves.add(grave)
    }

/**
 * Ghost
 */
const ghost1 = new THREE.PointLight('#8800ff', 6)
const ghost2 = new THREE.PointLight('#ff0088', 6)
const ghost3 = new THREE.PointLight('#ff0000', 6)
scene.add(ghost1, ghost2, ghost3)

/**
 * Gravity
 */
const world = new CANNON.World()

world.gravity.set(0,-9.82,0)

const defaultMaterial = new CANNON.Material()
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction : 0.1,
        restitution  : 0.9
    }
)
// world.broadphase = CANNON.SAPBroadphase
world.allowSleep = true
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

/**
 * sounds
 */
const hitSounds = new Audio('/sounds/hit.mp3')
const playHitSounds = (collision) =>{

    const impactSounds = collision.contact.getImpactVelocityAlongNormal()

    if(impactSounds > 2)
    {

    hitSounds.volume = 0.1 + Math.random() * 0.4
     hitSounds.currentTime = 0
     hitSounds.play()

    }
}

//floor
const cannonfloor = new CANNON.Plane()
const body = new CANNON.Body({
    mass : 0,
    shape : cannonfloor,
    position : new CANNON.Vec3(0,0,0)
})
body.quaternion.setFromAxisAngle(new CANNON.Vec3(-1,0,0), Math.PI * 0.5)

world.addBody(body)

/**
 * Physics object
 */
const objectsToUpdate = []
const debugObject = {}

debugObject.createSphere = () =>{
    createSphere(
        Math.random() * 0.5,
        {
            x : (Math.random() + 3),
            y : 5,
            z: (Math.random() + 3)
        }
    )
}
debugObject.createBox = () => {
    createBox(
        Math.random() * 1,
        Math.random() * 1,
        Math.random() * 1,
        {
            x: (Math.random() + 3),
            y: 5,
            z: (Math.random() + 3)
        }
    )
}

//textures for sphere
const sphereTexture = textureloader.load('/football/footaball2.webp')
const boxTexture = textureloader.load('/football/box.webp')

gui.add(debugObject,'createBox').name('AddBoxes')
gui.add(debugObject, 'createSphere').name('AddSpheres')

const SphereGeometry = new THREE.SphereGeometry(0.5,10,10)
const sphereMateiral = new THREE.MeshStandardMaterial({
    color : '0xffffff',
    map: sphereTexture
})

const createSphere = (radius, position) =>{

    //THREE js Meshes
    const mesh = new THREE.Mesh(SphereGeometry,sphereMateiral)
    mesh.position.copy(position)
    mesh.castShadow = true
    // mesh.material = defaultMaterial
    scene.add(mesh)

    //CANNON js
    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
        mass : 1,
        position : new CANNON.Vec3(0,3,0),
        shape : shape,
        material : defaultMaterial

    })
    body.position.copy(position)

    // console.log(body.position)
    body.addEventListener('collide', playHitSounds)

    world.addBody(body)

    objectsToUpdate.push({mesh,body})

}
createSphere(0.5, { x: 3, y: 5, z: 4 })
createSphere(0.5, { x: 4, y: 3, z: 5 })
// createSphere(0.5, { x: 5, y: 7, z: 4 })
// createSphere(0.5, { x: 2, y: 4, z: 3 })



//createbox
const boxCannonGeometry = new THREE.BoxGeometry(1,1,1)
const boxcannonMaterial = new THREE.MeshStandardMaterial({
    color : 'aquq',
    map: boxTexture
})

const createBox = (width, height, depth, boxposition) => {

    //THREE js Meshes
    const mesh = new THREE.Mesh(boxCannonGeometry, boxcannonMaterial)
    mesh.scale.set(width,height,depth)
    mesh.position.copy(boxposition)
    mesh.castShadow = true
    // mesh.material = defaultMaterial
    scene.add(mesh)

    //CANNON js
    const shape = new CANNON.Box(new CANNON.Vec3(width / 2,height / 2,depth /2))
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material : defaultMaterial
    })
    body.position.copy(boxposition)

    // console.log(body.position)
    body.addEventListener('collide',playHitSounds)

    world.addBody(body)

    objectsToUpdate.push({ mesh, body })

}



/**
 * Size
 */
const size = {
    width : window.innerWidth,
    height : window.innerHeight
}

/**
 * Resize
 */
window.addEventListener('resize', ()=>{
    size.width = window.innerWidth
    size.height = window.innerHeight

    camera.aspect = size.width / size.height
    camera.updateProjectionMatrix()

    renderer.setSize(size.width,size.height)
})

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, size.width / size.height)
camera.position.set(4,2,8)
scene.add(camera)

/**
 * Controls
 */
const controls = new OrbitControls(camera,canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas : canvas
})
renderer.setSize(size.width, size.height)
renderer.shadowMap.enabled =true

//shadow's
wall.castShadow = true
wall.receiveShadow = true
// floor.castShadow = true
floor.receiveShadow = true
directionalLight.castShadow = true
ghost1.castShadow = true
ghost1.receiveShadow = true

//directional shadow
directionalLight.shadow.mapSize.width = 256
directionalLight.shadow.mapSize.height = 256
directionalLight.shadow.mapSize.top = 8
directionalLight.shadow.mapSize.right = 8
directionalLight.shadow.mapSize.bottom = -8
directionalLight.shadow.mapSize.left = -8

ghost1.shadow.mapSize.width = 256
ghost1.shadow.mapSize.height = 256
ghost1.shadow.mapSize.top = 8
ghost1.shadow.mapSize.right = 8
ghost1.shadow.mapSize.bottom = -8
ghost1.shadow.mapSize.left = -8


for(const graved of graves.children)
    {
        graved.castShadow = true
        graved.receiveShadow = true
    }

//fog
// const fog = new THREE.FogExp2('#04343f',0.1)
// scene.add(fog)

scene.fog = new THREE.FogExp2('#04343f',0.1)

//timer
const timer = new Timer()

const clock = new THREE.Clock()

let oldElapsedTime = 0

/**
 * Animate
 */
const tick =()=>{

    timer.update()
    const elapsedTime = timer.getElapsed()

    const elapseTime = clock.getElapsedTime()

    const deltaTime = elapseTime - oldElapsedTime

    oldElapsedTime = elapseTime

    world.step(1/60,deltaTime,3)


    for(const object of objectsToUpdate)
        {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
        }

        
    const ghostAngle = elapsedTime * 0.5

    //mixer update
    if (mixer !== null)
        {
            mixer.update(deltaTime)
        }

    ghost1.position.x = Math.sin(ghostAngle) * 5
    ghost1.position.z = Math.cos(ghostAngle) * 5
    ghost1.position.y = Math.sin(ghostAngle) * Math.sin(ghostAngle * 2.34) * Math.sin(ghostAngle * 3.45)


    ghost2.position.x = Math.cos(ghostAngle* 0.4) * 6
    ghost2.position.z = Math.sin(ghostAngle* 0.4) * 6
    ghost2.position.y = Math.sin(ghostAngle) * Math.sin(ghostAngle * 2.34) * Math.sin(ghostAngle * 3.45)

    ghost3.position.x = Math.sin(ghostAngle* 0.5) * 7
    ghost3.position.z = Math.cos(ghostAngle* 0.5) * 7
    ghost3.position.y = Math.sin(ghostAngle) * Math.sin(ghostAngle * 2.34) * Math.sin(ghostAngle * 3.45)

    controls.update()
    renderer.render(scene,camera)
    requestAnimationFrame(tick)

}
tick()
