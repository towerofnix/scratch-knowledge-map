'use strict'

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
