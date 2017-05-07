```js
import React from 'react'
import { Canvas, View, Csys } from 'awv3-react'

class Test extends React.Component {
    componentDidMount() {
        // Get view and add the sessions pool into its scene
        this.view = this.refs.view.getInterface()
    }

    onDoubleClick = () => this.view.updateBounds().controls.focus().zoom()

    render() {
        return (
            <Canvas
                style={{ position: 'absolute', top: 0, left: 0 }}
                resolution={1}
                onDoubleClick={this.onDoubleClick}>
                <View ref="view" up={[0, 1, 0]}>
                    <Csys style={{ position: 'absolute', bottom: 0, left: 14, width: 90, height: 90 }} />
                </View>
            </Canvas>
        )
    }
}

ReactDOM.render(<Test />, document.querySelector('#app'))
```
