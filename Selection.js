import * as THREE from 'three'
import React from 'react'
import PropTypes from 'prop-types'
import { subscribe } from 'react-contextual'
import Selector from 'awv3/session/selector'
import SessionProvider from './SessionProvider'

const HOVERED = THREE.Object3D.Events.Interaction.Hovered
const UNHOVERED = THREE.Object3D.Events.Interaction.Unhovered

@subscribe(SessionProvider, session => ({ session }))
export default class Selection extends React.PureComponent {
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
    if (this.props.enabled) this.createSelector()
  }

  componentWillReceiveProps(next) {
    if (this.sel && !next.enabled) this.destroySelector()
    else if (!this.sel && next.enabled) this.createSelector()
  }

  componentWillUnmount() {
    this.destroySelector()
  }

  render() {
    return this.props.children(this.state) || null
  }

  createSelector() {
    this.sel = new Selector(this.props.session, {
      ids: this.state.ids,
      types: this.props.types,
      limit: this.props.limit,
    }).on({
      changed: () => this.setState({ materials: this.sel.selectedMaterials, ids: this.sel.selectedIds }),
      [HOVERED]: props => this.setState({ hovered: props }),
      [UNHOVERED]: props => this.setState({ hovered: undefined }),
    })
  }

  destroySelector() {
    this.sel.destroy()
    this.sel = undefined
  }
}
