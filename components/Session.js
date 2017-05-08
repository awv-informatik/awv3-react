import * as THREE from 'three';
import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import CubeTexture from 'awv3/three/cubetexture';
import pool from 'awv3/misc/presentation';
import protocol from 'awv3/communication/socketio';
import { actions as connectionActions } from 'awv3/session/store/connections';
import { pack } from 'awv3/session/helpers';
import Canvas from './Canvas';
import View from './View';
import Csys from './Csys';

export default class Session extends React.PureComponent {
    static propTypes = {
        debug: PropTypes.bool,
        pool: PropTypes.object,
        protocol: PropTypes.object,
        url: PropTypes.string,
        materials: PropTypes.object,
        resources: PropTypes.object,
        store: PropTypes.object,
        resolution: PropTypes.number,
        up: PropTypes.array,
        stats: PropTypes.bool,
    };
    static defaultProps = {
        debug: false,
        pool,
        protocol,
        url: 'http://localhost:8181/',
        materials: {
            lazy: false,
            edgeColor: new THREE.Color(0),
            edgeOpacity: 0.4,
            envMap: new CubeTexture(['px', 'nx', 'py', 'ny', 'pz', 'nz'], n =>
                require('../assets/env/' + n + '.jpg'),
            ),
        },
        resources: undefined,
        store: undefined,
        resolution: 1,
        up: [0, 1, 0],
        stats: false,
    };
    static childContextTypes = { session: PropTypes.object };

    constructor(props) {
        super();
        this.interface = new Session(this.props);
    }

    getChildContext() {
        return { session: this.interface };
    }

    getInterface() {
        return this.interface;
    }

    componentDidMount() {
        // Get view and add the sessions pool into its scene
        this.view = this.refs.view.getInterface();
        this.view.scene.add(this.interface.pool);
    }

    componentWillUnmount() {
        // Destroy session?
    }

    doubleClick = event => this.view.updateBounds().controls.focus().zoom();

    openFile = event => {
        let file = event.target.files[0];
        if (file) {
            let name = file.name.substr(0, file.name.lastIndexOf('.'));
            var reader = new FileReader();
            reader.onload = event => {
                let data = pack(event.target.result);
                let connection = this.interface.store.dispatch(connectionActions.addConnection(file.name));
                connection.on('connected', async () => {
                    await this.interface.store.dispatch(connectionActions.load(connection.id, data));
                    connection.pool.view.updateBounds().controls.focus().zoom().rotate(0, Math.PI / 2);
                });
            };
            reader.readAsArrayBuffer(file);
        }
    };

    render() {
        if (this.props.store)
            return this.renderCanvas();
        else {
            return (
                <Provider store={session.store}>
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
                    <View ref="view" up={this.props.up} stats={this.props.stats}>
                        <Csys
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 14,
                                width: 90,
                                height: 90,
                                ...this.props.csysStyle,
                            }}
                        />
                    </View>
                </Canvas>
                {this.props.children}
            </div>
        );
    }
}
