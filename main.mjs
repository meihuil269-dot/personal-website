import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import roomModelUrl from './assets/logan-room.glb?url'

const canvas = document.querySelector('#room')
const loader = document.querySelector('#loader')
const loaderCopy = document.querySelector('#loader-copy')
const fallback = document.querySelector('#fallback')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const compactViewport = () => window.matchMedia('(max-width: 760px)').matches
const shadowEnabled = !compactViewport()
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, compactViewport() ? 1 : 1.35))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.05
renderer.shadowMap.enabled = shadowEnabled
renderer.shadowMap.type = THREE.BasicShadowMap

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xeefa58)
scene.fog = new THREE.Fog(0xeefa58, 12, 32)
const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100)
const roomCameraPosition = new THREE.Vector3(8.8, 6.1, 11.6)
const entryCameraPosition = new THREE.Vector3(12.6, 8.4, 18.4)
camera.position.copy(entryCameraPosition)
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 1.8, 0)
controls.enableDamping = true
controls.dampingFactor = 0.06
controls.enablePan = false
controls.autoRotate = !reducedMotion && !compactViewport()
controls.autoRotateSpeed = 0.32
controls.minDistance = 6
controls.maxDistance = 18
controls.minPolarAngle = 0.62
controls.maxPolarAngle = 1.54
controls.minAzimuthAngle = -1.22
controls.maxAzimuthAngle = 1.22

scene.add(new THREE.HemisphereLight(0xfff6df, 0x657354, 2.65))
const key = new THREE.DirectionalLight(0xffdfad, 4.2)
key.position.set(-6, 10, 7)
key.castShadow = shadowEnabled
key.shadow.mapSize.set(512, 512)
scene.add(key)
const fill = new THREE.DirectionalLight(0xc7e1ef, 1.3)
fill.position.set(7, 4, -4)
scene.add(fill)

const room = new THREE.Group()
scene.add(room)
const floor = new THREE.Mesh(new THREE.CircleGeometry(7.6, 64), new THREE.MeshStandardMaterial({ color: 0xd2e567, roughness: 0.95 }))
floor.rotation.x = -Math.PI / 2
floor.position.y = -0.02
floor.receiveShadow = shadowEnabled
scene.add(floor)


function fitRoom(object) {
  const bounds = new THREE.Box3().setFromObject(object)
  const size = bounds.getSize(new THREE.Vector3())
  const center = bounds.getCenter(new THREE.Vector3())
  // Make the room the full hero backdrop instead of a small object on the left.
  const scale = 11.3 / Math.max(size.x, size.z)
  object.scale.setScalar(scale)
  bounds.setFromObject(object)
  const fittedCenter = bounds.getCenter(new THREE.Vector3())
  object.position.sub(fittedCenter)
  object.position.y -= bounds.min.y
  object.position.x += 1.25
  object.rotation.y = -0.38
}

const gltfLoader = new GLTFLoader()
gltfLoader.setMeshoptDecoder(MeshoptDecoder)
gltfLoader.load(
  roomModelUrl,
  (gltf) => {
    const model = gltf.scene
    fitRoom(model)
    model.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = shadowEnabled
      child.receiveShadow = shadowEnabled
      if (child.material) child.material.needsUpdate = true
    })
    room.add(model)
    loader.classList.add('done')
  },
  (event) => {
    if (!event.total) return
    loaderCopy.textContent = `LOADING ROOM ${Math.round((event.loaded / event.total) * 100)}%`
  },
  () => {
    loader.classList.add('done')
    fallback.hidden = false
    document.querySelector('#status-copy').textContent = 'MODEL UNAVAILABLE'
  }
)

const botDialog = document.querySelector('#bot-dialog')
const detailDialog = document.querySelector('#detail-dialog')
const messages = document.querySelector('.messages')
const botInput = document.querySelector('.bot-form input')
const botAnswers = {
  '我在做什么？': '我在量元涌现主导 ToB 产品设计与用户体验，也持续探索 AI、内容和认知科学交叉处的表达方式。',
  '我有哪些代表作品？': '作品集包括 Talentmap、OMO 记忆学习 App、容医智能医疗系统，以及播客与 AI 工具测评等内容项目。',
  '最近在看什么？': '我在长期关注认知神经科学与脑科学，并持续把阅读、电影、绘画和看展收进兴趣档案。'
}
const luluKnowledge = [
  ['你是谁？', '我是陈璐，也有人叫我猫猫：一个在产品、内容与认知科学之间来回穿梭的 INFP 创业者。'],
  ['你现在在做什么？', '现在最主要的身份是上海量元涌现人工智能科技有限公司创始人，主导 ToB 产品设计与用户体验。'],
  ['你的关键词是什么？', '设计 × 心理 × AI。用理性设计产品，用内容连接人——这句是猫猫的小小底层代码。'],
  ['量元涌现是做什么的？', '量元涌现做 AI + 企业服务，服务出海企业与数字化转型客户。不是为了炫技，是让技术真的落地aaaa。'],
  ['量元涌现提供什么业务？', '网站搭建、AIGC 视频生成、企业出海和人力咨询，都是正在展开的业务线。'],
  ['量元涌现在哪里？', '团队扎根上海与新加坡双城协作，两个城市的视角在这里悄悄碰头。'],
  ['量元涌现的团队怎么样？', '是一支小而精的跨学科团队，硕博学历占比 71.4%，成员来自复旦、华东师大、北大、中科院及多所海外高校。'],
  ['你在量元涌现负责什么？', '猫猫负责产品设计与用户体验：把模糊需求翻译成可被人顺手使用的产品路径。'],
  ['Talentmap 是什么？', 'Talentmap 是量元涌现的 AI 招聘软件项目，猫猫负责产品设计。'],
  ['为什么做 ToB 产品？', '因为企业场景里的每一次决策背后都是真实的人和协作关系；把复杂流程理顺，真的很有成就感呢。'],
  ['合伙人是谁？', '姐姐博雅：新加坡国立大学硕士，新加坡出海经理、人力资源管理从业者。'],
  ['量元涌现名字的由来？', '这个小秘密已经整理成公众号文章啦，时间线里的「名字的由来」按钮可以直接打开。'],
  ['怎么查看量元涌现官网？', '在创业经历第一条的公司卡片里点「查看官网」，就能到 liangyuanai.com。'],
  ['你做播客吗？', '做呀！！《不止一百种声音》是猫猫从大四开始独立制作的播客。'],
  ['播客叫什么？', '小宇宙《不止一百种声音》。名字听起来就像一扇会不断开的小门，嘿嘿。'],
  ['播客从什么时候开始？', '从大四开始，猫猫自己把它一点点做起来。'],
  ['播客你负责哪些工作？', '招募嘉宾、制作结构性访谈提纲、剪辑和运营——从一个念头到被听见，基本全流程都参与。'],
  ['播客采访了多少人？', '已经访谈 200+ 位不同行业、不同阶段的嘉宾。每个人都是一颗小星球啊啊啊。'],
  ['播客聊什么话题？', '已覆盖 40+ 种人生话题，关心人怎么选择、怎么成长、怎么和自己相处。'],
  ['怎么收听播客？', '在《不止一百种声音》条目里点击「点击收听」，会跳转到小宇宙主页。'],
  ['你为什么做内容？', '内容是猫猫和世界保持连接的一种方式：把复杂的技术和人的感受，变成可以被听见、看见的东西。'],
  ['你在哪里做内容？', '在公众号、小红书持续输出 AI 工具实测与创业思考，也在哔哩哔哩发布视频内容。'],
  ['你的内容数据怎么样？', '小红书获赞与收藏 14 万+，哔哩哔哩视频累计播放 300 万+。数据是脚印，不是终点啦。'],
  ['你为什么做 AI 工具测评？', '因为工具到底好不好用，不能只听发布会；猫猫会把它放进真实创作和工作流程里试试看。'],
  ['你的本科专业是什么？', '本科读工业设计。'],
  ['你还学过心理学吗？', '学过！曾在华东师范大学跨校辅修应用心理学。'],
  ['工业设计对你有什么影响？', '它训练我从人的动作、场景和限制出发看问题；好产品不是漂亮摆件，是能被顺手带走的体验。'],
  ['心理学对做产品有什么帮助？', '会让我更在意人为什么犹豫、为什么相信、为什么在一个按钮前停住。读心术当然是玩笑，但观察是真的。'],
  ['你在研究什么？', '现在深度关注认知神经科学与脑科学，也在推进神经科学方向的论文研究。'],
  ['为什么关注脑科学？', '理解人如何思考、如何决策，是做产品时最底层的武器。大脑这个小宇宙真的很值得研究呢。'],
  ['你获得过什么奖项？', '曾获机械工程大赛一等奖。'],
  ['OMO 是什么项目？', 'OMO 是一款记忆学习 App，猫猫负责前端开发与网页设计。'],
  ['容医是什么项目？', '容医是智能医疗系统项目，包含服务设计与用户研究。'],
  ['你还做品牌视觉吗？', '做过视频剪辑、品牌视觉和海报设计，为企业宣传建立清晰的视觉表达。'],
  ['作品集有哪些内容？', '包括 UI/UX 设计、黑客松、AIGC 实验项目和内容创作，网站的 WORK 区已经放了六份精选档案。'],
  ['你怎么做一个新项目？', '通常先听人和场景里的真实问题，再做原型、测试体验、反复调整。小小的观察，往往能长成大方向。'],
  ['你平时关注什么？', 'AI、产品、内容创作，也关注阅读、电影、绘画与看展。工作之外也要给脑袋放风呀。'],
  ['你是 INFP 吗？', '是 INFP。会做很多未来小剧场，也会把那些小剧场变成待办和项目，哈哈哈哈。'],
  ['可以找你合作吗？', '当然可以！可以从网站的经历与作品先了解方向，再通过社交主页联系。具体合作范围以沟通为准。'],
  ['你接下来想做什么？', '继续让 AI、设计、心理与内容在真实场景里相遇。下一件正在发生的事，可能已经在路上啦。']
]
function answerFromKnowledge(question) {
  const input = question.toLowerCase()
  const exact = luluKnowledge.find(([prompt]) => prompt === question.trim())
  if (exact) return exact[1]
  if (input.includes('量元') || input.includes('公司') || input.includes('创业') || input.includes('talentmap')) return '啊啊啊量元涌现是猫猫正在认真养大的 AI + 企业服务团队！！团队扎根上海与新加坡双城，服务出海企业与数字化转型客户，提供网站搭建、AIGC 视频生成、企业出海和人力咨询。猫猫作为创始人，主导 ToB 产品设计与用户体验——让技术不是停在 PPT 里，而是真的被人用起来aaaa。'
  if (input.includes('播客') || input.includes('声音') || input.includes('小宇宙') || input.includes('访谈')) return '《不止一百种声音》是从大四开始独立制作的播客：招募嘉宾、做结构性访谈提纲、剪辑、运营，猫猫全都自己来！！现在已经访谈 200+ 位不同行业、不同阶段的嘉宾，覆盖 40+ 种人生话题。每个人都有一套没被写进简历的宇宙，听到的时候会不会也觉得很神奇呢？'
  if (input.includes('作品') || input.includes('项目') || input.includes('omo') || input.includes('容医')) return '作品档案里有 Talentmap AI 招聘软件、OMO 记忆学习 App、容医智能医疗系统、品牌视觉与视频，以及播客和 AI 工具测评内容。它们看起来很不一样，但底层都是同一个问题：怎么把人的真实感受、决策和需求，变成一个能被体验到的东西。'
  if (input.includes('研究') || input.includes('心理') || input.includes('认知') || input.includes('脑') || input.includes('设计')) return '猫猫本科读工业设计，也跨校辅修应用心理学，现在关注认知神经科学与脑科学。读心术当然是玩笑话啦（嘻嘻），但理解人怎么思考、怎么决策，确实是做产品时很底层的一把武器。'
  if (input.includes('博雅') || input.includes('姐姐') || input.includes('合伙人')) return '姐姐博雅是新加坡国立大学硕士，也是新加坡出海经理、人力资源管理从业者。她和猫猫一起把上海与新加坡双城的业务线一点点搭起来，很会的姐姐！！！'
  return 'aaaa这个问题我还没有在公开资料里找到完整答案，但你可以问问量元涌现、播客、作品或认知科学——这些小抽屉我都装得满满的（嘿嘿）。'
}
function openBot(question = '') {
  botDialog.hidden = false
  if (question) respondToBot(question)
  else botInput.focus()
}
function closeBot() { botDialog.hidden = true }
function respondToBot(question) {
  const text = question.trim()
  if (!text) return
  messages.insertAdjacentHTML('beforeend', `<p><b>YOU:</b> ${text.replaceAll('<', '&lt;')}</p>`)
  messages.insertAdjacentHTML('beforeend', `<p><b>GRACE BOT:</b> ${botAnswers[text] || answerFromKnowledge(text)}</p>`)
  messages.scrollTop = messages.scrollHeight
  botInput.value = ''
}
document.querySelector('[data-open-contact]').addEventListener('click', () => {
  document.querySelector('#contact').scrollIntoView({ behavior: 'smooth', block: 'center' })
  window.setTimeout(() => bottomInput.focus(), 450)
})
document.querySelectorAll('[data-close-bot]').forEach((button) => button.addEventListener('click', closeBot))
document.querySelectorAll('[data-bot-question], .quick-questions button').forEach((button) => button.addEventListener('click', () => openBot(button.textContent.trim())))
document.querySelector('.bot-form').addEventListener('submit', (event) => { event.preventDefault(); respondToBot(botInput.value) })

const bottomMessages = document.querySelector('#bottom-messages')
const bottomInput = document.querySelector('#bottom-bot-input')
function respondAtBottom(question) {
  const text = question.trim()
  if (!text) return
  bottomMessages.insertAdjacentHTML('beforeend', `<p><b>YOU:</b> ${text.replaceAll('<', '&lt;')}</p>`)
  bottomMessages.insertAdjacentHTML('beforeend', `<p><b>LULUBOT:</b> ${answerFromKnowledge(text)}</p>`)
  bottomMessages.scrollTop = bottomMessages.scrollHeight
  bottomInput.value = ''
}
document.querySelectorAll('[data-bottom-question]').forEach((button) => button.addEventListener('click', () => respondAtBottom(button.dataset.bottomQuestion)))
document.querySelector('#bottom-bot-form').addEventListener('submit', (event) => { event.preventDefault(); respondAtBottom(bottomInput.value) })

function openDetail(title, type, copy, image = false) {
  document.querySelector('#detail-title').textContent = title
  document.querySelector('#detail-type').textContent = type
  document.querySelector('#detail-kicker').textContent = `${type.replaceAll(' ', '_')}.TXT`
  document.querySelector('#detail-copy').textContent = copy
  document.querySelector('#detail-image').hidden = !image
  detailDialog.hidden = false
}
document.querySelectorAll('[data-close-detail]').forEach((button) => button.addEventListener('click', () => { detailDialog.hidden = true }))
document.querySelectorAll('.timeline article').forEach((article) => article.addEventListener('click', () => openDetail(article.querySelector('h3').textContent, article.dataset.type.toUpperCase(), article.dataset.detail)))
document.querySelectorAll('.folder-card').forEach((card) => card.addEventListener('click', () => openDetail(card.querySelector('span').textContent, card.dataset.workType.toUpperCase(), card.dataset.detail)))
document.querySelectorAll('.interest-card').forEach((card) => card.addEventListener('click', () => openDetail(card.dataset.interest, 'OFF THE CLOCK', card.dataset.detail)))
const companyDetails = {
  about: {
    title: '我的团队 · 量元涌现',
    copy: '我们是一支小而精的跨学科创业团队，硕博学历占比 71.4%，成员来自复旦大学、华东师范大学、北京大学、中科院、新加坡国立大学、爱丁堡大学、巴塞罗那大学、香港中文大学等海内外高校。团队以「AI + 企业服务」为核心，扎根上海与新加坡双城，服务出海企业与数字化转型客户；提供网站搭建、AIGC 视频生成、企业出海、人力咨询等业务。'
  },
  partner: {
    title: '姐姐 · 博雅',
    copy: '新加坡国立大学硕士；新加坡出海经理、人力资源管理从业者。',
    image: true
  }
}
document.querySelectorAll('[data-company-detail]').forEach((button) => button.addEventListener('click', (event) => {
  event.stopPropagation()
  const detail = companyDetails[button.dataset.companyDetail]
  openDetail(detail.title, '量元涌现 / COMPANY FILE', detail.copy, detail.image)
}))
document.querySelectorAll('a.company-action').forEach((link) => link.addEventListener('click', (event) => event.stopPropagation()))
document.querySelector('[data-podcast-detail]').addEventListener('click', (event) => {
  event.stopPropagation()
  openDetail('关于《不止一百种声音》', 'PODCAST / 200+ GUESTS', '我从大四开始独立制作了这档播客，包括招募嘉宾、制作结构性访谈提纲、剪辑、运营。现已访谈 200+ 位不同行业、不同阶段的嘉宾，覆盖 40+ 种人生话题；同时持续输出 AI 工具实测与创业思考。')
})
document.querySelectorAll('a.podcast-action').forEach((link) => link.addEventListener('click', (event) => event.stopPropagation()))
document.querySelectorAll('.filter-row:not(.work-filter) button').forEach((button) => button.addEventListener('click', () => {
  const type = button.textContent.trim().toLowerCase()
  document.querySelectorAll('.filter-row:not(.work-filter) button').forEach((item) => item.classList.toggle('active', item === button))
  document.querySelectorAll('.timeline article').forEach((article) => { article.hidden = type !== 'all' && article.dataset.type !== type })
}))
document.querySelectorAll('[data-work-filter]').forEach((button) => button.addEventListener('click', () => {
  const type = button.dataset.workFilter
  document.querySelectorAll('[data-work-filter]').forEach((item) => item.classList.toggle('active', item === button))
  document.querySelectorAll('.folder-card').forEach((card) => { card.hidden = type !== 'all' && card.dataset.workType !== type })
}))

const homeDialog = document.querySelector('#home-dialog')
const profileTrigger = document.querySelector('[data-open-home-dialog]')
const closeProfileTrigger = document.querySelector('[data-close-home-dialog]')
let roomPointerStart = null

function openHomeDialog() {
  homeDialog.hidden = false
  profileTrigger.setAttribute('aria-expanded', 'true')
}

function closeHomeDialog() {
  homeDialog.hidden = true
  profileTrigger.setAttribute('aria-expanded', 'false')
}

profileTrigger.setAttribute('aria-expanded', 'false')
profileTrigger.addEventListener('click', openHomeDialog)
closeProfileTrigger.addEventListener('click', closeHomeDialog)
canvas.addEventListener('pointerdown', (event) => {
  roomPointerStart = { x: event.clientX, y: event.clientY }
})
canvas.addEventListener('pointerup', (event) => {
  if (!roomPointerStart) return
  const moved = Math.hypot(event.clientX - roomPointerStart.x, event.clientY - roomPointerStart.y)
  roomPointerStart = null
  if (moved < 8) openHomeDialog()
})
canvas.addEventListener('pointercancel', () => { roomPointerStart = null })
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !homeDialog.hidden) closeHomeDialog()
  if (event.key === 'Escape' && !botDialog.hidden) closeBot()
  if (event.key === 'Escape' && !detailDialog.hidden) detailDialog.hidden = true
})

const entryGate = document.querySelector('#entry-gate')
const catDoor = document.querySelector('#cat-door')
let enteringRoom = false
let entryStartedAt = 0
catDoor.addEventListener('click', () => {
  if (enteringRoom) return
  enteringRoom = true
  entryStartedAt = performance.now()
  controls.enabled = false
  entryGate.classList.add('leaving')
  document.querySelector('#status-copy').textContent = 'ENTERING ROOM'
  window.setTimeout(() => { controls.enabled = true; controls.autoRotate = true }, 1400)
})

function resizeScene() {
  const { width, height } = canvas.getBoundingClientRect()
  const compact = width <= 760
  camera.fov = compact ? 42 : 37
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1 : 1.35))
  renderer.setSize(width, height, false)
}
window.addEventListener('resize', resizeScene)
if (!renderer.capabilities.isWebGL2 && !renderer.capabilities.isWebGL) fallback.hidden = false
const clock = new THREE.Clock()
let pageVisible = !document.hidden
document.addEventListener('visibilitychange', () => {
  pageVisible = !document.hidden
  if (pageVisible) clock.getDelta()
})
function animate() {
  requestAnimationFrame(animate)
  if (!pageVisible) return
  const delta = clock.getDelta()
  room.position.y = Math.sin(clock.getElapsedTime() * 0.42) * 0.025
  if (enteringRoom) {
    const progress = Math.min((performance.now() - entryStartedAt) / 1400, 1)
    const ease = 1 - Math.pow(1 - progress, 4)
    camera.position.lerpVectors(entryCameraPosition, roomCameraPosition, ease)
    controls.target.lerp(new THREE.Vector3(0, 1.8, 0), Math.min(delta * 8, 1))
    if (progress === 1) enteringRoom = false
  }
  controls.update()
  renderer.render(scene, camera)
}
resizeScene()
animate()
