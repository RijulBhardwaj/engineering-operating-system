import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';

const WIDTH = 1080;
const HEIGHT = 1920;

// Formats a Matrix4 (column-major in three.js) as a human-readable row-major 4x4 grid.
const formatMatrix4 = (m: THREE.Matrix4): string[][] => {
	const e = m.elements; // column-major
	const rows: string[][] = [];
	for (let r = 0; r < 4; r++) {
		const row: string[] = [];
		for (let c = 0; c < 4; c++) {
			row.push(e[c * 4 + r].toFixed(2));
		}
		rows.push(row);
	}
	return rows;
};

const MatrixOverlay: React.FC<{matrix: THREE.Matrix4; angleDeg: number}> = ({
	matrix,
	angleDeg,
}) => {
	const rows = useMemo(() => formatMatrix4(matrix), [matrix]);
	return (
		<div
			style={{
				position: 'absolute',
				top: 80,
				left: 60,
				fontFamily: 'Menlo, Consolas, monospace',
				color: '#e8f0ff',
				fontSize: 30,
				lineHeight: 1.3,
				textShadow: '0 2px 10px rgba(0,0,0,0.6)',
			}}
		>
			<div style={{opacity: 0.75, fontSize: 24, marginBottom: 10}}>
				model = Ry(&theta;), &theta; = {angleDeg.toFixed(1)}&deg;
			</div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(4, 110px)',
					gap: '4px 10px',
					background: 'rgba(10,14,28,0.55)',
					padding: 18,
					borderRadius: 12,
					border: '1px solid rgba(255,255,255,0.12)',
				}}
			>
				{rows.map((row, r) =>
					row.map((v, c) => (
						<span key={`${r}-${c}`} style={{textAlign: 'right'}}>
							{v}
						</span>
					)),
				)}
			</div>
		</div>
	);
};

const AxisReadout: React.FC<{p: THREE.Vector3}> = ({p}) => (
	<div
		style={{
			position: 'absolute',
			bottom: 120,
			left: 60,
			fontFamily: 'Menlo, Consolas, monospace',
			color: '#9effa0',
			fontSize: 28,
			textShadow: '0 2px 10px rgba(0,0,0,0.6)',
		}}
	>
		corner (1,1,1) &rarr; ({p.x.toFixed(2)}, {p.y.toFixed(2)}, {p.z.toFixed(2)})
	</div>
);

// Real per-frame matrix math: build a model matrix from scratch via Matrix4,
// multiply it into every vertex of the cube's geometry (not a canned Three.js animation helper).
const RotatingCube: React.FC<{frame: number; fps: number; durationInFrames: number}> = ({
	frame,
	fps,
	durationInFrames,
}) => {
	const t = frame / fps;
	const angleDeg = interpolate(frame, [0, durationInFrames], [0, 360 * 2], {
		extrapolateRight: 'clamp',
	});
	const angle = (angleDeg * Math.PI) / 180;

	// Explicit rotation (model) matrix via Matrix4.makeRotationY — real matrix construction,
	// applied to the mesh's matrix each frame, not an eased spring/keyframe helper.
	const modelMatrix = useMemo(() => {
		const rot = new THREE.Matrix4().makeRotationY(angle);
		const scale = new THREE.Matrix4().makeScale(1.4, 1.4, 1.4);
		return rot.multiply(scale);
	}, [angle]);

	const transformedCorner = useMemo(() => {
		const corner = new THREE.Vector3(1, 1, 1);
		return corner.applyMatrix4(modelMatrix);
	}, [modelMatrix]);

	return (
		<>
			<ThreeCanvas linear width={WIDTH} height={HEIGHT}>
				<ambientLight intensity={0.5} />
				<directionalLight position={[3, 4, 5]} intensity={1.4} />
				<perspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
				<mesh matrixAutoUpdate={false} matrix={modelMatrix}>
					<boxGeometry args={[1, 1, 1]} />
					<meshStandardMaterial color="#4f7bff" metalness={0.3} roughness={0.4} />
				</mesh>
				<axesHelper args={[2.2]} />
			</ThreeCanvas>
			<MatrixOverlay matrix={modelMatrix} angleDeg={angleDeg % 360} />
			<AxisReadout p={transformedCorner} />
		</>
	);
};

export const MatrixTransform: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: '#05070f'}}>
			<RotatingCube frame={frame} fps={fps} durationInFrames={durationInFrames} />
			<div
				style={{
					position: 'absolute',
					top: 1700,
					left: 0,
					width: '100%',
					textAlign: 'center',
					color: '#ffffff',
					fontFamily: 'Helvetica, Arial, sans-serif',
					fontSize: 34,
					fontWeight: 600,
					opacity: interpolate(
						frame,
						[durationInFrames - 30, durationInFrames],
						[0, 1],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
				}}
			>
				what does (1,0,0) become after 90&deg;?
			</div>
		</AbsoluteFill>
	);
};
