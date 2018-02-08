import * as THREE from 'three'
import React from 'react'
import { Provider } from 'react-redux'
import { subscribe } from 'react-contextual'
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
import SessionProvider from './SessionProvider'

@subscribe(SessionProvider.Context, session => ({ session }))
export default class Session extends React.PureComponent {
    static propTypes = {
        drop: PropTypes.bool,
        onOpen: PropTypes.func,
        onInitConnection: PropTypes.func,
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
        const { session, drop, onInitConnection, onOpen } = this.props

        files = Array.from(files)
        this.setState({ onDrop: false })
        if (drop) {
            const promise = Promise.all(
                files.map(file => {
                    return new Promise(res => {
                        let name = file.name.substr(0, file.name.lastIndexOf('.'))
                        let extension = file.name.substr(file.name.lastIndexOf('.') + 1)
                        var reader = new FileReader()
                        reader.onload = event => {
                            let data = pack(event.target.result)
                            let connection = session.addConnection(file.name)
                            connection.on('connected', async () => {
                                if (onInitConnection) await onInitConnection(connection)
                                const result = await session.store.dispatch(connectionActions.load(connection.id, data, extension))

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

            if (onOpen) onOpen(promise)
            return promise
        }
    }

    openFile = event => this.open(event.target.files)
    onDrop = event => event.preventDefault() || this.open(event.dataTransfer.files)
    onDragEnter = event => event.preventDefault() || this.setState({ onDrop: true })
    onDragLeave = event => event.preventDefault() || this.setState({ onDrop: false })
    onDragOver = event => event.preventDefault()
    onDoubleClick = event =>
        this.session.view &&
        this.session.view
            .updateBounds()
            .controls.focus()
            .zoom()

    render() {
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
                        {csys.visible !== false && (
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
                        )}
                    </View>
                </Canvas>
                {children}
            </div>
        )
    }
}
