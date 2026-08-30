import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const canvas = document.querySelector('#room')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setSize(innerWidth, innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.22
renderer.outputColorSpace = THREE.SRGBColorSpace

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xeee2cd)
scene.fog = new THREE.Fog(0xeee2cd, 16, 29)
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, .1, 100)
camera.position.set(10.4, 8.2, 13.5)
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 2.55, -.15)
controls.enableDamping = true
controls.dampingFactor = .055
controls.minDistance = 10
controls.maxDistance = 20
controls.minPolarAngle = .72
controls.maxPolarAngle = 1.43
controls.maxAzimuthAngle = 1.25
controls.minAzimuthAngle = -1.25
controls.enablePan = false
controls.autoRotate = true
controls.autoRotateSpeed = .35

const W = new THREE.Vector3(0, 1, 0)
const materials = {
  wood: new THREE.MeshStandardMaterial({ color: 0x4c2917, roughness: .48 }),
  woodLight: new THREE.MeshStandardMaterial({ color: 0x80502b, roughness: .43 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x202019, roughness: .35, metalness: .15 }),
  wall: new THREE.MeshStandardMaterial({ color: 0x5c6041, roughness: .9 }),
  floor: new THREE.MeshStandardMaterial({ color: 0x523722, roughness: .63 }),
  brass: new THREE.MeshStandardMaterial({ color: 0x9a7134, roughness: .27, metalness: .75 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x344c24, roughness: .68, side: THREE.DoubleSide }),
  leafLight: new THREE.MeshStandardMaterial({ color: 0x58743a, roughness: .7, side: THREE.DoubleSide }),
  cream: new THREE.MeshStandardMaterial({ color: 0xe9dcc3, roughness: .8 }),
  rust: new THREE.MeshStandardMaterial({ color: 0xc96237, roughness: .83 }),
  greenFabric: new THREE.MeshPhysicalMaterial({ color: 0x586044, roughness: .82, sheen: .55, sheenColor: new THREE.Color(0x93a373) }),
}
const root = new THREE.Group(); scene.add(root)
const clickable = []; const floating = []
const box = (w,h,d,mat,x=0,y=0,z=0, bevel=0) => {
  const geo = bevel ? new THREE.BoxGeometry(w,h,d,1,1,1) : new THREE.BoxGeometry(w,h,d)
  const obj = new THREE.Mesh(geo, mat); obj.position.set(x,y,z); obj.castShadow = obj.receiveShadow = true; return obj
}
const cyl = (r1,r2,h,mat,x=0,y=0,z=0,seg=20) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),mat); o.position.set(x,y,z); o.castShadow=o.receiveShadow=true; return o }
const group = (...items) => { const g = new THREE.Group(); g.add(...items); return g }
function roundedBox(w,h,d,r,mat) { const shape = new THREE.Shape(); const a=w/2,b=h/2; shape.moveTo(-a+r,-b); shape.lineTo(a-r,-b); shape.quadraticCurveTo(a,-b,a,-b+r); shape.lineTo(a,b-r); shape.quadraticCurveTo(a,b,a-r,b); shape.lineTo(-a+r,b); shape.quadraticCurveTo(-a,b,-a,b-r); shape.lineTo(-a,-b+r); shape.quadraticCurveTo(-a,-b,-a+r,-b); return new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:2}),mat) }
function canvasTexture(draw, size=512) { const c=document.createElement('canvas');c.width=c.height=size; const ctx=c.getContext('2d');draw(ctx,size); const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace; return t }
const rugTex = canvasTexture((c,s)=>{ c.fillStyle='#465133';c.fillRect(0,0,s,s);c.strokeStyle='#b29962';c.lineWidth=18;c.strokeRect(22,22,s-44,s-44);c.lineWidth=5;c.strokeRect(48,48,s-96,s-96); for(let y=92;y<s-80;y+=58)for(let x=92;x<s-70;x+=67){c.fillStyle=(x+y)%3?'#8d8951':'#c1aa68';c.beginPath();c.arc(x,y,7,0,Math.PI*2);c.fill();}},512)
const posterTex = canvasTexture((c,s)=>{c.fillStyle='#d4b57b';c.fillRect(0,0,s,s);c.strokeStyle='#895f39';c.lineWidth=12;c.strokeRect(22,22,s-44,s-44);c.fillStyle='#b8773d';c.beginPath();c.arc(235,145,64,0,Math.PI*2);c.fill();c.fillStyle='#6c7447';c.beginPath();c.moveTo(30,390);c.lineTo(160,250);c.lineTo(280,355);c.lineTo(390,205);c.lineTo(490,390);c.fill();c.fillStyle='#5c432a';c.font='bold 34px serif';c.fillText('FIELD NOTES',110,454);})

// Architectural shell, floorboards and plinth
const plinth = roundedBox(11.5,.55,10.4,.3,materials.woodLight);plinth.position.set(0,-.28,0);root.add(plinth)
const floor = box(10.8,.18,9.7,materials.floor,0,.08,0);root.add(floor)
for(let x=-5.1;x<5.2;x+=.58){const seam=box(.018,.008,9.45,materials.dark,x,.18,0);seam.material=seam.material.clone();seam.material.color.set(0x2a190e);root.add(seam)}
const backWall=box(10.8,7.6,.28,materials.wall,0,3.9,-4.72); const sideWall=box(.28,7.6,9.5,materials.wall,5.25,3.9,0);root.add(backWall,sideWall)
const capA=box(11.2,.28,.48,materials.cream,0,7.62,-4.65), capB=box(.5,.28,9.9,materials.cream,5.25,7.62,0);root.add(capA,capB)

// Rug
const rug = new THREE.Mesh(new THREE.PlaneGeometry(7.8,5.6),new THREE.MeshStandardMaterial({map:rugTex,roughness:.92}));rug.rotation.x=-Math.PI/2;rug.position.set(.05,.195,.6);rug.receiveShadow=true;root.add(rug)

function bookshelf(){ const g=new THREE.Group(); const x=-3.55,z=-3.95; const frame=materials.wood; g.add(box(4.15,5.45,.34,frame,x,3.0,z),box(.22,5.8,.48,frame,x-2.0,3.2,z),box(.22,5.8,.48,frame,x+2.0,3.2,z)); for(const y of [1.05,2.6,4.15,5.7])g.add(box(4.1,.18,.52,frame,x,y,z+.12)); for(const xx of [-1.34,0,1.34])g.add(box(.14,5.5,.42,frame,x+xx,3.18,z+.05)); const colors=[0x314034,0x70402c,0xa86635,0x9b8054,0x283c39,0xb48643]; for(let row=0;row<4;row++){let px=x-1.75;for(let i=0;i<10;i++){const h=.62+Math.random()*.38,w=.11+Math.random()*.13;const book=box(w,h,.31,new THREE.MeshStandardMaterial({color:colors[(i+row*2)%colors.length],roughness:.65}),px+w/2,1.27+row*1.55,z+.34);book.rotation.z=(Math.random()-.5)*.12;g.add(book);px+=w+.045}} root.add(g) }
bookshelf()

function bed(){const g=new THREE.Group();g.add(box(3.35,.35,5.0,materials.woodLight,-2.35,.84,1.7),box(.24,1.55,3.4,materials.wood,-2.35,1.62,-.65)); for(const [x,z] of [[-3.8,-.52],[-.9,-.52],[-3.8,3.9],[-.9,3.9]])g.add(cyl(.12,.14,.85,materials.wood,x,.42,z));g.add(box(3.08,.27,4.6,materials.cream,-2.35,1.18,1.7)); const quilt=box(3.13,.25,2.95,materials.rust,-2.35,1.43,2.35);g.add(quilt);for(let z=.95;z<3.8;z+=.36)g.add(box(3.16,.018,.025,materials.woodLight,-2.35,1.58,z));const pillow=roundedBox(1.25,.25,.76,.15,materials.cream);pillow.rotation.x=-Math.PI/2;pillow.position.set(-2.78,1.54,-.05);g.add(pillow);const pillow2=roundedBox(1.2,.22,.72,.15,materials.greenFabric);pillow2.rotation.x=-Math.PI/2;pillow2.position.set(-2.05,1.67,.02);g.add(pillow2);root.add(g)} bed()

function desk(){const g=new THREE.Group(),x=1.7,z=-2.4;g.add(box(4.0,.25,1.75,materials.woodLight,x,2.38,z));for(const dx of [-1.72,1.72])for(const dz of [-.65,.65])g.add(box(.18,2.25,.18,materials.wood,x+dx,1.24,z+dz));const shelf=box(1.78,1.55,.72,materials.wood,x+2.18,1.08,z+.1);g.add(shelf,box(1.75,.1,.8,materials.woodLight,x+2.18,1.5,z+.1)); for(let i=0;i<10;i++){const b=box(.12,.78+Math.random()*.35,.52,new THREE.MeshStandardMaterial({color:[0x985843,0x24505a,0xdbc08b,0x455438][i%4],roughness:.55}),x+1.43+i*.15,1.68,z+.15);g.add(b)} const laptop=group(box(1.38,.06,.96,materials.dark,x-.38,2.58,z-.05),box(1.38,.9,.06,new THREE.MeshStandardMaterial({color:0xb5ad9e,roughness:.25,metalness:.5}),x-.38,3.04,z-.49));laptop.children[1].rotation.x=-.15;g.add(laptop); const proj=box(.98,.5,.75,new THREE.MeshStandardMaterial({color:0xd4cbb9,roughness:.32,metalness:.2}),x+1.05,2.72,z+.15);g.add(proj,cyl(.19,.19,.04,materials.dark,x+1.05,2.74,z+.55));root.add(g)} desk()

function chair(){const g=new THREE.Group();g.add(cyl(.6,.7,.13,materials.dark,.15,1.08,.45),cyl(.12,.16,.75,materials.brass,.15,.67,.45));const seat=box(1.45,.23,1.35,materials.greenFabric,.15,1.3,.45);g.add(seat);const back=box(1.42,1.25,.22,materials.greenFabric,.15,2.0,.97);back.rotation.x=-.18;g.add(back);for(let a=0;a<5;a++){const leg=cyl(.035,.035,.85,materials.brass,.15,.3,.45);leg.rotation.z=Math.PI/2;leg.rotation.y=a*Math.PI*2/5;g.add(leg)}root.add(g)} chair()

function plant(x,z,scale=1){const g=new THREE.Group();const pot=cyl(.38,.28,.53,new THREE.MeshStandardMaterial({color:0x8d6436,roughness:.75}),x,.55,z);g.add(pot);for(let i=0;i<14;i++){const a=i*Math.PI*2/14;const leaf=new THREE.Mesh(new THREE.SphereGeometry(.13,9,6),i%2?materials.leaf:materials.leafLight);leaf.scale.set(.65,2.8,1);leaf.position.set(x+Math.cos(a)*.35*scale,1.23+Math.sin(i*2)*.13,z+Math.sin(a)*.35*scale);leaf.rotation.z=Math.cos(a)*.7;leaf.rotation.y=-a;leaf.castShadow=true;g.add(leaf)}root.add(g)} plant(.1,-3.4,1.65);plant(-3.95,-2.65,.52);plant(3.2,-2.0,.44)

// Wall print & projector screen
const print=new THREE.Mesh(new THREE.PlaneGeometry(1.35,1.9),new THREE.MeshStandardMaterial({map:posterTex,roughness:.88}));print.position.set(2.5,4.65,-4.51);root.add(print);const frame=box(1.52,2.07,0.06,materials.woodLight,2.5,4.65,-4.57);root.add(frame);const screen=box(2.45,1.72,.08,materials.cream,4.97,4.6,-1.25);screen.rotation.y=-Math.PI/2;root.add(screen);const rod=cyl(.08,.08,2.7,materials.dark,4.88,5.56,-1.25);rod.rotation.z=Math.PI/2;root.add(rod)

function recordPlayer(){const g=new THREE.Group();g.add(box(1.75,.26,1.28,materials.woodLight,3.8,1.28,2.8),box(1.6,.08,1.14,materials.dark,3.8,1.48,2.8));const disk=cyl(.48,.48,.04,new THREE.MeshStandardMaterial({color:0x10100e,roughness:.18,metalness:.18}),3.65,1.54,2.8);g.add(disk,cyl(.055,.055,.05,materials.rust,3.65,1.58,2.8));const arm=cyl(.025,.025,.72,materials.brass,4.27,1.67,2.9);arm.rotation.z=Math.PI/2.8;g.add(arm);root.add(g)} recordPlayer()

function globe(){const g=new THREE.Group();const stand=cyl(.42,.52,.14,materials.brass,4.42,.52,3.77);g.add(stand);const earth=new THREE.Mesh(new THREE.SphereGeometry(.47,24,16),new THREE.MeshStandardMaterial({color:0x4d8b92,roughness:.68}));earth.position.set(4.42,1.15,3.77);earth.castShadow=true;g.add(earth);const ring=new THREE.Mesh(new THREE.TorusGeometry(.52,.027,8,32),materials.brass);ring.position.copy(earth.position);ring.rotation.x=1.15;g.add(ring);root.add(g)} globe()

// Camera on bed, small decor and hotspots
function cameraProp(){const g=group(box(.55,.32,.34,materials.dark,-2.25,1.82,2.2),cyl(.17,.17,.23,new THREE.MeshStandardMaterial({color:0x1c201e,roughness:.22,metalness:.4}),-2.25,1.82,2.39));g.children[1].rotation.x=Math.PI/2;root.add(g)}cameraProp()
function hotspot(pos, note){const ring=new THREE.Mesh(new THREE.RingGeometry(.075,.11,24),new THREE.MeshBasicMaterial({color:0xe8c67a,side:THREE.DoubleSide,transparent:true,opacity:.96}));ring.position.copy(pos);ring.lookAt(camera.position);ring.userData.note=note;clickable.push(ring);floating.push(ring);root.add(ring)}
hotspot(new THREE.Vector3(-3.4,3.1,-3.35),{index:'01 / LIBRARY',title:'被翻过的书脊',copy:'书架不是陈列柜。深浅不一的书脊、停在角落的小盆栽，让阅读像一件持续发生的事。'})
hotspot(new THREE.Vector3(-2.25,1.94,2.35),{index:'02 / MEMORY',title:'随手放下的相机',copy:'床尾的相机像一个未完结的句子——房间里每一次微小的光线变化，都值得被留下。'})
hotspot(new THREE.Vector3(3.72,1.85,2.45),{index:'03 / LISTENING',title:'让唱针先落下',copy:'旧唱机和一整面唱片架，是在任何忙碌之前，给自己留出三十分钟的仪式。'})

// Lighting
scene.add(new THREE.HemisphereLight(0xfff2ce,0x313a28,2.1))
const key=new THREE.DirectionalLight(0xffdda1,3.7);key.position.set(-6,11,8);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;key.shadow.bias=-.0002;scene.add(key)
const warm=new THREE.PointLight(0xffa95a,28,10,2);warm.position.set(-1.9,5.8,1.8);scene.add(warm)
const fill=new THREE.PointLight(0x91a77a,9,8,2);fill.position.set(4,4,-1);scene.add(fill)

const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();let over=null
addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(clickable)[0];canvas.style.cursor=hit?'pointer':'grab';over=hit?.object||null})
addEventListener('click',()=>{if(!over)return;const n=over.userData.note;document.querySelector('#spotlight-index').textContent=n.index;document.querySelector('#spotlight-title').textContent=n.title;document.querySelector('#spotlight-copy').textContent=n.copy;document.querySelector('#spotlight').classList.add('open')})
document.querySelector('#close-spotlight').onclick=()=>document.querySelector('#spotlight').classList.remove('open')
document.querySelector('#explore').onclick=()=>{controls.autoRotate=false;document.querySelector('.intro').animate([{opacity:1},{opacity:.18}],{duration:450,fill:'forwards'})}
document.querySelector('#sound').onclick=e=>{const b=e.currentTarget;b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));warm.intensity=b.getAttribute('aria-pressed')==='true'?42:28}
const views={overview:{p:[10.4,8.2,13.5],t:[0,2.55,-.15]},reading:{p:[-9.6,5.2,6.5],t:[-2.8,2.5,-1.8]},desk:{p:[7.3,4.7,6.7],t:[1.85,2.5,-2.4]}}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{const v=views[b.dataset.view];camera.position.set(...v.p);controls.target.set(...v.t);controls.autoRotate=false;document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===b))})
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)})
const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();floating.forEach((o,i)=>{o.rotation.z=t*1.4+i;o.scale.setScalar(1+Math.sin(t*2+i)*.13);o.quaternion.copy(camera.quaternion)});controls.update();renderer.render(scene,camera)}animate()
setTimeout(()=>document.querySelector('#loader').classList.add('done'),900)
