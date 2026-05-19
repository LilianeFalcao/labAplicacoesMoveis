import 'react-native-gesture-handler/jestSetup';

// Mocking AsyncStorage globally for Jest
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mocking Supabase globally to prevent connection/env errors in Jest
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn().mockReturnValue({
        auth: {
            signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'mock-user-id' } }, error: null }),
            signInWithPassword: jest.fn().mockResolvedValue({ data: { user: { id: 'mock-user-id' } }, error: null }),
            signOut: jest.fn().mockResolvedValue({ error: null }),
            onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: null })),
        upsert: jest.fn().mockImplementation(() => Promise.resolve({ error: null })),
    }),
}));

// Mocking expo-sqlite globally to prevent native module errors in Jest
jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn().mockResolvedValue({
        execAsync: jest.fn().mockResolvedValue(undefined),
        getAllAsync: jest.fn().mockResolvedValue([]),
        runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
    }),
}));
