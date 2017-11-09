import * as THREE from 'three'
import React from 'react'
import PropTypes from 'prop-types'
import Defaults from 'awv3/core/defaults'
import ViewImpl from 'awv3/core/view'

export default class View extends React.PureComponent {
    state = { ready: false }
    static propTypes = { up: PropTypes.array, stats: PropTypes.bool, ambientIntensity: PropTypes.number }
    static defaultProps = { up: Defaults.up, stats: Defaults.stats, ambientIntensity: Defaults.ambientIntensity }
    static contextTypes = { canvas: PropTypes.object }
    static childContextTypes = { view: PropTypes.object }
    getChildContext = () => ({ view: this.interface })

    getInterface() {
        return this.interface
    }
    componentDidMount() {
        this.interface = new ViewImpl(this.context.canvas, {
            dom: this.ref,
            up: new THREE.Vector3(...this.props.up),
            ambientIntensity: this.props.ambientIntensity,
            stats: this.props.stats,
        })
        this.setState({ ready: true })
    }
    componentWillUnmount() {
        if (this.interface) {
            this.interface.destroy()
            delete this.interface
        }
    }
    render() {
        return (
            <div
                ref={ref => (this.ref = ref)}
                className={this.props.className}
                style={{
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                    overflow: 'hidden',
                    ...this.props.style,
                }}>
                {this.state.ready && this.props.children}
            </div>
        )
    }
}
