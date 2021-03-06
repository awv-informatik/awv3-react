import * as THREE from 'three'
import React from 'react'
import ReactDOM from 'react-dom'
import { moduleContext } from 'react-contextual'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import Defaults from 'awv3/core/defaults'
import SessionImpl from 'awv3/session'
import CubeTexture from 'awv3/three/cubetexture'
import protocol from 'awv3/communication/socketio'
import pool from 'awv3/misc/presentation'

@moduleContext()
export default class SessionProvider extends React.PureComponent {
  static propTypes = {
    debug: PropTypes.bool,
    pool: PropTypes.func,
    protocol: PropTypes.func,
    url: PropTypes.string,
    materials: PropTypes.object,
    resources: PropTypes.object,
    gpu: PropTypes.bool,
    resolution: PropTypes.number,
    up: PropTypes.array,
    stats: PropTypes.bool,
    updateView: PropTypes.object,
    renderOrder: PropTypes.object,
    lineShader: PropTypes.func,
    lineShaderOptions: PropTypes.object,
    meshShader: PropTypes.func,
    meshShaderOptions: PropTypes.object,
    envMap: PropTypes.object,
    csysTextures: PropTypes.array,
    interpolatePoints: PropTypes.bool,
  }
  static defaultProps = {
    debug: Defaults.debug,
    pool,
    protocol,
    url: 'http://localhost:8181',
    materials: Defaults.materials,
    resolution: Defaults.resolution,
    up: Defaults.up,
    stats: Defaults.stats,
    updateView: Defaults.updateView,
    renderOrder: Defaults.renderOrder,
    meshShader: Defaults.meshShader,
    meshShaderOptions: Defaults.meshShaderOptions,
    interpolatePoints: false,
  }

  state = { onDrop: false }

  constructor(props) {
    super()
    this.interface = window.session = props.session || new SessionImpl(props)
  }

  componentWillUnmount() {
    // Destroy session?
  }

  render() {
    const { className, style, children, context: Context } = this.props
    return (
      <Provider store={this.interface.store}>
        <Context.Provider value={this.interface}>{children}</Context.Provider>
      </Provider>
    )
  }
}
