'use strict'

const SVG_XMLNS = 'http://www.w3.org/2000/svg'

const createSVGElement = tag => document.createElementNS(SVG_XMLNS, tag)

const UNLOCKED = Symbol('Unlocked')
const COMPLETED = Symbol('Completed')
const LOCKED = Symbol('Locked')

const statusColors = {
  [UNLOCKED]: '#275',
  [COMPLETED]: '#257',
  [LOCKED]: '#444'
}

class ActivityMapGraph extends NodeGraph {
  constructor() {
    super()

    this.completedActivityNodes = []
  }

  getStatusOfActivity(node, parents = []) {
    // Guard against infinite recursion.
    if (parents.includes(node)) {
      throw new Error('Recursive chain:', parents)
    }

    if (this.completedActivityNodes.includes(node)) {
      return COMPLETED
    }

    const dependents = this.connections
      .filter(({from, to}) => to === node)
      .map(({from, to}) => from)

    return (dependents.some(dep =>
      this.getStatusOfActivity(dep, parents.concat([node])) !== COMPLETED
    )) ? LOCKED : UNLOCKED
  }

  loadCompletedActivities(string = '') {
    this.completedActivityNodes.push(
      ...string.split('§').map(node => this.findNodeByLabel(node))
        .filter(Boolean)
    )
  }

  saveCompletedActivities() {
    return this.completedActivityNodes.map(node => {
      return node.label
    }).join('§')
  }
}

class ActivityMap {
  constructor() {
    this.graph = new ActivityMapGraph()

    this.events = new EventEmitter()
    this.events.addEvent('openActivity')

    this.root = null
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

      const status = this.graph.getStatusOfActivity(node)

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

    this.svg = svg
  }

  nodeClicked(node) {
    this.events.emit('openActivity', node)
  }
}

