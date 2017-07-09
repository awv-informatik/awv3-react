    npm install awv3-react

# Example using Canvas, View and a Csys

```js
import * as THREE from 'three'
import React from 'react'
import ReactDOM from 'react-dom'
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

    render() {
        return (
            <Canvas style={{ position: 'absolute', top: 0, left: 0 }} resolution={1}>
                <View ref="view" up={[0, 1, 0]}>
                    <Csys style={{ position: 'absolute', bottom: 0, width: 90, height: 90 }} />
                </View>
            </Canvas>
        )
    }
}

ReactDOM.render(<Test />, document.querySelector('#root'))
```

# Example using Session

The Session component takes all options that work with the generic awv3-Session.

It has a number of defaults that will create a standard session with a Csys attached, loading a default environment map. It will also create a Redux store-Provider if the store option has been left empty (which means awv3-Session will construct its own store). All direct and nested children will inherit the "session" context. If "store" is passed explicitly no Provider will be created.

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { Session } from 'awv3-react'
import { actions as connectionActions } from 'awv3/session/store/connections'

class Test extends React.Component {
    handleOpenFile = event => this.refs.session.openFile(event)
    render() {
        return (
            <Session ref="session" url="http://localhost:8181/">
                <input type="file" style={{ position: 'relative' }} onChange={this.handleOpenFile} />
            </Session>
        )
    }
}

ReactDOM.render(<Test />, document.querySelector('#root'))
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
    updateView: PropTypes.object,
    renderOrder: PropTypes.object,
    lineShader: PropTypes.func,
    lineShaderOptions: PropTypes.object,
    meshShader: PropTypes.func,
    meshShaderOptions: PropTypes.object,
};
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
    meshShaderOptions: {
        ...Defaults.meshShaderOptions,
        envMap: new CubeTexture(['px', 'nx', 'py', 'ny', 'pz', 'nz'], n => require('../assets/env/' + n + '.png')),
    },
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
static propTypes = { up: PropTypes.array, stats: PropTypes.bool, ambientIntensity: PropTypes.number };
static defaultProps = { up: Defaults.up, stats: Defaults.stats, ambientIntensity: Defaults.ambientIntensity };
static childContextTypes = { view: PropTypes.object };
```
