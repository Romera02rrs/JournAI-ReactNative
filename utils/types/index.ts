export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Entry {
  id: string;
  date: string;
  title?: string;
  content?: string;
  imageUri?: string;
  rating?: Rating;
}

export interface ScrollEvent {
  nativeEvent: {
    contentOffset: {
      y: number;
    };
  };
}

export interface PanHandlerStateChangeEvent {
  nativeEvent: {
    state: number;
    oldState: number;
    translationX: number;
  };
}

export interface RatingColorsGradient {
  [key: number]: {
    backgroundColor: [string, string];
    color: string;
  };
}

export interface GradientColors {
  [key: string]: [string, string];
}
