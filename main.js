'use strict'

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

  // Serialization is broken and not really useful.. disable - for now.
  /*
  const serializeButton = document.createElement('button')
  serializeButton.appendChild(document.createTextNode('Export SVG'))
  serializeButton.addEventListener('click', () => {
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(activityMap.svg)
    window.open('data:image/svg+xml,' + svgString)
  })
  tools.appendChild(serializeButton)
  */

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
