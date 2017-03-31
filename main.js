
const statusColors = {
  unlocked: '#275',
  complete: '#257',
  locked: '#444'
}

const completedActivities = [
  'Variables', 'Local variables', 'Sprites', 'Clones'
]

const getStatusOfActivity = (name, parents = []) => {
  // Guard against infinite recursion.
  if (parents.includes(name)) {
    throw new Error('Bad chain:', parents)
  }

  if (completedActivities.includes(name)) {
    return 'complete'
  }

  const dependents = connections.filter(([from, to]) => to === name)
    .map(([from, to]) => from)

  return (dependents.some(dep =>
    getStatusOfActivity(dep, parents.concat([name])) !== 'complete'
  )) ? 'locked' : 'unlocked'
}

const nodes = [
  [-700, 0, 'Coordinates'],
  [-500, 0, 'Sprites'],
  [-575, 125, 'Sprite positions'],
  [-425, 125, 'Sprite rotation'],
  [-575, 250, 'Sprite motion'],

  [-800, 250, 'Clones'],
  [-800, 375, 'Is an object a clone?'],
  [-800, 500, 'Identifying clones'],

  [-1125, 0, 'Variables'],
  [-1125 + 75, 125, 'Local variables'],
  [-1125 - 75, 125, 'Cloud variables'],
  [-1350, 500, 'External interfacing with the cloud'],

  [-1600, 0, 'Lists'],
  [-1600, 125, 'List manipulation'],
  [-1600 + 125, 125, 'Lists as text'],
  [-1600 + 125, 250, 'Text manipulation with lists'],

  [-125, 0, 'Costumes'],
  [-125, 125, 'Programming costumes'],
  [-125 + 150, 125, 'Importing costumes'],
  [-125 + 150, 250, 'Exporting costumes']
]

const connections = [
  ['Sprites', 'Sprite positions'],
  ['Sprites', 'Sprite rotation'],
  ['Coordinates', 'Sprite positions'],
  ['Sprite positions', 'Sprite motion'],

  ['Variables', 'Cloud variables'],
  ['Variables', 'Local variables'],

  ['Cloud variables', 'External interfacing with the cloud'],

  ['Lists', 'List manipulation'],
  ['Lists', 'Lists as text'],
  ['Lists as text', 'Text manipulation with lists'],
  ['List manipulation', 'Text manipulation with lists'],

  ['Sprites', 'Clones'],
  ['Local variables', 'Is an object a clone?'],
  ['Clones', 'Is an object a clone?'],
  ['Is an object a clone?', 'Identifying clones'],

  ['Costumes', 'Programming costumes'],
  ['Costumes', 'Importing costumes'],
  ['Importing costumes', 'Exporting costumes']
]

const xmlns = 'http://www.w3.org/2000/svg'

const createNS = tag => document.createElementNS(xmlns, tag)
const tagNS = (el, attr, val) => el.setAttributeNS(xmlns, attr, val)

Object.assign(document.body.style, {
  padding: 0,
  margin: 0
})

const container = document.createElement('div')
Object.assign(container.style, {
  width: '100vw',
  height: '100vh',
  overflow: 'scroll',
  position: 'relative'
})

const root = document.createElement('div')
Object.assign(root.style, {
  backgroundImage: 'url("tile.png")',
  minWidth: '100%',
  minHeight: '100%',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

const svg = createNS('svg')
svg.setAttribute('xmlns', xmlns)

const pad = 100
const rootMaxX = nodes.reduce((o, [x, y]) => x > o ? x : o, 0)
const rootMinX = nodes.reduce((o, [x, y]) => x < o ? x : o, 0)
const rootWidth = rootMaxX - rootMinX
const rootMaxY = nodes.reduce((o, [x, y]) => y > o ? y : o, 0)
const rootMinY = nodes.reduce((o, [x, y]) => y < o ? y : o, 0)
const rootHeight = rootMaxY - rootMinY
svg.setAttribute('width', rootWidth + 2 * pad)
svg.setAttribute('height', rootHeight + 2 * pad)
svg.setAttribute('viewBox',
  `0 0 ${rootWidth + 2 * pad} ${rootHeight + 2 * pad}`)

const realX = x => x + (0 - rootMinX) + pad
const realY = y => y + (0 - rootMinY) + pad

for (let connection of connections) {
  const findNode = name => nodes.find(item => item[2] === name)

  const from = findNode(connection[0])
  const to = findNode(connection[1])

  if (from == null) {
    console.warn(`Nonexistant connection node (from) ${connection[0]}`)
    continue
  }

  if (to == null) {
    console.warn(`Nonexistant connection node (to) ${connection[1]}`)
    continue
  }

  const [ fromX, fromY ] = from
  const [ toX, toY ] = to

  if (toY <= fromY) {
    console.warn(
      `Connection "${connection[0]}" -> "${connection[1]}" may have a ` +
      'wrong order?'
    )
  }

  const line = createNS('line')
  line.setAttribute('x1', realX(fromX))
  line.setAttribute('y1', realY(fromY))
  line.setAttribute('x2', realX(toX))
  line.setAttribute('y2', realY(toY))
  line.setAttribute('stroke', '#555')
  line.setAttribute('stroke-width', 2)
  svg.appendChild(line)
}

for (let node of nodes) {
  const [ x, y, label ] = node

  const rect = createNS('rect')
  rect.setAttribute('x', realX(x) - 20)
  rect.setAttribute('y', realY(y) - 20)
  rect.setAttribute('width', 40)
  rect.setAttribute('height', 40)
  rect.setAttribute('fill', statusColors[getStatusOfActivity(label)])
  rect.setAttribute('stroke', 'black')
  rect.setAttribute('stroke-width', '2')
  svg.appendChild(rect)

  const text = createNS('text')
  text.appendChild(document.createTextNode(label))
  text.setAttribute('x', realX(x))
  text.setAttribute('y', realY(y) + 40)
  text.setAttribute('fill', '#CCC')
  text.setAttribute('text-anchor', 'middle')
  svg.appendChild(text)
}

root.appendChild(svg)

Object.assign(root.style, {width: rootWidth + 'px', height: rootHeight + 'px'})

container.appendChild(root)
document.body.appendChild(container)
