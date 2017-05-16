    npm install awv3-react

# Example using Canvas, View and a Csys

```js
import React from 'react'
import { Canvas, View, Csys } from 'awv3-react'

class Test extends React.Component {
    componentDidMount() {
        // Link view
        this.view = this.refs.view.getInterface()
        // Create geometry
        const box = new THREE.Mesh(
            new THREE.BoxBufferGeometry(100, 100, 100),
            new THREE.MeshBasicMaterial({ color: new THREE.Color('red') })
        )
        // Add geometry to scene
        this.view.scene.add(box)
        this.view.updateBounds().controls.focus().zoom()
    }

    onDoubleClick = () =>
        // Center view on double-click
        this.view.updateBounds().controls.focus().zoom()

    render() {
        return (
            <Canvas
                style={{ position: 'absolute', top: 0, left: 0 }}
                resolution={1}
                onDoubleClick={this.onDoubleClick}>
                <View ref="view" up={[0, 1, 0]}>
                    <Csys style={{ position: 'absolute', bottom: 0, width: 90, height: 90 }} />
                </View>
            </Canvas>
        )
    }
}

ReactDOM.render(<Test />, document.querySelector('#app'))
```

# Example using Session

The Session component takes all options that work with the generic awv3-Session.

It has a number of defaults that will create a standard session with a Csys attached, loading a default environment map. It will also create a Redux store-Provider if the store option has been left empty (which means awv3-Session will construct its own store). All direct and nested children will inherit the "session" context. If "store" is passed explicitly no Provider will be created.

```js
import React from 'react'
import { Session } from 'awv3-react'
import { actions as connectionActions } from 'awv3/session/store/connections'

class Test extends React.Component {
    componentDidMount() {
        // Get awv3-session
        let session = this.refs.session.getInterface()
        // Add new connection, wait until it's connected
        session.addConnection('new-tab').on('connected', async connection => {
            // Execute command
            await session.store.dispatch(
                connectionActions.load(connection.id, '/usr/default/models/test.of1')
            )
            // Adjust camera controls
            connection.pool.view.updateBounds().controls.focus().zoom()
        });
    }

    handleOpenFile = event =>
        // Forward open-file event to the Session components own implementation
        this.refs.session.openFile(event)

    render() {
        return (
            <Session
                ref="session"
                url="http://localhost:8181/">
                <input type="file" onChange={this.handleOpenFile} />
            </Session>
        )
    }
}

ReactDOM.render(<Test />, document.querySelector('#app'))
```

# API

**Session**

```js
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
```

**Canvas**

```js
static propTypes = { resolution: PropTypes.number };
static childContextTypes = { canvas: PropTypes.object };
```

**View**

```js
static propTypes = { up: PropTypes.array, stats: PropTypes.bool };
static defaultProps = { up: [0, 1, 0], stats: false };
static childContextTypes = { view: PropTypes.object };
```
