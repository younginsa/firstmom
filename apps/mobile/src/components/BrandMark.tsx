import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { palette, radius } from '../theme/tokens';

type Props = {
  size?: number;
};

/**
 * Coral circle with a white line-icon heart inside — the Firstmom mark.
 * Mockup default size = 64×64 with a 30×30 heart. Pass `size` to scale.
 */
export function BrandMark({ size = 64 }: Props) {
  const heart = Math.round(size * 0.47);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.circle,
        backgroundColor: palette.coral,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={heart} height={heart} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 21s-7-4.5-7-10a4.5 4.5 0 0 1 7-3.5A4.5 4.5 0 0 1 19 11c0 5.5-7 10-7 10z"
          stroke={palette.white}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
