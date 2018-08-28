import React from 'react'
import PropTypes from 'prop-types'
import { moduleContext } from 'react-contextual'
import CanvasImpl from 'awv3/core/canvas'

@moduleContext()
export default class Canvas extends React.PureComponent {
  static propTypes = { resolution: PropTypes.number }
  onContextMenu = event => event.preventDefault()

  constructor(props) {
    super()
    const options = {}
    if (props.resolution) options.resolution = props.resolution
    this.interface = new CanvasImpl(options)
  }

  componentDidMount() {
    this.interface.dom.style.position = 'absolute'
    this.ref.insertBefore(this.interface.dom, this.ref.firstChild)
    setTimeout(() => this.interface.renderer && this.interface.renderer.resize(), 200)
  }

  componentWillUnmount() {
    if (this.interface) {
      this.interface.destroy()
    }
  }

  catchRef = ref => (this.ref = ref)

  render() {
    const { resolution, children, style, context: Context, ...props } = this.props
    return (
      <Context.Provider value={this.interface}>
        <div
          onContextMenu={this.onContextMenu}
          ref={this.catchRef}
          {...props}
          style={{ height: '100%', width: '100%', overflow: 'hidden', ...style }}>
          {children}
        </div>
      </Context.Provider>
    )
  }
}
