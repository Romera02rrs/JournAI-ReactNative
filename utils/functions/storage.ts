import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Entry } from '@/utils/types';
import { getTodayId } from '@/utils/functions/getTodayId';
import { getDay } from "@/utils/functions/getDay";

const SCROLL_POSITION_KEY = 'diary_scroll_position';
const ENTRIES_DIRTY_KEY = "entries_dirty";

export const markEntriesAsDirty = async () => {
  await AsyncStorage.setItem(ENTRIES_DIRTY_KEY, "true");
};

{/** Manejo del dirty */}

/**
 * Limpia la marca de suciedad de las entradas
 */
export const clearEntriesDirtyFlag = async () => {
  await AsyncStorage.setItem(ENTRIES_DIRTY_KEY, "false");
};

/**
 * 
 * @returns {boolean} - True si las entradas están marcadas como sucias
 */
export const areEntriesDirty = async (): Promise<boolean> => {
  const flag = await AsyncStorage.getItem(ENTRIES_DIRTY_KEY);
  return flag === "true";
};

{/** Manejo del scroll */}

/**
 * Guarda la posición del scroll en AsyncStorage
 * @param position número de píxeles de scroll vertical
 */
export const saveScrollPosition = async (position: number) => {
  try {
    await AsyncStorage.setItem(SCROLL_POSITION_KEY, JSON.stringify(position));
  } catch (error) {
    console.error("Error al guardar la posición del scroll:", error);
  }
};

/**
 * Obtiene la posición del scroll desde AsyncStorage
 * @returns número de píxeles o 0 si no hay nada guardado
 */
export const getScrollPosition = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(SCROLL_POSITION_KEY);
    return value ? JSON.parse(value) : 0;
  } catch (error) {
    console.error("Error al leer la posición del scroll:", error);
    return 0;
  }
};

{/** Manejo de las entradas */}

/**
 * Guarda una nueva entrada en AsyncStorage
 * @param {Object} entry - Objeto con id, title, text, imageUri
 */
export const saveEntry = async (entry: Entry) => {
  try {
    // Obtener todas las entradas guardadas
    const storedEntries = await AsyncStorage.getItem('journal_entries');
    let entries = storedEntries ? JSON.parse(storedEntries) : [];

    // Guardar la nueva entrada
    entries.push(entry);
    await AsyncStorage.setItem('journal_entries', JSON.stringify(entries));
    await markEntriesAsDirty();
    
    console.log('Entrada guardada con éxito');
  } catch (error) {
    console.error('Error al guardar la entrada:', error);
  }
};

/**
 * Actualiza una entrada existente en AsyncStorage por ID
 * @param {Entry} updatedEntry - Objeto con id, title, content, image, date
 */
export const updateEntry = async (updatedEntry: Partial<Entry> & { id: string }) => {
  try {
    const storedEntries = await AsyncStorage.getItem('journal_entries');
    let entries: Entry[] = storedEntries ? JSON.parse(storedEntries) : [];

    const index = entries.findIndex(entry => entry.id === updatedEntry.id);

    if (index !== -1) {
      entries[index] = {
        ...entries[index],
        ...updatedEntry,
      };
      console.log('Entrada actualizada con éxito');
    } else {
      
      const newEntry: Entry = {
        ...updatedEntry,
        date: updatedEntry.date || updatedEntry.id,
      } as Entry;

      console.warn('No se encontró la entrada, se agregará una nueva entrada:', newEntry);
      entries.push(newEntry);
    }

    await AsyncStorage.setItem('journal_entries', JSON.stringify(entries));
    await markEntriesAsDirty();
  } catch (error) {
    console.error('Error al actualizar la entrada:', error);
  }
};


/**
 * Elimina una entrada por su ID (fecha)
 * @param {string} id - Fecha en formato YYYY-MM-DD
 */
export const deleteEntry = async (id: string) => {
  try {
    const storedEntries = await AsyncStorage.getItem('journal_entries');
    let entries = storedEntries ? JSON.parse(storedEntries) : [];

    // Filtrar la entrada a eliminar
    entries = entries.filter((entry: Entry) => entry.id !== id);

    await AsyncStorage.setItem('journal_entries', JSON.stringify(entries));
    await markEntriesAsDirty();
    console.log('Entrada eliminada con éxito');
  } catch (error) {
    console.error('Error al eliminar la entrada:', error);
  }
};

/**
 * Obtiene una entrada específica por su ID (fecha)
 * @param {string} id - Fecha en formato YYYY-MM-DD
 */
export const getEntryById = async (id: string): Promise<Entry | null> => {
  try {
    const storedEntries = await AsyncStorage.getItem('journal_entries');
    const entries = storedEntries ? JSON.parse(storedEntries) : [];
    
    return entries.find((entry: Entry) => entry.id === id) || null;
  } catch (error) {
    console.error('Error al obtener la entrada:', error);
    return null;
  }
};

/**
 * Obtiene todas las entradas almacenadas
 */
export const getAllEntries = async () => {
  try {
    const storedEntries = await AsyncStorage.getItem('journal_entries');
    return storedEntries ? JSON.parse(storedEntries) : [];
  } catch (error) {
    console.error('Error al obtener las entradas:', error);
    return [];
  }
};

/**
 * Obtiene las ultimas 3 entradas almacenadas
 */
export const getRecentEntryes = async () => {
  const allEntries = await getAllEntries();
  return allEntries.slice(-3).reverse();
};

/**
 * Añade una lista de entradas ya existentes a AsyncStorage
 * @param {Array} entries - Lista de entradas a guardar
 * @returns {boolean} - True si se guardaron correctamente
 */
export const addExampleEntries = async (entries: Entry[]) => {
  try {
    await AsyncStorage.setItem('journal_entries', JSON.stringify(entries));
    await markEntriesAsDirty();
    console.log('Entradas añadidas con éxito');
    return true;
  } catch (error) {
    console.error('Error al añadir las entradas:', error);
    return false;
  }
}

/**
 * Elimina todas las entradas almacenadas en AsyncStorage
 * @returns {boolean} - True si se eliminaron correctamente
*/
export const removeAllEntries = async () => {
  try {
    await AsyncStorage.removeItem('journal_entries');
    await markEntriesAsDirty();
    console.log('Todas las entradas han sido eliminadas');
    return true;
  } catch (error) {
    console.error('Error al eliminar las entradas:', error);
    return false;
  }
};

/**
 * Obtiene el número de días consecutivos con entradas
 * @returns {Promise<number>} - Número de días consecutivos con entradas
 */
export const getStreakCount = async (): Promise<number> => {
  const allEntries: Entry[] = await getAllEntries();
  const MS_IN_DAY = 1000 * 60 * 60 * 24;

  if (allEntries.length === 0) return 0;

  // Ordenar entradas por fecha descendente (más recientes primero)
  const sortedEntries = allEntries.sort(
    (a, b) => new Date(b.id).getTime() - new Date(a.id).getTime()
  );

  let streakCount = 0;
  let currentDate = new Date();
  currentDate.setUTCHours(0, 0, 0, 0);

  console.log("Días considerados parte de la racha:");

  for (let entry of sortedEntries) {
    const entryDate = new Date(entry.id);
    entryDate.setUTCHours(0, 0, 0, 0);

    const diffInDays = Math.floor(
      (currentDate.getTime() - entryDate.getTime()) / MS_IN_DAY
    );

    if (diffInDays === 0) {
      // Entrada del día actual
      streakCount++;
      console.log(`Día: ${entry.id}`);
      currentDate = entryDate;
    } else if (diffInDays === 1) {
      // Entrada del día anterior inmediato
      streakCount++;
      console.log(`Día: ${entry.id}`);
      currentDate = entryDate;
    } else {
      // Si hay un salto mayor de un día, se rompe la racha
      break;
    }
  }

  return streakCount;
};


/**
 * Verifica si hay una entrada escrita para el día actual
 * @returns {Promise<boolean>} - True si hay una entrada para hoy, False en caso contrario
 */
export const checkIsTodayWritten = async (): Promise<boolean> => {
  const allEntries = await getAllEntries();
  const today = getTodayId(); // Fecha actual en formato YYYY-MM-DD

  return allEntries.some(
    (entry: Entry) => new Date(entry.date || "").toDateString() === new Date(today).toDateString()
  );
};

{/** Manejo de las imagenes */}

/**
 * Selecciona una imagen desde la galería y la guarda localmente
 * @returns {string | null} URI local permanente de la imagen guardada
 */
export const selectAndSaveImage = async (): Promise<string | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const localUri = await saveImageToDevice(uri);
      return localUri;
    }

    return null;
  } catch (error) {
    console.error('Error al seleccionar y guardar imagen:', error);
    return null;
  }
};

/**
 * Guarda una imagen en el almacenamiento local del dispositivo y devuelve su URI
 * @param {string} uri - URI temporal de la imagen seleccionada
 * @returns {string} - URI local de la imagen guardada
 */
export const saveImageToDevice = async (uri: string): Promise<string | null> => {
  try {
    const fileName = uri.split('/').pop();
    const newPath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.copyAsync({
      from: uri,
      to: newPath,
    });

    await markEntriesAsDirty();
    console.log('Imagen guardada en:', newPath);
    return newPath;
  } catch (error) {
    console.error('Error al guardar la imagen:', error);
    return null;
  }
};

/**
 * Elimina una imagen guardada localmente en el dispositivo
 * @param uri URI local de la imagen a eliminar
 */
export const deleteImageFromDevice = async (uri: string): Promise<boolean> => {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });

    await markEntriesAsDirty();
    console.log('Imagen eliminada:', uri);
    return true;
  } catch (error) {
    console.error('Error al eliminar la imagen:', error);
    return false;
  }
};
