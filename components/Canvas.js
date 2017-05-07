import React from 'react';
import { Canvas as CanvasImpl } from 'awv3';

export default class Canvas extends React.PureComponent {
    static propTypes = { resolution: React.PropTypes.number };
    static childContextTypes = { canvas: React.PropTypes.object };
    onContextMenu = event => event.preventDefault();

    getChildContext() {
        return { canvas: this.interface };
    }

    constructor(props) {
        super();
        const options = {};
        if (props.resolution) options.resolution = props.resolution;
        this.interface = new CanvasImpl(options);
    }

    getInterface() {
        return this.interface;
    }

    componentDidMount() {
        this.interface.dom.style.position = 'absolute';
        this.refs.canvas.insertBefore(this.interface.dom, this.refs.canvas.firstChild);
        setTimeout(() => this.interface.renderer.resize(), 200);
    }

    componentWillUnmount() {
        if (this.interface) {
            this.interface.destroy();
        }
    }

    render() {
        return (
            <div
                ref="canvas"
                className={this.props.className}
                onDoubleClick={this.props.onDoubleClick}
                onContextMenu={this.onContextMenu}
                style={{ height: '100%', width: '100%', overflow: 'hidden', ...this.props.style }}>
                {this.props.children}
            </div>
        );
    }
}
