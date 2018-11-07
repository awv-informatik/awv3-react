import * as THREE from 'three'
import React from 'react'
import { Provider } from 'react-redux'
import { moduleContext, subscribe } from 'react-contextual'
import PropTypes from 'prop-types'
import Defaults from 'awv3/core/defaults'
import pool from 'awv3/misc/presentation'
import protocol from 'awv3/communication/socketio'
import SessionImpl from 'awv3/session'
import { actions as connectionActions } from 'awv3/session/store/connections'
import Canvas from './Canvas'
import View from './View'
import Csys from './Csys'
import SessionProvider from './SessionProvider'

const styles = {
  canvas: { position: 'absolute', ransition: 'background-color 0.5s', top: 0, left: 0 },
  csys: { position: 'absolute', bottom: 2, left: 2, width: 80, height: 80 },
}

@moduleContext()
@subscribe(SessionProvider, session => ({ session }))
export default class Session extends React.PureComponent {
  static propTypes = {
    drop: PropTypes.bool,
    onOpen: PropTypes.func,
    onInitConnection: PropTypes.func,
    csys: PropTypes.object,
  }

  static defaultProps = {
    interpolatePoints: false,
    drop: false,
  }

  state = { onDrop: false }

  constructor(props) {
    super()
  }

  open(files) {
    const { session, onInitConnection, onOpen } = this.props
    this.setState({ onDrop: false })
    return session.open(files, onInitConnection, onOpen)
  }

  openFile = event => this.open(event.target.files)
  onDrop = event =>
    event.preventDefault() ||
    this.setState({ onDrop: false }, this.props.onDragLeave) ||
    this.open(event.dataTransfer.files)
  onDragEnter = event => event.preventDefault() || this.setState({ onDrop: true }, this.props.onDragEnter)
  onDragLeave = event => event.preventDefault() || this.setState({ onDrop: false }, this.props.onDragLeave)
  onDragOver = event => event.preventDefault()
  onDoubleClick = event => {
    if (this.props.session.pool.view)
      this.props.session.pool.view
        .updateBounds()
        .controls.focus()
        .zoom()
  }
  render() {
    const { onDrop } = this.state
    const { style, canvasStyle, className, resolution, up, stats, csys, children, context, drop, ...rest } = this.props
    return (
      <div className={className} style={style}>
        <Canvas
          style={{ ...styles.canvas, backgroundColor: 'transparent', ...canvasStyle }}
          resolution={resolution}
          onDoubleClick={this.onDoubleClick}
          onDragOver={drop ? this.onDragOver : null}
          onDragEnter={drop ? this.onDragEnter : null}
          onDragLeave={drop ? this.onDragLeave : null}
          onDrop={drop ? this.onDrop : null}>
          <View up={up} stats={stats} pool={this.props.session.pool}>
            {csys && csys.visible !== false && <Csys style={csys.style} {...csys} startUp={up} />}
          </View>
        </Canvas>
        {children && <context.Provider value={this} children={children} />}
      </div>
    )
  }
}
