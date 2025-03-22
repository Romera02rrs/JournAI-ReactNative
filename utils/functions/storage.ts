import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';


interface Entry {
  id: string;
  date?: string;
  title?: string;
  content?: string;
  image?: string;
}

const SCROLL_POSITION_KEY = 'diary_scroll_position';
const ENTRIES_DIRTY_KEY = "entries_dirty";

export const markEntriesAsDirty = async () => {
  await AsyncStorage.setItem(ENTRIES_DIRTY_KEY, "true");
};

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
export const updateEntry = async (updatedEntry: Entry) => {
  try {
    const storedEntries = await AsyncStorage.getItem('journal_entries');
    let entries: Entry[] = storedEntries ? JSON.parse(storedEntries) : [];

    const index = entries.findIndex(entry => entry.id === updatedEntry.id);

    if (index !== -1) {
      const existingEntry = entries[index];
      entries[index] = {
        ...existingEntry,
        title: updatedEntry.title,
        content: updatedEntry.content,
      };
    } else {
      console.error('No se encontró la entrada a actualizar, se crearán nuevas entradas');
      entries.push(updatedEntry);
    }

    await AsyncStorage.setItem('journal_entries', JSON.stringify(entries));
    await markEntriesAsDirty();

    console.log('Entrada actualizada con éxito');
  } catch (error) {
    console.error('Error al actualizar la entrada:', error);
  }
};

/**
 * Obtiene una entrada específica por su ID (fecha)
 * @param {string} id - Fecha en formato YYYY-MM-DD
 */
export const getEntryById = async (id: string) => {
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
 * Edita una entrada existente
 * @param {string} id - Fecha en formato YYYY-MM-DD
 * @param {Object} updatedEntry - Objeto con los datos actualizados
 */
export const editEntry = async (id: string, updatedEntry: Entry) => {
  try {
    const storedEntries = await AsyncStorage.getItem('journal_entries');
    let entries = storedEntries ? JSON.parse(storedEntries) : [];

    // Buscar la entrada y actualizarla
    entries = entries.map((entry: Entry) => 
      entry.id === id ? { ...entry, ...updatedEntry } : entry
    );

    await AsyncStorage.setItem('journal_entries', JSON.stringify(entries));
    await markEntriesAsDirty();
    console.log('Entrada editada con éxito');
  } catch (error) {
    console.error('Error al editar la entrada:', error);
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
 * Guarda una imagen en el almacenamiento local del dispositivo y devuelve su URI
 * @param {string} uri - URI temporal de la imagen seleccionada
 * @returns {string} - URI local de la imagen guardada
 */
export const saveImageToDevice = async (uri: string) => {
  try {
    const fileName = uri.split('/').pop(); // Obtener el nombre del archivo
    const newPath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.moveAsync({
      from: uri,
      to: newPath,
    });
    await markEntriesAsDirty();

    console.log('Imagen guardada en:', newPath);
    return newPath; // Retorna la nueva URI local
  } catch (error) {
    console.error('Error al guardar la imagen:', error);
    return null;
  }
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