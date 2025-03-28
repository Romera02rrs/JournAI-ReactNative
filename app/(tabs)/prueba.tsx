import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient'; // Solo si deseas usar degradados

// Datos mock para las entradas del diario
type JournalEntry = {
  id: string;
  date: string;
  title: string;
  preview: string;
  mood: string;
  color: string;
};

const mockEntries: JournalEntry[] = [
  {
    id: '1',
    date: 'March 25, 2025',
    title: 'A productive day',
    preview: 'Today I managed to complete all the tasks I had planned. I started the morning with...',
    mood: 'Productive',
    color: 'from-emerald-50 to-teal-50', // Para RN, podría usarse con LinearGradient
  },
  {
    id: '2',
    date: 'March 24, 2025',
    title: 'Meeting with friends',
    preview: 'Had a wonderful time catching up with old friends. We went to that new restaurant...',
    mood: 'Happy',
    color: 'from-blue-50 to-indigo-50',
  },
  {
    id: '3',
    date: 'March 23, 2025',
    title: 'Weekend reflections',
    preview: 'Spent the day thinking about my goals for the upcoming month. I realized that...',
    mood: 'Thoughtful',
    color: 'from-purple-50 to-violet-50',
  },
  {
    id: '4',
    date: 'March 22, 2025',
    title: 'Challenging work day',
    preview: 'Faced several obstacles at work today. The project deadline is approaching and...',
    mood: 'Stressed',
    color: 'from-rose-50 to-red-50',
  },
  {
    id: '5',
    date: 'March 21, 2025',
    title: 'Morning walk',
    preview: 'Started my day with a refreshing walk in the park. The weather was perfect and...',
    mood: 'Refreshed',
    color: 'from-cyan-50 to-sky-50',
  },
  {
    id: '6',
    date: 'March 20, 2025',
    title: 'New book',
    preview: "Started reading that book I've been wanting to get to for months. The first chapter...",
    mood: 'Curious',
    color: 'from-amber-50 to-yellow-50',
  },
];

// Colores para los badges de “mood”
const moodColors = {
  Productive: { backgroundColor: '#ECFDF5', color: '#065F46' },
  Happy: { backgroundColor: '#DBEAFE', color: '#1E3A8A' },
  Thoughtful: { backgroundColor: '#F3E8FF', color: '#6D28D9' },
  Stressed: { backgroundColor: '#FFE4E6', color: '#9F1239' },
  Refreshed: { backgroundColor: '#ECFEFF', color: '#164E63' },
  Curious: { backgroundColor: '#FEFCE8', color: '#854D0E' },
};

// Días de la semana (versión corta y larga)
const daysOfWeek = [
  { short: 'M', full: 'Monday' },
  { short: 'T', full: 'Tuesday' },
  { short: 'W', full: 'Wednesday' },
  { short: 'T', full: 'Thursday' },
  { short: 'F', full: 'Friday' },
  { short: 'S', full: 'Saturday' },
  { short: 'S', full: 'Sunday' },
];

export default function JournalListTest() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');

  // Filtra entradas según búsqueda y mes
  const filteredEntries = mockEntries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.preview.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterMonth === 'all') return matchesSearch;
    return matchesSearch && entry.date.includes(filterMonth);
  });

  // Mock para “This Week’s Entries” (suponiendo entradas L, M, X, V, S)
  // Aquí se asume que en index 0(Mon),1(Tue),2(Wed),4(Fri),5(Sat) hay entradas
  const hasEntryIndices = [0, 1, 2, 4, 5];

  const renderEntryItem = ({ item }: { item: JournalEntry }) => {
    // Mapeo rápido al color del “mood”
    const moodStyle = moodColors[item.mood as keyof typeof moodColors] || { backgroundColor: '#E5E7EB', color: '#374151' };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          // Aquí podrías navegar a la pantalla de detalle
          // Por ejemplo: navigation.navigate('EntryDetail', { id: item.id });
          console.log('Navegar a detalle de:', item.title);
        }}
      >
        {/* Si quisieras usar un LinearGradient para el fondo, 
            podrías usar algo así:
            <LinearGradient
              colors={['#EEF2FF', '#E0E7FF']}
              style={styles.cardGradient}
            >
              ...contenido...
            </LinearGradient>
          */}
        <View style={styles.cardContent}>
          <View style={styles.entryHeader}>
            <View>
              <Text style={styles.entryDate}>{item.date}</Text>
              <Text style={styles.entryTitle}>{item.title}</Text>
            </View>
            <View style={[styles.moodBadge, { backgroundColor: moodStyle.backgroundColor }]}>
              <Text style={[styles.moodText, { color: moodStyle.color }]}>{item.mood}</Text>
            </View>
          </View>
          <Text style={styles.entryPreview} numberOfLines={2}>
            {item.preview}
          </Text>
          <View style={styles.entryFooter}>
            <View style={styles.iconCircle}>
              <Feather name="chevron-right" size={16} color="#4F46E5" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Título */}
      <View style={styles.header}>
        <Text style={styles.title}>Journal Entries</Text>
        <Text style={styles.subtitle}>Browse and search your past reflections</Text>
      </View>

      {/* Búsqueda + Filtro por mes */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Search entries..."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>

        <View style={styles.pickerContainer}>
          <Feather name="calendar" size={16} color="#9CA3AF" style={{ marginRight: 4 }} />
          <Picker
            selectedValue={filterMonth}
            style={styles.picker}
            onValueChange={(itemValue) => setFilterMonth(itemValue)}
          >
            <Picker.Item label="All Months" value="all" />
            <Picker.Item label="January" value="January" />
            <Picker.Item label="February" value="February" />
            <Picker.Item label="March" value="March" />
            <Picker.Item label="April" value="April" />
            <Picker.Item label="May" value="May" />
            <Picker.Item label="June" value="June" />
            <Picker.Item label="July" value="July" />
            <Picker.Item label="August" value="August" />
            <Picker.Item label="September" value="September" />
            <Picker.Item label="October" value="October" />
            <Picker.Item label="November" value="November" />
            <Picker.Item label="December" value="December" />
          </Picker>
        </View>
      </View>

      {/* This Week's Entries */}
      <View style={styles.thisWeekCard}>
        <View style={styles.thisWeekHeader}>
          <View>
            <Text style={styles.thisWeekTitle}>This Week's Entries</Text>
            <Text style={styles.thisWeekSubtitle}>Track your journaling consistency</Text>
          </View>
          <View style={styles.thisWeekBadge}>
            <Feather name="check-circle" size={16} color="#4F46E5" style={{ marginRight: 4 }} />
            <Text style={styles.thisWeekBadgeText}>5/7 days</Text>
          </View>
        </View>

        <View style={styles.weekDaysContainer}>
          {daysOfWeek.map((day, index) => {
            const hasEntry = hasEntryIndices.includes(index);
            return (
              <View
                key={day.full}
                style={[
                  styles.dayBox,
                  hasEntry ? styles.dayBoxActive : styles.dayBoxInactive,
                ]}
              >
                <Text
                  style={[
                    styles.dayBoxText,
                    hasEntry ? styles.dayBoxTextActive : styles.dayBoxTextInactive,
                  ]}
                >
                  {day.short}
                </Text>
                <View
                  style={[
                    styles.dayBoxCircle,
                    hasEntry ? styles.dayBoxCircleActive : styles.dayBoxCircleInactive,
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* Lista de entradas */}
      {filteredEntries.length > 0 ? (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={renderEntryItem}
          scrollEnabled={false} // Para que el ScrollView envuelva todo
        />
      ) : (
        <View style={styles.noEntriesContainer}>
          <View style={styles.noEntriesIcon}>
            <Feather name="search" size={32} color="#9CA3AF" />
          </View>
          <Text style={styles.noEntriesTitle}>No entries found</Text>
          <Text style={styles.noEntriesText}>Try adjusting your search or filters</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    position: 'relative',
    marginRight: 8,
  },
  searchIcon: {
    position: 'absolute',
    left: 8,
    top: 10,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingLeft: 32,
    paddingRight: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerContainer: {
    width: 140,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    flex: 1,
    height: 40,
  },
  thisWeekCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Si quisieras un degradado:
    // overflow: 'hidden',
  },
  thisWeekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  thisWeekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  thisWeekSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  thisWeekBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9999,
  },
  thisWeekBadgeText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '500',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayBox: {
    width: 40,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBoxActive: {
    backgroundColor: '#E0E7FF',
  },
  dayBoxInactive: {
    backgroundColor: '#F3F4F6',
  },
  dayBoxText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dayBoxTextActive: {
    color: '#4F46E5',
  },
  dayBoxTextInactive: {
    color: '#9CA3AF',
  },
  dayBoxCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  dayBoxCircleActive: {
    backgroundColor: '#4F46E5',
  },
  dayBoxCircleInactive: {
    backgroundColor: '#D1D5DB',
  },
  // Estilos de cada Card de entrada
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    // Si deseas un degradado, en lugar de esto usar <LinearGradient> como contenedor
  },
  // cardGradient: {
  //   borderRadius: 12,
  //   padding: 1, // Ajusta si quieres un borde interno
  // },
  cardContent: {
    padding: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
  },
  moodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    // color se setea dinámicamente
  },
  moodText: {
    fontSize: 12,
    fontWeight: '500',
  },
  entryPreview: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  iconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 6,
    borderRadius: 9999,
  },
  // No entries
  noEntriesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  noEntriesIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noEntriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  noEntriesText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
