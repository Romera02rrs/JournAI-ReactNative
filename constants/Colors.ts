/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fdfdfd',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    soft: '#d7d9da',
    contrast: '#000',
    entry: '#fff',
    softContrast : '#f8f8f8',
  },
  dark: {
    text: '#ECEDEE',
    background: '#1D1F20',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    soft: '#3a3e40',
    contrast: '#fff',
    entry: '#1D1F20',
    softContrast : '#2c2f31',
  },
};
