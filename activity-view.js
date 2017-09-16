class ActivityView {
  constructor() {
    this.root = null
    this.iframe = null
    this.shown = false
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

    this.iframe = document.createElement('iframe')
    this.iframe.setAttribute('src', this.documentFile)
    this.root.appendChild(this.iframe)

    Object.assign(this.iframe.style, {
      width: '100%',
      height: '100%'
    })
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
