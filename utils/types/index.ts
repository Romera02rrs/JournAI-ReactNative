export interface Entry {
  id: string;
  date?: string;
  title?: string;
  content?: string;
  imageUri?: string;
  rating?: number;
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