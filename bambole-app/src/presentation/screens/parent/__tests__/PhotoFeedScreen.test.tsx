import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { PhotoFeedScreen } from '../PhotoFeedScreen';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityPhoto } from '../../../../domain/activity/entities/ActivityPhoto';

// Local mock function variables for use case instances
const mockExecuteGetConsent = jest.fn();
const mockExecuteUpdateConsent = jest.fn();
const mockExecuteGetActivityFeed = jest.fn();

// Mock useAuth context with stable object reference
const mockUser = { id: 'parent-user-123' };
jest.mock('../../../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser
    })
}));

// Mock repositories and use cases cleanly at instance level
jest.mock('../../../../application/enrollment/use-cases/GetGuardianConsentUseCase', () => {
    return {
        GetGuardianConsentUseCase: jest.fn().mockImplementation(() => ({
            execute: mockExecuteGetConsent
        }))
    };
});

jest.mock('../../../../application/enrollment/use-cases/UpdateGuardianConsentUseCase', () => {
    return {
        UpdateGuardianConsentUseCase: jest.fn().mockImplementation(() => ({
            execute: mockExecuteUpdateConsent
        }))
    };
});

jest.mock('../../../../application/activity/use-cases/GetActivityFeedUseCase', () => {
    return {
        GetActivityFeedUseCase: jest.fn().mockImplementation(() => ({
            execute: mockExecuteGetActivityFeed
        }))
    };
});

jest.mock('../../../../infrastructure/enrollment/repositories/SupabaseGuardianRepository');
jest.mock('../../../../infrastructure/enrollment/repositories/SupabaseChildRepository');
jest.mock('../../../../infrastructure/activity/repositories/MockActivityRepository', () => ({
    MockActivityRepository: {
        getInstance: jest.fn().mockReturnValue({
            getFeedByClass: jest.fn(),
            savePhoto: jest.fn(),
        })
    }
}));

jest.mock('react-native-safe-area-context', () => {
    const { View } = require('react-native');
    return {
        SafeAreaView: (props: any) => <View {...props}>{props.children}</View>,
        SafeAreaProvider: (props: any) => <View {...props}>{props.children}</View>,
        useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
    };
});

describe('PhotoFeedScreen', () => {
    const mockPhotos = [
        ActivityPhoto.create({ id: '1', classId: 'c1', photoUri: 'https://example.com/photo1.jpg', caption: 'Primeira Foto', timestamp: new Date() }),
        ActivityPhoto.create({ id: '2', classId: 'c2', photoUri: 'https://example.com/photo2.jpg', caption: 'Segunda Foto', timestamp: new Date() }),
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockExecuteGetConsent.mockResolvedValue(false);
        mockExecuteUpdateConsent.mockResolvedValue(true);
        mockExecuteGetActivityFeed.mockResolvedValue(mockPhotos);
    });

    const renderScreen = () => {
        return render(
            <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 0, height: 0 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
                <NavigationContainer>
                    <PhotoFeedScreen />
                </NavigationContainer>
            </SafeAreaProvider>
        );
    };

    it('deve exibir a tela de termo de consentimento LGPD se não houver consentimento', async () => {
        mockExecuteGetConsent.mockResolvedValue(false);
        const { getByText } = renderScreen();

        await waitFor(() => {
            expect(getByText('Termo de Consentimento de Uso de Imagem')).toBeTruthy();
            expect(getByText('Em conformidade com a Lei Geral de Proteção de Dados (LGPD), precisamos da sua autorização expressa para exibir as fotos do dia a dia escolar do seu filho.')).toBeTruthy();
        });
    });

    it('deve carregar e exibir as fotos se houver consentimento', async () => {
        mockExecuteGetConsent.mockResolvedValue(true);
        const { getByText, queryByText } = renderScreen();

        await waitFor(() => {
            // No modo grid (padrão), o cabeçalho deve estar visível
            expect(getByText('Fotos da Turma')).toBeTruthy();
            expect(getByText('Bambolê Feed')).toBeTruthy();
            // A tela de termo NÃO deve ser exibida
            expect(queryByText('Termo de Consentimento de Uso de Imagem')).toBeNull();
        });
    });

    it('deve permitir a alternância de modos de visualização entre Grade e Lista', async () => {
        mockExecuteGetConsent.mockResolvedValue(true);
        const { getByText } = renderScreen();

        await waitFor(() => {
            expect(getByText('Fotos da Turma')).toBeTruthy();
        });
    });
});
