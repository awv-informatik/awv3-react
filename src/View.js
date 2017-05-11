import * as THREE from 'three';
import React from 'react';
import PropTypes from 'prop-types';
import { View as ViewImpl } from 'awv3/core/view';

export default class View extends React.PureComponent {
    state = { ready: false };
    static propTypes = { up: PropTypes.array, stats: PropTypes.bool };
    static defaultProps = { up: [0, 1, 0], stats: false };
    static contextTypes = { canvas: PropTypes.object };
    static childContextTypes = { view: PropTypes.object };
    getChildContext = () => ({ view: this.interface });

    getInterface() {
        return this.interface;
    }
    componentDidMount() {
        this.interface = new ViewImpl(this.context.canvas, {
            dom: this.refs.view,
            up: new THREE.Vector3().fromArray(this.props.up),
            ambientIntensity: 1.0,
            stats: this.props.stats,
        });
        this.setState({ ready: true });
    }
    componentWillUnmount() {
        if (this.interface) {
            this.interface.destroy();
            delete this.interface;
        }
    }
    render() {
        return (
            <div
                ref="view"
                style={{
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                    overflow: 'hidden',
                    ...this.props.style,
                }}>
                {this.state.ready && this.props.children}
            </div>
        );
    }
}
