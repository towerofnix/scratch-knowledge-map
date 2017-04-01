
const SVG_XMLNS = 'http://www.w3.org/2000/svg'

const createSVGElement = tag => document.createElementNS(SVG_XMLNS, tag)

class NodeGraph {
  constructor() {
    this.nodes = []
    this.connections = []
  }

  getDimensions() {
    const maxX = this.nodes.reduce((o, {x, y}) => x > o ? x : o, 0)
    const minX = this.nodes.reduce((o, {x, y}) => x < o ? x : o, 0)
    const width = maxX - minX
    const maxY = this.nodes.reduce((o, {x, y}) => y > o ? y : o, 0)
    const minY = this.nodes.reduce((o, {x, y}) => y < o ? y : o, 0)
    const height = maxY - minY

    return {width, height, minX, minY, maxX, maxY}
  }

  findNodeByLabel(label) {
    return this.nodes.find(item => item.label === label)
  }

  loadNodes(nodeData) {
    this.nodes = nodeData
      .map(([x, y, label]) => {
        return new NodeGraph.Node(label, x, y)
      })
  }

  loadConnections(connectionData) {
    this.connections = connectionData
      .map(([fromLabel, toLabel]) => {
        const fromNode = this.findNodeByLabel(fromLabel)
        const toNode = this.findNodeByLabel(toLabel)
        return new NodeGraph.Connection(fromNode, toNode)
      })
  }
}

NodeGraph.Node = class {
  constructor(label, x, y) {
    this.label = label
    this.x = x
    this.y = y
  }
}

NodeGraph.Connection = class {
  constructor(from, to) {
    this.from = from
    this.to = to
  }
}

const UNLOCKED = Symbol('Unlocked')
const COMPLETED = Symbol('Completed')
const LOCKED = Symbol('Locked')

class ActivityMap {
  constructor() {
    this.graph = new NodeGraph()

    this.root = null

    this.completedActivities = []
  }

  getStatusOfActivity (node, parents = []) {
    // Guard against infinite recursion.
    if (parents.includes(node)) {
      throw new Error('Bad chain:', parents)
    }

    if (this.completedActivities.includes(node)) {
      return COMPLETED
    }

    const dependents = this.graph.connections
      .filter(({from, to}) => to === node)
      .map(({from, to}) => from)

    return (dependents.some(dep =>
      this.getStatusOfActivity(dep, parents.concat([node])) !== COMPLETED
    )) ? LOCKED : UNLOCKED
  }

  loadCompletedActivities(string = '') {
    this.completedActivities.push(
      ...string.split('§').map(node => this.graph.findNodeByLabel(node))
        .filter(Boolean)
    )
  }

  saveCompletedActivities() {
    return this.completedActivities.map(node => {
      return node.label
    }).join('§')
  }

  render() {
    const { nodes, connections } = this.graph

    const dimensions = this.graph.getDimensions()
    const pad = 100

    if (this.root === null) {
      this.root = document.createElement('div')
    } else {
      while (this.root.firstChild) {
        this.root.removeChild(this.root.firstChild)
      }
    }

    Object.assign(this.root.style, {
      backgroundImage: 'url("tile.png")',
      minWidth: '100%',
      minHeight: '100%',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: dimensions.width + 'px',
      height: dimensions.height + 'px'
    })

    const svg = createSVGElement('svg')
    svg.setAttribute('xmlns', SVG_XMLNS)

    const rootWidth = dimensions.width + (2 * pad)
    const rootHeight = dimensions.height + (2 * pad)

    svg.setAttribute('width', rootWidth)
    svg.setAttribute('height', rootHeight)
    svg.setAttribute('viewBox', `0 0 ${rootWidth} ${rootHeight}`)

    const getRenderX = x => x + (0 - dimensions.minX) + pad
    const getRenderY = y => y + (0 - dimensions.minY) + pad

    for (let connection of connections) {
      const { from, to } = connection

      if (from == null) {
        console.warn(`Nonexistant connection node (from): ${from}`)
        continue
      }

      if (to == null) {
        console.warn(`Nonexistant connection node (to): ${to}`)
        continue
      }

      const { x: fromX, y: fromY } = from
      const { x: toX, y: toY } = to

      if (toY <= fromY) {
        console.warn(
          `Connection "${from.label}" -> "${to.label}" may have a ` +
          'wrong order?'
        )
      }

      const line = createSVGElement('line')
      line.setAttribute('x1', getRenderX(fromX))
      line.setAttribute('y1', getRenderY(fromY))
      line.setAttribute('x2', getRenderX(toX))
      line.setAttribute('y2', getRenderY(toY))
      line.setAttribute('stroke', '#555')
      line.setAttribute('stroke-width', 2)
      svg.appendChild(line)
    }

    for (let node of nodes) {
      const { x, y, label } = node

      const status = activityMap.getStatusOfActivity(node)

      const rect = createSVGElement('rect')
      rect.setAttribute('x', getRenderX(x) - 20)
      rect.setAttribute('y', getRenderY(y) - 20)
      rect.setAttribute('width', 40)
      rect.setAttribute('height', 40)
      rect.setAttribute('fill', statusColors[status])
      rect.setAttribute('stroke', 'black')
      rect.setAttribute('stroke-width', '2')
      svg.appendChild(rect)

      const text = createSVGElement('text')
      text.appendChild(document.createTextNode(label))
      text.setAttribute('x', getRenderX(x))
      text.setAttribute('y', getRenderY(y) + 40)
      text.setAttribute('fill', '#CCC')
      text.setAttribute('text-anchor', 'middle')
      svg.appendChild(text)

      rect.addEventListener('click', () => this.nodeClicked(node))
    }

    this.root.appendChild(svg)
  }

  nodeClicked(node) {
    if (this.completedActivities.includes(node)) {
      this.completedActivities
        .splice(this.completedActivities.indexOf(node), 1)
    } else {
      this.completedActivities.push(node)
    }
    this.render()
  }
}

const statusColors = {
  [UNLOCKED]: '#275',
  [COMPLETED]: '#257',
  [LOCKED]: '#444'
}

const activityMap = new ActivityMap()

activityMap.graph.loadNodes([
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
])

activityMap.graph.loadConnections([
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
])

const renderAll = () => {
  Object.assign(document.body.style, {
    padding: 0,
    margin: 0
  })

  const dimensions = activityMap.graph.getDimensions()

  const container = document.createElement('div')
  Object.assign(container.style, {
    width: '100vw',
    height: '100vh',
    overflow: 'scroll',
    position: 'relative'
  })

  activityMap.render()

  container.appendChild(activityMap.root)

  document.body.appendChild(container)

  const tools = document.createElement('div')
  Object.assign(tools.style, {
    position: 'fixed',
    top: '20px',
    left: '20px'
  })

  const serializeButton = document.createElement('button')
  serializeButton.appendChild(document.createTextNode('Export SVG'))
  serializeButton.addEventListener('click', () => {
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svg)
    window.open('data:image/svg+xml,' + svgString)
  })
  tools.appendChild(serializeButton)

  document.body.appendChild(tools)
}

const loadActivities = () => {
  activityMap.loadCompletedActivities(localStorage.completedActivities)
}

loadActivities()
renderAll()

window.onbeforeunload = function() {
  localStorage.completedActivities = activityMap.saveCompletedActivities()
}
