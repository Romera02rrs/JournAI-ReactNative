import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { getTodayId } from "@/utils/functions/getTodayId";
import * as Journal from "@/utils/functions/storage"; // Ajusta la ruta al archivo a testear

// Mocks de los módulos externos
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("expo-file-system", () => ({
  documentDirectory: "file://document/",
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("@/utils/functions/getTodayId", () => ({
  getTodayId: jest.fn(),
}));

// Limpiar mocks antes de cada test
beforeEach(() => {
  jest.clearAllMocks();
});

describe("Manejo de dirty", () => {
  test("markEntriesAsDirty debe marcar las entradas como sucias", async () => {
    await Journal.markEntriesAsDirty();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("entries_dirty", "true");
  });

  test("clearEntriesDirtyFlag debe limpiar la marca de suciedad", async () => {
    await Journal.clearEntriesDirtyFlag();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("entries_dirty", "false");
  });

  describe("areEntriesDirty", () => {
    test('debe retornar true si el flag es "true"', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("true");
      const result = await Journal.areEntriesDirty();
      expect(result).toBe(true);
    });

    test('debe retornar false si el flag no es "true"', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("false");
      const result = await Journal.areEntriesDirty();
      expect(result).toBe(false);
    });
  });
});

describe("Manejo del scroll", () => {
  test("saveScrollPosition debe guardar la posición del scroll", async () => {
    await Journal.saveScrollPosition(100);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "diary_scroll_position",
      JSON.stringify(100)
    );
  });

  describe("getScrollPosition", () => {
    test("debe retornar la posición parseada si existe", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(150)
      );
      const pos = await Journal.getScrollPosition();
      expect(pos).toBe(150);
    });

    test("debe retornar 0 si no hay posición almacenada", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const pos = await Journal.getScrollPosition();
      expect(pos).toBe(0);
    });
  });
});

describe("Manejo de las entradas", () => {
  describe("saveEntry", () => {
    test("debe guardar una nueva entrada cuando no hay entradas previas", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const entry = {
        id: "2025-04-03",
        date: "2025-04-03",
        title: "Test",
        text: "Texto de prueba",
        imageUri: "uri",
      };
      await Journal.saveEntry(entry);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "journal_entries",
        JSON.stringify([entry])
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "entries_dirty",
        "true"
      );
    });
  });

  describe("updateEntry", () => {
    test("debe actualizar una entrada existente", async () => {
      const existingEntry = {
        id: "2025-04-03",
        title: "Título Antiguo",
        text: "Texto Antiguo",
        imageUri: "uri",
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify([existingEntry])
      );
      const updatedEntry = { id: "2025-04-03", title: "Título Nuevo" };
      await Journal.updateEntry(updatedEntry);
      const expectedEntries = [{ ...existingEntry, ...updatedEntry }];
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "journal_entries",
        JSON.stringify(expectedEntries)
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "entries_dirty",
        "true"
      );
    });

    test("debe agregar una nueva entrada si no se encuentra para actualizar", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify([])
      );
      const updatedEntry = { id: "2025-04-03", title: "Título Nuevo" };
      await Journal.updateEntry(updatedEntry);
      const expectedEntry = { ...updatedEntry, date: updatedEntry.id };
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "journal_entries",
        JSON.stringify([expectedEntry])
      );
    });
  });

  describe("deleteEntry", () => {
    test("debe eliminar la entrada por su id", async () => {
      const entries = [
        { id: "2025-04-03", title: "Entrada 1", text: "", imageUri: "" },
        { id: "2025-04-02", title: "Entrada 2", text: "", imageUri: "" },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(entries)
      );
      await Journal.deleteEntry("2025-04-03");
      const updatedEntries = entries.filter(
        (entry) => entry.id !== "2025-04-03"
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "journal_entries",
        JSON.stringify(updatedEntries)
      );
    });
  });

  describe("getEntryById", () => {
    test("debe retornar la entrada si se encuentra", async () => {
      const entries = [
        { id: "2025-04-03", title: "Entrada 1", text: "", imageUri: "" },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(entries)
      );
      const entry = await Journal.getEntryById("2025-04-03");
      expect(entry).toEqual(entries[0]);
    });

    test("debe retornar null si no se encuentra la entrada", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify([])
      );
      const entry = await Journal.getEntryById("2025-04-03");
      expect(entry).toBeNull();
    });
  });

  describe("getAllEntries", () => {
    test("debe retornar todas las entradas almacenadas", async () => {
      const entries = [{ id: "2025-04-03" }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(entries)
      );
      const result = await Journal.getAllEntries();
      expect(result).toEqual(entries);
    });

    test("debe retornar un arreglo vacío si no hay entradas almacenadas", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const result = await Journal.getAllEntries();
      expect(result).toEqual([]);
    });
  });

  test("getTotalNumberOfEntries debe retornar el número total de entradas", async () => {
    const entries = [{ id: "1" }, { id: "2" }];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(entries)
    );
    const total = await Journal.getTotalNumberOfEntries();
    expect(total).toBe(2);
  });

  describe("getRecentEntryes", () => {
    test("debe retornar las últimas 3 entradas en orden inverso", async () => {
      const entries = [
        { id: "1" },
        { id: "2" },
        { id: "3" },
        { id: "4" },
        { id: "5" },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(entries)
      );
      const recent = await Journal.getRecentEntryes();
      expect(recent).toEqual([{ id: "5" }, { id: "4" }, { id: "3" }]);
    });
  });

  describe("addExampleEntries", () => {
    test("debe agregar entradas y retornar true", async () => {
      const entries = [{ id: "2025-04-03" , date: "2025-04-03"}];
      const result = await Journal.addExampleEntries(entries);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "journal_entries",
        JSON.stringify(entries)
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "entries_dirty",
        "true"
      );
      expect(result).toBe(true);
    });

    test("debe retornar false si ocurre un error", async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error("fail")
      );
      const result = await Journal.addExampleEntries([]);
      expect(result).toBe(false);
    });
  });

  describe("removeAllEntries", () => {
    test("debe eliminar todas las entradas y retornar true", async () => {
      const result = await Journal.removeAllEntries();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("journal_entries");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "entries_dirty",
        "true"
      );
      expect(result).toBe(true);
    });

    test("debe retornar false si ocurre un error", async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
        new Error("fail")
      );
      const result = await Journal.removeAllEntries();
      expect(result).toBe(false);
    });
  });
});

describe("getStreakCount", () => {
  // Configurar el tiempo del sistema para que sea predecible
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-04-03"));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  test("debe retornar el conteo correcto para días consecutivos", async () => {
    // Entradas para 2025-04-03, 2025-04-02 y 2025-04-01
    const entries = [
      { id: "2025-04-03" },
      { id: "2025-04-02" },
      { id: "2025-04-01" },
    ];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(entries)
    );
    const streak = await Journal.getStreakCount();
    expect(streak).toBe(3);
  });

  test("debe romper la racha si hay un salto mayor a 1 día", async () => {
    // Entradas para 2025-04-03 y 2025-04-01 (salto de 2 días)
    const entries = [{ id: "2025-04-03" }, { id: "2025-04-01" }];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(entries)
    );
    const streak = await Journal.getStreakCount();
    expect(streak).toBe(1);
  });
});

describe("Verificación de entradas del día", () => {
  describe("checkIsTodayWritten", () => {
    test("debe retornar true si existe una entrada para hoy", async () => {
      (getTodayId as jest.Mock).mockReturnValue("2025-04-03");
      const entries = [{ id: "2025-04-03", date: "2025-04-03" }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(entries)
      );
      const result = await Journal.checkIsTodayWritten();
      expect(result).toBe(true);
    });

    test("debe retornar false si no existe una entrada para hoy", async () => {
      (getTodayId as jest.Mock).mockReturnValue("2025-04-03");
      const entries = [{ id: "2025-04-02", date: "2025-04-02" }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(entries)
      );
      const result = await Journal.checkIsTodayWritten();
      expect(result).toBe(false);
    });
  });

  describe("getTodayEntry", () => {
    test("debe retornar la entrada de hoy si existe", async () => {
      (getTodayId as jest.Mock).mockReturnValue("2025-04-03");
      const todayEntry = { id: "2025-04-03", date: "2025-04-03" };
      const entries = [todayEntry, { id: "2025-04-02", date: "2025-04-02" }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(entries)
      );
      const result = await Journal.getTodayEntry();
      expect(result).toEqual(todayEntry);
    });

    test("debe retornar null si no hay entrada para hoy", async () => {
      (getTodayId as jest.Mock).mockReturnValue("2025-04-03");
      const entries = [{ id: "2025-04-02", date: "2025-04-02" }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(entries)
      );
      const result = await Journal.getTodayEntry();
      expect(result).toBeNull();
    });
  });
});

describe("Manejo de imágenes", () => {
  describe("selectAndSaveImage", () => {
    test("debe llamar a saveImageToDevice si se selecciona una imagen", async () => {
      const tempUri = "temp-uri";
      const localUri = "local-uri";
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: tempUri }],
      });
      // Espiar la función saveImageToDevice
      const spySaveImage = jest
        .spyOn(Journal, "saveImageToDevice")
        .mockResolvedValueOnce(localUri);
      const result = await Journal.selectAndSaveImage();
      expect(spySaveImage).toHaveBeenCalledWith(tempUri);
      expect(result).toBe(localUri);
      spySaveImage.mockRestore();
    });

    test("debe retornar null si la selección es cancelada", async () => {
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: true,
      });
      const result = await Journal.selectAndSaveImage();
      expect(result).toBeNull();
    });
  });

  describe("saveImageToDevice", () => {
    test("debe copiar la imagen y retornar la nueva ruta", async () => {
      const uri = "file://path/to/image.jpg";
      const fileName = "image.jpg";
      const newPath = `${FileSystem.documentDirectory}${fileName}`;
      (FileSystem.copyAsync as jest.Mock).mockResolvedValueOnce({});
      const result = await Journal.saveImageToDevice(uri);
      expect(FileSystem.copyAsync).toHaveBeenCalledWith({
        from: uri,
        to: newPath,
      });
      expect(result).toBe(newPath);
    });

    test("debe retornar null si ocurre un error al copiar la imagen", async () => {
      const uri = "file://path/to/image.jpg";
      (FileSystem.copyAsync as jest.Mock).mockRejectedValueOnce(
        new Error("fail")
      );
      const result = await Journal.saveImageToDevice(uri);
      expect(result).toBeNull();
    });
  });

  describe("deleteImageFromDevice", () => {
    test("debe eliminar la imagen y retornar true", async () => {
      const uri = "file://path/to/image.jpg";
      (FileSystem.deleteAsync as jest.Mock).mockResolvedValueOnce({});
      const result = await Journal.deleteImageFromDevice(uri);
      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(uri, {
        idempotent: true,
      });
      expect(result).toBe(true);
    });

    test("debe retornar false si ocurre un error al eliminar la imagen", async () => {
      const uri = "file://path/to/image.jpg";
      (FileSystem.deleteAsync as jest.Mock).mockRejectedValueOnce(
        new Error("fail")
      );
      const result = await Journal.deleteImageFromDevice(uri);
      expect(result).toBe(false);
    });
  });
});
