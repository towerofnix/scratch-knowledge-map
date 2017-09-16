class ActivityView {
  constructor() {
    this.root = null
    this.iframe = null
    this.shown = false

    this.events = new EventEmitter()
    this.events.addEvent('markAsComplete')
    this.events.addEvent('markAsNotComplete')
  }

  render() {
    if (this.root === null) {
      this.root = document.createElement('div')
    } else {
      while (this.root.firstChild) {
        this.root.firstChild.remove()
      }
    }

    Object.assign(this.root.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      padding: '40px',
      boxSizing: 'border-box',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 999,
      display: 'none'
    })

    this.updateShowStyle()

    const main = document.createElement('div')
    this.root.appendChild(main)

    Object.assign(main.style, {
      width: '100%',
      height: '100%',
      padding: '10px',
      boxSizing: 'border-box',
      borderRadius: '4px',
      backgroundColor: 'white',

      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start'
    })

    this.iframe = document.createElement('iframe')
    this.iframe.setAttribute('src', this.documentFile)
    main.appendChild(this.iframe)

    Object.assign(this.iframe.style, {
      border: '0',
      borderRadius: '2px',

      flexGrow: '1'
    })

    const tools = document.createElement('div')
    main.appendChild(tools)

    Object.assign(tools.style, {
      marginTop: '10px'
    })

    const closeButton = document.createElement('button')
    closeButton.appendChild(document.createTextNode('Close'))
    closeButton.addEventListener('click', () => this.closeClicked())
    tools.appendChild(closeButton)

    tools.appendChild(document.createTextNode(' '))

    const completeButton = document.createElement('button')
    completeButton.appendChild(document.createTextNode('Mark as completed'))
    completeButton.addEventListener('click', () => this.completeClicked())
    tools.appendChild(completeButton)

    tools.appendChild(document.createTextNode(' '))

    const notCompleteButton = document.createElement('button')
    notCompleteButton.appendChild(
      document.createTextNode('Mark as not completed')
    )
    notCompleteButton.addEventListener('click',
      () => this.notCompleteClicked()
    )
    tools.appendChild(notCompleteButton)
  }

  closeClicked() {
    this.hide()
  }

  completeClicked() {
    this.hide()
    this.events.emit('markAsComplete')
  }

  notCompleteClicked() {
    this.hide()
    this.events.emit('markAsNotComplete')
  }

  loadDocument(basename) {
    this.documentBasename = basename

    if (this.iframe !== null) {
      this.iframe.setAttribute('src', this.documentFile)
    }
  }

  get documentFile() {
    if (this.documentBasename) {
      return `activities/${this.documentBasename}.html`
    } else {
      return 'activities/no-activity.html'
    }
  }

  show() {
    this.shown = true
    this.updateShowStyle()
  }

  hide() {
    this.shown = false
    this.updateShowStyle()
  }

  updateShowStyle() {
    if (this.root) {
      this.root.style.display = this.shown ? 'block' : 'none'
    }
  }
}
