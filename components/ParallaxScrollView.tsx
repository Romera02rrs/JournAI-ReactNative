import React, { forwardRef, useImperativeHandle } from 'react';
import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  onScroll?: (event: any) => void;
  useGradient?: boolean;
}>;

export interface ParallaxScrollRef {
  scrollTo: (y: number, animated?: boolean) => void;
}

const ParallaxScrollView = forwardRef<ParallaxScrollRef, Props>(
  ({ headerImage, headerBackgroundColor, children, onScroll, useGradient }, ref) => {
    const colorScheme = useColorScheme() ?? 'light';
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollOffset = useScrollViewOffset(scrollRef);
    const bottom = useBottomTabOverflow();
    const headerAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateY: interpolate(
              scrollOffset.value,
              [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
              [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
            ),
          },
          {
            scale: interpolate(
              scrollOffset.value,
              [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
              [2, 1, 1]
            ),
          },
        ],
      };
    });

    useImperativeHandle(ref, () => ({
      scrollTo: (y: number, animated: boolean = true) => {
        scrollRef.current?.scrollTo({ y, animated });
      },
    }));

    return (
      <ThemedView style={styles.container} useGradient={useGradient}>
        <Animated.ScrollView
          ref={scrollRef}
          onScroll={(event) => {
            onScroll && onScroll(event);
          }}
          scrollEventThrottle={16}
          scrollIndicatorInsets={{ bottom }}
          contentContainerStyle={{ paddingBottom: bottom }}
        >
          <Animated.View
            style={[
              styles.header,
              { backgroundColor: headerBackgroundColor[colorScheme] },
              headerAnimatedStyle,
            ]}
          >
            {headerImage}
          </Animated.View>
          <ThemedView useGradient={useGradient} style={styles.content}>{children}</ThemedView>
        </Animated.ScrollView>
      </ThemedView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});

export default ParallaxScrollView;
