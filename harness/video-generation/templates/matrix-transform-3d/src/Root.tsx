import React from 'react';
import {Composition} from 'remotion';
import {MatrixTransform} from './MatrixCube';

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="MatrixTransform"
			component={MatrixTransform}
			durationInFrames={150}
			fps={30}
			width={1080}
			height={1920}
		/>
	);
};
