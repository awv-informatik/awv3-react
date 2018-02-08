import * as THREE from 'three'
import React from 'react'
import PropTypes from 'prop-types'
import Defaults from 'awv3/core/defaults'
import ViewImpl from 'awv3/core/view'
import { subscribe, moduleContext } from 'react-contextual'
import SessionProvider from './SessionProvider'
import Canvas from './Canvas'

@moduleContext()
@subscribe([SessionProvider.Context, Canvas.Context], ([session, canvas]) => ({ session, canvas }))
export default class View extends React.PureComponent {
    static propTypes = { up: PropTypes.array, stats: PropTypes.bool, ambientIntensity: PropTypes.number }
    static defaultProps = { up: Defaults.up, stats: Defaults.stats, ambientIntensity: Defaults.ambientIntensity }

    constructor(props) {
        super()
        this.interface = new ViewImpl(props.canvas, {
            up: new THREE.Vector3(...props.up),
            ambientIntensity: props.ambientIntensity,
            stats: props.stats,
        })
    }

    componentDidMount() {
        this.interface.scene.add(this.props.session.pool)
    }

    componentWillUnmount() {
        if (this.interface) {
            this.interface.destroy()
            delete this.interface
        }
    }

    render() {
        const Context = this.props.context
        return <Context.Provider value={this.interface} children={this.props.children || null} />
    }
}
