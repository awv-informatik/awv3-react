import * as THREE from 'three'
import React from 'react'
import PropTypes from 'prop-types'
import Selector from 'awv3/session/selector'

const HOVERED = THREE.Object3D.Events.Interaction.Hovered
const UNHOVERED = THREE.Object3D.Events.Interaction.Unhovered

export default class Selection extends React.PureComponent {
    static propTypes = {
        types: PropTypes.array,
        limit: PropTypes.number,
    }
    static defaultProps = {
        types: ['Mesh'],
        limit: Infinity,
    }
    state = { materials: [], hovered: undefined }
    componentDidMount() {
        this.sel = new Selector(this.props.session, {
            types: this.props.types,
            limit: this.props.limit,
        }).on({
            changed: () => this.setState({ materials: this.sel.selectedMaterials }),
            [HOVERED]: props => this.setState({ hovered: props }),
            [UNHOVERED]: props => this.setState({ hovered: undefined }),
        })
        this.forceUpdate()
    }
    componentWillUnmount() {
        this.sel.destroy()
    }
    render() {
        return this.sel ? this.props.children(this.state) || null : null
    }
}
