import * as THREE from 'three'
import React from 'react'
import { subscribe, Subscribe } from 'react-contextual'
import PropTypes from 'prop-types'
import Object3 from 'awv3/three/object3'
import Presentation from 'awv3/misc/presentation'
import SessionProvider from './SessionProvider'
import Canvas from './Canvas'
import View from './View'
import { createCaption } from 'awv3/three/helpers'

class Axes extends THREE.Object3D {
    constructor(scene, camera, cubeProps) {
        super()

        const xAxisColor = 'rgb(194, 51, 105)'//0xc23369
        const yAxisColor = 'rgb(51, 194, 105)'//0x33c269
        const zAxisColor = 'rgb(51, 105, 194)'//0x3369c2

        const { radius } = cubeProps
        this.camera = camera

        const cylinderRadius = 0.84
        const cylinderLength = 2 * radius

        this.viewFound().then(view => {
            if (this.destroyed) return
            this.createInteraction({ priority: 1000 }).on(Object3.Events.Lifecycle.Rendered, this.onRender, {
                sync: false,
            })
        })

        this.xAxisEndPos = new THREE.Vector3( 0, cylinderLength/2, 0 )
        this.yAxisEndPos = new THREE.Vector3( 0, cylinderLength/2, 0 )
        this.zAxisEndPos = new THREE.Vector3( 0, cylinderLength/2, 0 )

        let material = new THREE.MeshBasicMaterial({
            opacity: 1,
            side: THREE.DoubleSide,
            color: new THREE.Color(xAxisColor),
        })
        const cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderLength)
        let axis = new THREE.Mesh(cylinderGeometry, material)
        axis.position.set(0, -radius, -radius)
        axis.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(1, 0, 0)
        )
        axis.updateMatrix()
        this.xAxisEndPos.applyMatrix4(axis.matrix)
        this.add(axis)
        let label = createCaption('X', xAxisColor)
        label.position.set(this.xAxisEndPos.x, this.xAxisEndPos.y, this.xAxisEndPos.z)
        this.add(label)

        material = new THREE.MeshBasicMaterial({
            opacity: 1,
            side: THREE.DoubleSide,
            color: new THREE.Color(yAxisColor),
        })
        axis = new THREE.Mesh(cylinderGeometry, material)
        axis.position.set(-radius, 0, -radius)
        axis.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 1, 0)
        )
        axis.updateMatrix()
        this.yAxisEndPos.applyMatrix4(axis.matrix)
        this.add(axis)
        label = createCaption('Y', yAxisColor)
        label.position.set(this.yAxisEndPos.x, this.yAxisEndPos.y, this.yAxisEndPos.z)
        this.add(label)

        material = new THREE.MeshBasicMaterial({
            opacity: 1,
            side: THREE.DoubleSide,
            color: new THREE.Color(zAxisColor),
        })
        axis = new THREE.Mesh(cylinderGeometry, material)
        axis.position.set(-radius, -radius, 0)
        axis.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 1)
        )
        axis.updateMatrix()
        this.zAxisEndPos.applyMatrix4(axis.matrix)
        this.add(axis)
        label = createCaption('Z', zAxisColor)
        label.position.set(this.zAxisEndPos.x, this.zAxisEndPos.y, this.zAxisEndPos.z)
        this.add(label)
    }
}

@subscribe([SessionProvider, View], (session, viewSession) => ({ session, viewSession }))
export default class Csys extends React.PureComponent {
    static propTypes = {
        textures: PropTypes.array,
        radius: PropTypes.number,
        chamfer: PropTypes.number,
        opacity: PropTypes.number,
        showAxes: PropTypes.bool,
        showFaceNames: PropTypes.bool,
    }
    static defaultProps = { radius: 14, chamfer: 0.35, opacity: 1, showAxes: false, showFaceNames: false}

    componentWillUnmount() {
        this.unsub && this.unsub()
    }

    static init(props) {
        const { radius, chamfer, opacity, viewSession, viewCsys, showAxes, showFaceNames } = props
        const viewCubeFaces = new THREE.Object3D()

        const shader = THREE.MeshBasicMaterial
        const shaderProps = {
            color: 0xffffff,
            polygonOffset: true,
            polygonOffsetFactor: 1.0,
            polygonOffsetUnits: 5.0,
            transparent: opacity < 1,
            opacity: opacity,
            side: THREE.DoubleSide
        }

        let cameraDir = new THREE.Vector3()
        let cameraUp = props.startUp ? new THREE.Vector3().fromArray(props.startUp) : new THREE.Vector3(0,0,1)
        cameraUp.normalize()
        viewCsys.camera.getWorldDirection(cameraDir)
        cameraDir.normalize()
        // Rotate cube. FRONT face should be on XZ plane.
        viewCubeFaces.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1))

        const edgeNames = [
            "LEFT",
            "DOWN",
            "BACK",
            "FRONT",
            "UP",
            "RIGHT",
        ]
        const fontSizePx = 15

        let count = 0
        let faceNum = 0
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

                        if (showFaceNames) {
                            let canvas = document.createElement('canvas')
                            canvas.width = canvas.height = 64 // should be always a power of two (2^x) (WebGL performance)
                            let context = canvas.getContext('2d')
                            context.fillStyle = 'white'
                            context.fillRect(0, 0, canvas.width, canvas.height)
                            context.font = `Bold ${fontSizePx}px Arial`
                            context.fillStyle = 'black'
                            let w = context.measureText(edgeNames[faceNum]).width
                            let h = fontSizePx
                            context.fillText(edgeNames[faceNum], (canvas.width - w) / 2, (canvas.height + 0.8 * h) / 2)
                            let texture = new THREE.Texture(canvas)
                            texture.needsUpdate = true
                            material.map = texture
                        }

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
                        let realViewCubeUp = viewCubeFaces.up.clone().applyQuaternion(viewCubeFaces.quaternion).normalize()
                        // If camera have custom up vector (not equal to (0,0,1)), turn labels to make them readable
                        if (!realViewCubeUp.equals(cameraUp)) {
                            let realNormal = normal.clone().applyQuaternion(viewCubeFaces.quaternion).normalize()
                            // let realAxisX = axisX.clone().applyQuaternion(viewCubeFaces.quaternion).normalize()
                            let realAxisY = axisY.clone().applyQuaternion(viewCubeFaces.quaternion).normalize()
                            let quaternion = new THREE.Quaternion().setFromUnitVectors(realAxisY, cameraUp)
                            if (realNormal.clone().cross(cameraUp).length() === 1) { //Rotate side faces
                                if (realAxisY.clone().multiplyScalar(-1).equals(cameraUp)) {
                                    axisX.applyQuaternion(quaternion)
                                    quaternion = new THREE.Quaternion().setFromUnitVectors(realAxisY, realNormal)
                                    let quaternion2 = new THREE.Quaternion().setFromUnitVectors(realNormal, cameraUp)
                                    quaternion.multiply(quaternion2)
                                    axisY.applyQuaternion(quaternion)
                                } else {
                                    axisX.applyQuaternion(quaternion)
                                    axisY.applyQuaternion(quaternion)
                                }
                            } else if (realNormal.equals(cameraUp)) { //Rotate top face
                                quaternion.setFromUnitVectors(viewCubeFaces.up, viewCubeFaces.up.clone().multiplyScalar(-1))
                                axisX.applyQuaternion(quaternion)
                                axisY.applyQuaternion(quaternion)
                            }
                        }
                        ++faceNum
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
                    face.createInteraction().on({
                        [Object3.Events.Interaction.Hovered]: data => {
                            viewCsys.setCursor('pointer')
                            data.material.animate({ color: new THREE.Color(0xffffff - 0x101010) }).start(0)
                        },
                        [Object3.Events.Interaction.Unhovered]: data => {
                            data.material.animate({ color: new THREE.Color(0xffffff) }).start(1000)
                        },
                        [Object3.Events.Interaction.Clicked]: (clickedObj) => {
                            let realNormal = normal.clone().applyQuaternion(clickedObj.object.parent.quaternion)
                            realNormal.normalize()
                            let normalUpComponent = cameraUp.z === 1 ? realNormal.z : realNormal.y
                            let normalDepthComponent = cameraUp.z === 1 ? -realNormal.y : realNormal.z
                            let a2 = Math.acos(normalUpComponent)
                            let a1 = Math.abs(normalUpComponent) < 1 ? Math.atan2(realNormal.x, normalDepthComponent) : 0
                            viewSession.controls.rotate(a1, a2)
                        }
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
            let worldDir = new THREE.Vector3()
            src.getWorldDirection(worldDir)
            dst.position.copy(worldDir.clone().multiplyScalar(-100.0))
            viewCsys.invalidate()
        }

        if (showAxes) {
            let axes = new Axes(target, viewCsys.camera, props)
            target.add(axes)
        }
    }

    render() {
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
