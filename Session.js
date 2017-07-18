import * as THREE from 'three'
import React from 'react'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'
import Defaults from 'awv3/core/defaults'
import pool from 'awv3/misc/presentation'
import protocol from 'awv3/communication/socketio'
import SessionImpl from 'awv3/session'
import { actions as connectionActions } from 'awv3/session/store/connections'
import pack from 'awv3-protocol/pack'
import Canvas from './Canvas'
import View from './View'
import Csys from './Csys'

export default class Session extends React.PureComponent {
    static propTypes = {
        debug: PropTypes.bool,
        pool: PropTypes.func,
        protocol: PropTypes.func,
        url: PropTypes.string,
        materials: PropTypes.object,
        resources: PropTypes.object,
        store: PropTypes.object,
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
    }
    static childContextTypes = { session: PropTypes.object }

    constructor(props) {
        super()
        this.interface = window.session = new SessionImpl(props)
    }

    getChildContext() {
        return { session: this.interface }
    }

    getInterface() {
        return this.interface
    }

    componentDidMount() {
        // Get view and add the sessions pool into its scene
        this.view = this.ref.getInterface()
        this.view.scene.add(this.interface.pool)
    }

    componentWillUnmount() {
        // Destroy session?
    }

    doubleClick = event => this.view.updateBounds().controls.focus().zoom()

    openFile = event => {
        return new Promise(res => {
            let file = event.target.files[0]
            if (file) {
                let name = file.name.substr(0, file.name.lastIndexOf('.'))
                let extension = file.name.substr(file.name.lastIndexOf('.') + 1)
                var reader = new FileReader()
                reader.onload = event => {
                    let data = pack(event.target.result)
                    let connection = this.interface.addConnection(file.name)
                    connection.on('connected', async () => {
                        const result = await this.interface.store.dispatch(
                            connectionActions.load(connection.id, data, extension),
                        )
                        connection.pool.view.updateBounds().controls.focus().zoom().rotate(Math.PI, Math.PI / 2)
                        res(result)
                    })
                }
                reader.readAsArrayBuffer(file)
            }
        })
    }

    render() {
        if (this.props.store) return this.renderCanvas()
        else {
            return (
                <Provider store={this.interface.store}>
                    {this.renderCanvas()}
                </Provider>
            )
        }
    }

    renderCanvas() {
        return (
            <div className={this.props.className} style={this.props.style}>
                <Canvas
                    style={{ position: 'absolute', top: 0, left: 0, ...this.props.canvasStyle }}
                    resolution={this.props.resolution}
                    onDoubleClick={this.doubleClick}>
                    <View ref={ref => (this.ref = ref)} up={this.props.up} stats={this.props.stats}>
                        <Csys
                            textures={this.props.csysTextures}
                            style={{
                                position: 'absolute',
                                bottom: 2,
                                left: 2,
                                width: 80,
                                height: 80,
                                ...this.props.csysStyle,
                            }}
                        />
                    </View>
                </Canvas>
                {this.props.children}
            </div>
        )
    }
}