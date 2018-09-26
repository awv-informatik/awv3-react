import React from 'react'
import { subscribe, Subscribe } from 'react-contextual'
import PropTypes from 'prop-types'
import Presentation from 'awv3/misc/presentation'
import SessionProvider from './SessionProvider'
import Canvas from './Canvas'
import View from './View'
import ViewCube from './ViewCube'

@subscribe([SessionProvider, View], (session, viewSession) => ({ session, viewSession }))
export default class Csys extends React.PureComponent {
  static propTypes = {
    textures: PropTypes.array,
    radius: PropTypes.number,
    chamfer: PropTypes.number,
    opacity: PropTypes.number,
    showAxes: PropTypes.bool,
    showFaceNames: PropTypes.bool,
  }
  static defaultProps = { radius: 14, chamfer: 0.35, opacity: 1, showAxes: false, showFaceNames: false }

  componentWillUnmount() {
    this.unsub && this.unsub()
  }

  render() {
    return (
      <Canvas style={this.props.style} resolution={2} className="csys">
        <View up={this.props.viewSession.camera.up.toArray()}>
          <Subscribe to={View} select={viewCsys => ({ viewCsys })}>
            {({ viewCsys }) => ViewCube.init({ ...this.props, viewCsys }) || null}
          </Subscribe>
        </View>
      </Canvas>
    )
  }
}
