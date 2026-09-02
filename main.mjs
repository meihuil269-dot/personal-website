import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import roomModelUrl from './assets/logan-room.glb?url'
import wechatLogoUrl from './assets/social/handdrawn/8e2b3f2e-1713-4ce6-9887-42dd4efe3714.png?url'
import wechatArticle01 from './assets/wechat-articles/01.jpg?url'
import wechatArticle02 from './assets/wechat-articles/02.jpg?url'
import wechatArticle03 from './assets/wechat-articles/03.jpg?url'
import wechatArticle04 from './assets/wechat-articles/04.jpg?url'
import wechatArticle05 from './assets/wechat-articles/05.jpg?url'
import wechatArticle06 from './assets/wechat-articles/06.jpg?url'
import wechatArticle07 from './assets/wechat-articles/07.jpg?url'
import wechatArticle08 from './assets/wechat-articles/08.jpg?url'

const canvas = document.querySelector('#room')
const loader = document.querySelector('#loader')
const loaderCopy = document.querySelector('#loader-copy')
const fallback = document.querySelector('#fallback')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const compactViewport = () => window.matchMedia('(max-width: 760px)').matches
// The original GLB already contains its intended lighting. Avoid adding a second,
// browser-generated shadow pass over it.
const shadowEnabled = false
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, compactViewport() ? 1.5 : 1.75))
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
  // Keep the room at its composed showcase size; the stage background fills the rest.
  const scale = (window.innerWidth > 760 ? 11.3 : 12.4) / Math.max(size.x, size.z)
  object.scale.setScalar(scale)
  bounds.setFromObject(object)
  const fittedCenter = bounds.getCenter(new THREE.Vector3())
  object.position.sub(fittedCenter)
  object.position.y -= bounds.min.y
  object.position.x += window.innerWidth > 760 ? 1.25 : 1.05
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
document.querySelectorAll('a.podcast-action, a.hackathon-action').forEach((link) => link.addEventListener('click', (event) => event.stopPropagation()))
const mediaDetails = {
  bilibili: {
    title: '哔哩哔哩 · 影视内容创作与账号运营',
    type: 'MEDIA / BILIBILI',
    sections: [
      ['账号定位', '哔哩哔哩影视区UP主，主要围绕电影、电视剧、角色人物和流行文化进行视频创作。通过影视素材重组、音乐设计与情绪化叙事，探索影视内容的二次表达，逐步形成具有个人审美与情绪感染力的创作风格。'],
      ['内容方向', '内容涵盖影视混剪、人物群像、角色解析、剧情二次创作、日常vlog及AIGC影像实验等。根据影视热点、人物特征和用户兴趣完成选题策划，并通过画面、台词、音乐与剪辑节奏的组合，增强内容的叙事性和传播力。'],
      ['个人职责', '独立负责账号定位、选题策划、影视素材收集与筛选、脚本和文案撰写、视频剪辑、音乐选择、字幕设计、画面调色、特效包装、封面制作、标题优化、内容发布及数据复盘。根据播放量、完播率、点赞、投币、收藏和评论等数据持续调整内容结构与创作方向。'],
      ['使用软件', 'Adobe Premiere、Adobe After Effects、Adobe Photoshop、剪映、Midjourney、即梦、Lovart、Tapnow'],
      ['运营成果', '累计发布约300条视频；账号粉丝数量1000+，视频累计播放量超过300万。通过长期稳定的内容输出，积累了影视内容策划、视听语言表达、热点捕捉、视频包装及平台运营经验。'],
      ['核心数据', '300条视频｜200+独立剪辑｜1000+粉丝｜300万+累计播放量']
    ]
  },
  xiaohongshu: {
    title: '小红书 · 影视与生活方式内容创作',
    type: 'MEDIA / XIAOHONGSHU',
    sections: [
      ['账号定位', '影视与设计自媒体博主，以电影、书籍、设计和个人生活观察为主要内容方向。通过图文、短视频分享具有审美表达、情绪共鸣和个人观点的内容。'],
      ['内容方向', '内容涵盖影视剧推荐、人物与角色表达、影视二次创作、AIGC视频、生活Vlog及个人审美分享等。结合小红书用户的浏览习惯，将影视内容转化为更具话题性、情绪价值和视觉吸引力的短内容，并通过统一的封面与版式设计强化账号辨识度。'],
      ['个人职责', '独立负责账号内容定位、选题策划、热点追踪、资料与素材收集、脚本及文案撰写、视频剪辑、图文排版、封面设计、标题优化、话题标签选择、笔记发布以及互动数据复盘。根据用户的点赞、收藏、评论和关注转化情况，持续优化内容方向与视觉呈现。'],
      ['使用软件', 'Adobe Premiere Pro、Adobe Photoshop、Adobe Illustrator、剪映、醒图、Midjourney、即梦、ChatGPT'],
      ['运营成果', '账号粉丝数量1000+，累计获赞与收藏14万+。通过对影视热点、用户情绪和平台传播趋势的持续观察，形成了从内容策划、视觉包装到发布运营与数据分析的完整创作流程，提升了内容传播力和用户互动表现。']
    ]
  },
  wechat: {
    title: '微信公众号 · AI 科技与人文内容运营',
    type: 'MEDIA / WECHAT',
    sections: [
      ['账号定位', '观猹（AI测评网站）签约AI博主，持续关注人工智能前沿技术、科技创业与人文文化领域。通过产品测评、行业观察、活动报道和观点文章，将复杂的AI概念转化为清晰、易读且具有个人视角的内容。'],
      ['内容方向', '科技内容主要涵盖AI产品测评、OPC、大模型、AI Native、世界模型、AIGC应用及人工智能行业趋势；科创内容聚焦复旦科创活动、创业项目路演、YC创业生态、投融资动态及青年创业者故事；人文内容涉及应用心理学、个体成长、电影评论及书影音分享等方向。'],
      ['个人职责', '独立负责公众号定位、内容规划、前沿资讯追踪、选题策划、资料研究、产品体验、文章撰写、采访整理、图片制作、版式设计、标题优化、内容发布及阅读数据复盘。针对AI专业概念进行资料查证与通俗化表达，并结合产品体验、行业案例和个人观察完成深度内容创作。'],
      ['使用软件', 'Adobe Photoshop、Adobe Illustrator、Fabrie、秀米、Midjourney、ChatGPT'],
      ['运营成果', '完成多篇AI产品测评、前沿技术观察、科创活动报道、创业路演分析、心理学科普及电影分享文章，逐步建立兼具科技敏感度与人文表达的个人内容体系。通过持续追踪AI技术与创业资讯，积累了科技内容研究、产品分析、深度写作、采访整理和新媒体运营经验。']
    ]
  },
  'wechat-article': {
    title: '微信公众号 · 爆款文章',
    type: 'MEDIA / WECHAT',
    sections: [['精选文章', '八篇文章已整理为可点击的封面卡片。']],
    articles: [
      ['我的使用说明书', 'https://mp.weixin.qq.com/s/07TYbQ6aKJ_FYveedpFbBw', wechatArticle01],
      ['复旦科创——F-LAB天才少年营选拔日', 'https://mp.weixin.qq.com/s/fHYHt6T2LwkAD0Q95UHUXw', wechatArticle02],
      ['大模型突然“开窍”，到底发生了什么？——涌现能力，这个改变了整个AI格局的概念', 'https://mp.weixin.qq.com/s/ut_6JTZ82FFYYGsU1fInng', wechatArticle03],
      ['AI Native 的分水岭：Claude 已经“进群”了，你的公司还停留在“单人模式”吗？', 'https://mp.weixin.qq.com/s/9trIegYvCL5S7D-RKSXgKw', wechatArticle04],
      ['SIFF28，上影节在电影院延长了三倍生命', 'https://mp.weixin.qq.com/s/JVdDJvb1dgerc7ERSJn2BA', wechatArticle05],
      ['李飞飞最新长文，一文讲透“世界模型”的三大流派', 'https://mp.weixin.qq.com/s/adBVl8Fv0FqMaJojYG-6hg', wechatArticle06],
      ['WAIC路演纪实：复旦F-LAB天才少年如何用硬核科技征服全场', 'https://mp.weixin.qq.com/s/rpj-7k0ck4EYgKL1cnZYTw', wechatArticle07],
      ['阿里千问开源Qwen3.8-27B模型', 'https://mp.weixin.qq.com/s/qCTfWeVhQUyNHywrwpyQqw', wechatArticle08]
    ].map(([title, href, cover]) => ({ title, href, cover }))
  }
}
document.querySelectorAll('[data-media-detail]').forEach((button) => button.addEventListener('click', (event) => {
  event.stopPropagation()
  const detail = mediaDetails[button.dataset.mediaDetail]
  if (detail) openPortfolioDetail(detail)
}))
const portfolioDetails = {
  rongyi: {
    title: '容医 · 智能医疗服务系统',
    type: 'SERVICE DESIGN / 01',
    sections: [
      ['项目经验', '面向偏远地区农民就医困难的问题，完成“容医”智能医疗服务系统设计。项目围绕偏远地区医疗资源不足、交通不便、就医成本较高以及信息获取困难等痛点，构建连接农民、乡镇卫生所、小城镇医院、移动医疗车和村委会等利益相关者的医疗服务体系。'],
      ['背景', '偏远地区的农民在就医过程中普遍面临医疗资源分布不均、出行距离较远、专业医疗人员不足和就医流程复杂等问题。“容医”通过智能医疗设备、移动医疗车和数字化服务平台，将基础检查、远程问诊、预约转诊和健康管理等服务延伸至乡村。'],
      ['职责', '负责前期背景研究、竞品分析、用户调研、用户画像、用户旅程、利益相关者分析、价值主张画布、服务系统图、服务蓝图、关键洞察点及移动端 UI 界面设计。'],
      ['使用软件', 'Adobe Illustrator、Adobe Photoshop、Fabrie、Figma、Midjourney、ChatGPT。'],
      ['成果', '通过定量研究收集 200 份用户信息并完成清洗分析；通过定性研究电话访谈 20 位偏远地区用户。最终完成服务系统、价值主张画布、服务蓝图、用户旅程、关键触点及部分移动端功能设计，为降低就医成本、缩短就医路径并提升医疗体验提供可执行方案。']
    ]
  },
  yacht: {
    title: '船舶 · 室内设计',
    type: 'SPATIAL DESIGN / 02',
    sections: [
      ['项目经验', '以海洋文化与日式美学为灵感，完成小型游艇自助餐厅的室内空间设计。项目将浮世绘、海浪纹样、纸灯笼等视觉元素融入船舶空间，探索文化主题、空间体验与游艇商业运营相结合的设计模式。'],
      ['背景', '以一艘价值约 600 万元、可容纳约 32 人的五星级小型游艇为对象，针对传统游艇空间功能单一、文化特色不足和运营成本较高等问题，将船舱改造为集餐饮、观景、社交与文化体验于一体的休闲空间。'],
      ['职责', '进行案例研究、目标用户与空间需求分析、主题概念提炼、功能分区规划、空间动线设计、平面布局绘制、手绘效果图表现、室内软装搭配、细节方案及商业模式设计。'],
      ['使用软件', 'AutoCAD、SketchUp、Adobe Photoshop、Adobe Illustrator、Midjourney、ChatGPT。'],
      ['成果', '完成概念方案、平面图、手绘效果图、空间效果展示及商业模式设计；在有限船舱内实现用餐、观景和社交等多种功能，形成具有鲜明海洋文化辨识度的沉浸式餐饮环境。']
    ]
  },
  stationery: {
    title: '组合式多功能文具收纳盒',
    type: 'PRODUCT DESIGN / 03',
    sections: [
      ['项目经验', '围绕“产品语意”与儿童积木形态开展文创产品设计，完成一款由胶水、橡皮、胶棒、四色荧光笔及双色胶带组合而成的多功能文具收纳盒。产品通过“加、减、乘、除”四种符号建立视觉识别。'],
      ['背景', '针对学生文具种类多、容易丢失、桌面收纳混乱以及传统文具盒功能单一等问题，将儿童积木的组合方式与数学符号的视觉语意融入设计，以模块化结构整合多种常用文具。'],
      ['职责', '进行市场与竞品调研、目标用户分析、使用场景梳理、情绪板制作、产品语意提炼、草图绘制、功能结构设计、模块组合探索、色彩与材质方案制定、三维建模、产品渲染以及爆炸图和细节展示。'],
      ['使用软件', 'Rhinoceros、KeyShot、Adobe Photoshop、Adobe Illustrator、Midjourney、ChatGPT。'],
      ['成果', '完成从前期调研、概念草图到三维建模、效果渲染及展示版式设计的完整流程。方案将多种文具整合为可拆卸、可替换的模块化产品；透明外壳便于观察内部物品，柔和莫兰迪配色强化亲和力与辨识度。']
    ]
  },
  visual: {
    title: '平面设计、手绘与视频剪辑',
    type: 'VISUAL PRACTICE / 04',
    sections: [
      ['项目经验', '围绕平面视觉、产品表现和动态影像开展多类型创作实践，涵盖海报设计、字体与版式实验、主题插画、产品建模渲染、工业设计手绘及短视频剪辑等方向。'],
      ['背景', '在个人创作与课程实践中，围绕艺术文化、青年情绪、社会议题、产品概念和影像传播等主题开展设计。平面作品注重字体、色彩和图形语言的实验性；手绘侧重产品形态推演与结构表达；视频结合影视、音乐与网络文化进行内容策划和视听语言探索。'],
      ['职责', '负责创意主题策划、资料与视觉素材收集、情绪板制作、字体与版式设计、海报视觉系统设计、插画绘制、产品草图与形态推演、三维建模与渲染、视频脚本构思、素材筛选、剪辑节奏控制、字幕包装及封面设计。'],
      ['使用软件', 'Adobe Photoshop、Adobe Illustrator、Adobe Premiere、Adobe After Effects、Procreate、Rhinoceros、KeyShot、Midjourney、ChatGPT。'],
      ['成果', '完成多组主题海报、视觉实验、产品渲染、工业设计手绘及短视频作品，形成个人创作体系；部分单条视频播放量达到数十万，展现跨媒介整合与独立完成项目的能力。']
    ]
  }
}
function openPortfolioDetail(detail) {
  document.querySelector('#detail-title').textContent = detail.title
  document.querySelector('#detail-type').textContent = detail.type
  document.querySelector('#detail-kicker').textContent = `${detail.type.replaceAll(' ', '_')}.TXT`
  const articleCards = detail.articles ? `<div class="article-grid">${detail.articles.map((article) => `<a class="article-card" href="${article.href}" target="_blank" rel="noopener noreferrer"><img src="${article.cover}" alt="${article.title} 封面" /><span>${article.title}</span><b>READ ↗</b></a>`).join('')}</div>` : ''
  document.querySelector('#detail-copy').innerHTML = detail.sections.map(([heading, copy]) => `<section><b>${heading}</b><p>${copy}</p></section>`).join('') + articleCards
  document.querySelector('#detail-image').hidden = true
  detailDialog.hidden = false
}
document.querySelectorAll('[data-portfolio-detail]').forEach((button) => button.addEventListener('click', () => openPortfolioDetail(portfolioDetails[button.dataset.portfolioDetail])))
document.querySelectorAll('.filter-row:not(.work-filter) > button, .media-filter > button[data-filter]').forEach((button) => button.addEventListener('click', () => {
  const type = button.dataset.filter
  document.querySelectorAll('.filter-row:not(.work-filter) > button, .media-filter > button[data-filter]').forEach((item) => item.classList.toggle('active', item === button))
  document.querySelectorAll('.timeline article').forEach((article) => { article.hidden = type !== 'all' && !article.dataset.type.split(' ').includes(type) })
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.5 : 1.75))
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
