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
    static contextTypes = { session: PropTypes.object }

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
        interpolatePoints: PropTypes.bool,
        drop: PropTypes.bool,
        onOpen: PropTypes.func,
        onInitConnection: PropTypes.func,
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
        drop: false,
    }
    static childContextTypes = { session: PropTypes.object }

    state = { onDrop: false }

    constructor(props, context) {
        super()
        this.interface = window.session = context.session || new SessionImpl(props)
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

    open(files) {
        files = [...files]
        this.setState({ onDrop: false })
        if (this.props.drop) {
            const promise = Promise.all(
                files.map(file => {
                    return new Promise(res => {
                        let name = file.name.substr(0, file.name.lastIndexOf('.'))
                        let extension = file.name.substr(file.name.lastIndexOf('.') + 1)
                        var reader = new FileReader()
                        reader.onload = event => {
                            let data = pack(event.target.result)
                            let connection = this.interface.addConnection(file.name)
                            connection.on('connected', async () => {
                                if (this.props.onInitConnection)
                                    await this.props.onInitConnection(connection)
                                const result = await this.interface.store.dispatch(
                                    connectionActions.load(connection.id, data, extension),
                                )

                                connection.pool.view &&
                                    connection.pool.view
                                        .updateBounds()
                                        .controls.focus()
                                        .zoom()
                                        .rotate(Math.PI, Math.PI / 2)

                                res({ ...result, connection })
                            })
                        }
                        reader.readAsArrayBuffer(file)
                    })
                }),
            )

            if (this.props.onOpen) this.props.onOpen(promise)
            return promise
        }
    }

    openFile = event => this.open(event.target.files)
    onDrop = event => event.preventDefault() || this.open(event.dataTransfer.files)
    onDragEnter = event => event.preventDefault() || this.setState({ onDrop: true })
    onDragLeave = event => event.preventDefault() || this.setState({ onDrop: false })
    onDragOver = event => event.preventDefault()
    onDoubleClick = event =>
        this.view
            .updateBounds()
            .controls.focus()
            .zoom()

    render() {
        if (this.context.session) return this.renderCanvas()
        else return <Provider store={this.interface.store}>{this.renderCanvas()}</Provider>
    }

    renderCanvas() {
        const { onDrop } = this.state
        const { style, canvasStyle, className, resolution, up, stats, csys, children } = this.props
        return (
            <div className={className} style={style}>
                <Canvas
                    style={{
                        position: 'absolute',
                        transition: 'background-color 0.5s',
                        top: 0,
                        left: 0,
                        backgroundColor: onDrop ? 'rgba(0, 0, 0, 0.25)' : 'transparent',
                        ...canvasStyle,
                    }}
                    resolution={resolution}
                    onDoubleClick={this.onDoubleClick}
                    onDragOver={this.onDragOver}
                    onDragEnter={this.onDragEnter}
                    onDragLeave={this.onDragLeave}
                    onDrop={this.onDrop}>
                    <View ref={ref => (this.ref = ref)} up={up} stats={stats}>
                        <Csys
                            style={{
                                position: 'absolute',
                                bottom: 2,
                                left: 2,
                                width: 80,
                                height: 80,
                            }}
                            {...csys}
                        />
                    </View>
                </Canvas>
                {children}
            </div>
        )
    }
}
