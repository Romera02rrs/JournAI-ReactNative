import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ONBOARDING_KEY = 'hasOnboarded';

const slides = [
  {
    id: 1,
    title: 'Welcome to Your Digital Diary',
    description: 'Capture your thoughts, memories, and daily experiences in a beautiful and private space.',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Express Yourself',
    description: 'Write, reflect, and grow with a diary that understands your journey.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Your Story, Your Way',
    description: 'Start your journaling journey today and create memories that last forever.',
    image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&auto=format&fit=crop',
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const isFromSettings = router.canGoBack();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (value !== null) {
          // Si el flag existe, navegamos directamente a la app principal
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error al leer el flag de onboarding:', error);
      } finally {
        setLoading(false);
      }
    }
    checkOnboarding();
  }, []);

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      if (isFromSettings) {
        router.back();
      } else {
        try {
          await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
          router.replace('/(tabs)');
        } catch (error) {
          console.error('Error al guardar el flag de onboarding:', error);
        }
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFromSettings && (
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => router.back()}
        >
          <X color="#fff" size={24} />
        </TouchableOpacity>
      )}

      <Animated.View 
        entering={FadeIn}
        exiting={FadeOut}
        key={slides[currentSlide].image}
        style={styles.imageContainer}
      >
        <Image
          source={{ uri: slides[currentSlide].image }}
          style={styles.image}
        />
        <View style={styles.overlay} />
      </Animated.View>

      <View style={styles.content}>
        <Animated.Text 
          entering={FadeIn}
          exiting={FadeOut}
          key={`title-${currentSlide}`}
          style={styles.title}
        >
          {slides[currentSlide].title}
        </Animated.Text>
        
        <Animated.Text 
          entering={FadeIn}
          exiting={FadeOut}
          key={`desc-${currentSlide}`}
          style={styles.description}
        >
          {slides[currentSlide].description}
        </Animated.Text>

        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentSlide && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentSlide === slides.length - 1 
              ? (isFromSettings ? 'Close' : 'Get Started') 
              : 'Next'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    height: '60%',
    width: width,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: '#1a1a1a',
    marginTop: 24,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#1a1a1a',
    width: 20,
  },
  button: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
});