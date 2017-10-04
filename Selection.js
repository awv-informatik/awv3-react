import * as THREE from 'three'
import React from 'react'
import PropTypes from 'prop-types'
import Selector from 'awv3/session/selector'

const HOVERED = THREE.Object3D.Events.Interaction.Hovered
const UNHOVERED = THREE.Object3D.Events.Interaction.Unhovered

export default class Selection extends React.PureComponent {
    static contextTypes = { session: PropTypes.object }
    static propTypes = {
        enabled: PropTypes.bool,
        types: PropTypes.array,
        limit: PropTypes.number,
        children: PropTypes.func.isRequired,
    }
    static defaultProps = {
        enabled: true,
        types: ['Mesh'],
        limit: Infinity,
    }
    state = { materials: [], ids: [], hovered: undefined }

    componentDidMount() {
        this.sel = new Selector(this.context.session, {
            ids: this.state.ids,
            types: this.props.types,
            limit: this.props.limit,
        }).on({
            changed: () => this.setState({ materials: this.sel.selectedMaterials, ids: this.sel.selectedIds }),
            [HOVERED]: props => this.setState({ hovered: props }),
            [UNHOVERED]: props => this.setState({ hovered: undefined }),
        })
    }
    componentWillReceiveProps(next) {
        if (this.sel && !next.enabled)
            this.componentWillUnmount()
        else if (!this.sel && next.enabled)
            this.componentDidMount()
    }
    componentWillUnmount() {
        this.sel.destroy()
        this.sel = undefined
    }
    render() {
        return this.props.children(this.state) || null
    }
}
