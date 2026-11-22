import { parseQrData } from '../ScannerScreen';

jest.mock('expo-camera', () => ({
  CameraView: {
    onModernBarcodeScanned: jest.fn(() => ({ remove: jest.fn() })),
  },
  useCameraPermissions: () => [null, jest.fn()],
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

describe('parseQrData', () => {
  const mockSecret = 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90';

  it('poprawnie parsuje format JSON z aplikacji mobilnej', () => {
    const raw = JSON.stringify({
      ip: '192.168.1.150',
      port: 5000,
      secret: mockSecret,
    });
    const result = parseQrData(raw);
    expect(result).toEqual({
      ip: '192.168.1.150',
      secret: mockSecret,
    });
  });

  it('poprawnie parsuje bezpieczny format URL z hashem (#secret=)', () => {
    const raw = `http://192.168.1.200:5000/#secret=${mockSecret}`;
    const result = parseQrData(raw);
    expect(result).toEqual({
      ip: '192.168.1.200',
      secret: mockSecret,
    });
  });

  it('poprawnie parsuje format URL ze wsteczną kompatybilnością query (?secret=)', () => {
    const raw = `http://192.168.1.200:5000/?secret=${mockSecret}`;
    const result = parseQrData(raw);
    expect(result).toEqual({
      ip: '192.168.1.200',
      secret: mockSecret,
    });
  });

  it('poprawnie parsuje format kompaktowy dodeck://', () => {
    const raw = `dodeck://192.168.1.99#${mockSecret}`;
    const result = parseQrData(raw);
    expect(result).toEqual({
      ip: '192.168.1.99',
      secret: mockSecret,
    });
  });

  it('zwraca null dla niepoprawnych danych wejściowych', () => {
    expect(parseQrData(null)).toBeNull();
    expect(parseQrData(undefined)).toBeNull();
    expect(parseQrData('')).toBeNull();
    expect(parseQrData('losowy tekst bez sekretu')).toBeNull();
    expect(parseQrData(JSON.stringify({ ip: '192.168.1.1' }))).toBeNull();
  });
});
