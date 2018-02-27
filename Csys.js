import * as THREE from 'three'
import React from 'react'
import { subscribe, Subscribe } from 'react-contextual'
import PropTypes from 'prop-types'
import Object3 from 'awv3/three/object3'
import Presentation from 'awv3/misc/presentation'
import SessionProvider from './SessionProvider'
import Canvas from './Canvas'
import View from './View'

@subscribe([SessionProvider, View], (session, viewSession) => ({ session, viewSession }))
export default class Csys extends React.PureComponent {
    static propTypes = {
        textures: PropTypes.array,
        radius: PropTypes.number,
        chamfer: PropTypes.number,
        opacity: PropTypes.number,
    }
    static defaultProps = { radius: 14, chamfer: 0.35, opacity: 1 }

    componentWillUnmount() {
        this.unsub && this.unsub()
    }

    static init(props) {
        const { radius, chamfer, opacity, viewSession, viewCsys } = props
        const viewCubeFaces = new THREE.Object3D()

        const shader = THREE.MeshBasicMaterial
        const shaderProps = {
            color: 0xffffff,
            polygonOffset: true,
            polygonOffsetFactor: 1.0,
            polygonOffsetUnits: 5.0,
            transparent: opacity < 1,
            opacity: opacity,
        }

        let count = 0
        for (var sx = -1; sx <= 1; sx++)
            for (var sy = -1; sy <= 1; sy++)
                for (var sz = -1; sz <= 1; sz++) {
                    var cntNnz = +(sx != 0) + (sy != 0) + (sz != 0)
                    if (cntNnz === 0) continue

                    let geometry, material
                    let ctr, normal, axisX, axisY
                    if (cntNnz === 1) {
                        //create a square face
                        var size = 2 * radius * (1 - chamfer)
                        geometry = new THREE.PlaneGeometry(size, size)
                        //set material (load texture)
                        material = new shader({ ...shaderProps })

                        if (props.textures) {
                            new THREE.TextureLoader().load(props.textures[count++], function(texture) {
                                material.map = texture
                                material.needsUpdate = true
                            })
                        }

                        //choose coordinate system for the face
                        normal = new THREE.Vector3(sx, sy, sz)
                        axisX = sy === 0 ? new THREE.Vector3(sz, 0, -sx) : new THREE.Vector3(1, 0, 0)
                        axisY = normal.clone().cross(axisX)
                        ctr = normal.clone().multiplyScalar(radius)
                    }
                    if (cntNnz === 2) {
                        //calculate endpoints of the edge being chamfered
                        var pM = new THREE.Vector3(sx, sy, sz)
                        var dir = new THREE.Vector3(+(sx == 0), +(sy == 0), +(sz == 0))
                        var pE = pM.clone().sub(dir)
                        var pS = pM.clone().add(dir)
                        //create a rectangular face
                        var len = 2 * radius * (1 - chamfer)
                        var wid = radius * chamfer * Math.sqrt(2.0)
                        geometry = new THREE.PlaneGeometry(len, wid)
                        material = new shader({ ...shaderProps })
                        //calculate coordinate system
                        normal = pM.clone().normalize()
                        axisX = dir.clone()
                        axisY = normal.clone().cross(axisX)
                        ctr = pM.clone().multiplyScalar(radius * (1 - chamfer / 2))
                    }
                    if (cntNnz === 3) {
                        //create triangle geometry for vertex chamfer
                        var side = radius * chamfer * Math.sqrt(2.0)
                        geometry = new THREE.Geometry()
                        var k = 1 - chamfer
                        geometry.vertices.push(
                            new THREE.Vector3(-0.5, Math.sqrt(1 / 3) / 2, 0).multiplyScalar(side),
                            new THREE.Vector3(0.5, Math.sqrt(1 / 3) / 2, 0).multiplyScalar(side),
                            new THREE.Vector3(0, -Math.sqrt(1 / 3), 0).multiplyScalar(side),
                        )
                        geometry.faces.push(new THREE.Face3(0, 1, 2))
                        if (sy > 0) geometry.scale(-1, -1, -1)
                        geometry.computeBoundingSphere()
                        material = new shader({ ...shaderProps, side: THREE.DoubleSide })
                        //calculate coordinate system
                        var sp = new THREE.Vector3(sx, sy, sz)
                        normal = sp.clone().normalize()
                        axisY = new THREE.Vector3(0, 1, 0)
                        axisY.sub(axisY.clone().projectOnVector(normal)).normalize()
                        axisX = axisY.clone().cross(normal)
                        ctr = sp.clone().multiplyScalar(radius * (1 - chamfer * 2 / 3))
                    }

                    geometry.computeFaceNormals()
                    var face = new THREE.Mesh(geometry, material)
                    //set coordinate system to THREE object
                    var matr = new THREE.Matrix4()
                    matr.makeBasis(axisX, axisY, normal)
                    matr.setPosition(ctr)
                    matr.decompose(face.position, face.quaternion, face.scale)
                    face.updateMatrix()
                    //add object
                    viewCubeFaces.add(face)

                    //add interaction
                    let a2 = Math.acos(normal.y)
                    let a1 = Math.abs(normal.y) < 1 ? Math.atan2(normal.x, normal.z) : 0
                    face.createInteraction().on({
                        [Object3.Events.Interaction.Hovered]: data => {
                            viewCsys.setCursor('pointer')
                            data.material.animate({ color: new THREE.Color(0xffffff - 0x101010) }).start(0)
                        },
                        [Object3.Events.Interaction.Unhovered]: data => {
                            data.material.animate({ color: new THREE.Color(0xffffff) }).start(1000)
                        },
                        [Object3.Events.Interaction.Clicked]: () => viewSession.controls.rotate(a1, a2),
                    })
                }
        //add wireframe geometry
        var viewCubeEdges = new THREE.Object3D()
        for (var face of viewCubeFaces.children) {
            var pts = face.geometry.vertices.slice()
            if (face.geometry.faces.length === 2) pts = [pts[0], pts[1], pts[3], pts[2]]
            pts.push(pts[0].clone())
            var geom = new THREE.Geometry()
            geom.vertices = pts
            var lines = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0, transparent: true, opacity: 0.3 }))
            lines.renderOrder = -1000
            face.matrix.decompose(lines.position, lines.quaternion, lines.scale)
            lines.updateMatrix()
            viewCubeEdges.add(lines)
        }

        viewCubeFaces.quaternion.setFromUnitVectors(viewCubeFaces.up, viewCsys.camera.up)

        const target = viewCsys.scene
        target.add(viewCubeFaces)
        target.add(viewCubeEdges)
        target.update && target.update()

        viewCsys.controls.noZoom = viewCsys.controls.noRotate = viewCsys.controls.noPan = true
        viewSession.callbackAfter = () => {
            var src = viewSession.camera
            var dst = viewCsys.camera
            var oldAspect = dst.aspect
            dst.copy(src, false)
            if (oldAspect !== undefined) {
                dst.aspect = oldAspect
                dst.updateProjectionMatrix()
            }
            dst.position.copy(
                src
                    .getWorldDirection()
                    .clone()
                    .multiplyScalar(-100.0),
            )
            viewCsys.invalidate()
        }
    }

    render() {
        console.log("csys renders", this.props)
        return (
            <Canvas style={this.props.style} resolution={2} className="csys">
                <View up={this.props.viewSession.camera.up.toArray()}>
                    <Subscribe to={View} select={viewCsys => ({ viewCsys })}>
                        {({ viewCsys }) => Csys.init({ ...this.props, viewCsys }) || null}
                    </Subscribe>
                </View>
            </Canvas>
        )
    }
}
