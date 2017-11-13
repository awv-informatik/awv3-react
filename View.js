import * as THREE from 'three'
import React from 'react'
import PropTypes from 'prop-types'
import Defaults from 'awv3/core/defaults'
import ViewImpl from 'awv3/core/view'

export default class View extends React.PureComponent {
    static propTypes = { up: PropTypes.array, stats: PropTypes.bool, ambientIntensity: PropTypes.number }
    static defaultProps = { up: Defaults.up, stats: Defaults.stats, ambientIntensity: Defaults.ambientIntensity }
    static contextTypes = { canvas: PropTypes.object }
    static childContextTypes = { view: PropTypes.object }
    getChildContext = () => ({ view: this.interface })

    getInterface() {
        return this.interface
    }
    
    constructor(props, context) {
        super()
        this.interface = new ViewImpl(context.canvas, {
            up: new THREE.Vector3(...props.up),
            ambientIntensity: props.ambientIntensity,
            stats: props.stats,
        })
    }
    componentWillUnmount() {
        if (this.interface) {
            this.interface.destroy()
            delete this.interface
        }
    }
    render() {
        return this.props.children || null
    }
}
