import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QuickAddActivityModal } from '../QuickAddActivityModal';
import { SqliteStorageService } from '../../../../infrastructure/storage/SqliteStorageService';
import { ConnectivityService } from '../../../../infrastructure/network/ConnectivityService';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock SqliteStorageService
jest.mock('../../../../infrastructure/storage/SqliteStorageService', () => {
    const mockRun = jest.fn().mockResolvedValue(undefined);
    const mockQuery = jest.fn().mockResolvedValue([]);
    return {
        SqliteStorageService: {
            getInstance: jest.fn().mockReturnValue({
                run: mockRun,
                query: mockQuery,
            }),
        },
    };
});

// Mock ConnectivityService
jest.mock('../../../../infrastructure/network/ConnectivityService', () => {
    const mockGetStatus = jest.fn().mockReturnValue('online');
    return {
        ConnectivityService: {
            getInstance: jest.fn().mockReturnValue({
                getStatus: mockGetStatus,
            }),
        },
    };
});

// Mock Vector Icons to prevent missing native assets error in Jest
jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
        MaterialCommunityIcons: (props: any) => <Text>{props.name}</Text>,
    };
});

describe('QuickAddActivityModal', () => {
    const mockOnClose = jest.fn();
    const mockOnCreated = jest.fn();
    const mockClasses = [
        { id: 'class-1', name: 'Turma A' },
        { id: 'class-2', name: 'Turma B' },
    ];

    let mockSqliteService: any;
    let mockConnectivityService: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSqliteService = SqliteStorageService.getInstance();
        mockConnectivityService = ConnectivityService.getInstance();
        
        // Mock crypto in global environment for testing
        const globalAny = global as any;
        globalAny.crypto = {
            randomUUID: jest.fn().mockReturnValue('mocked-uuid-123'),
        };
    });

    const renderModal = (visible = true) => {
        return render(
            <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 0, height: 0 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
                <QuickAddActivityModal
                    visible={visible}
                    onClose={mockOnClose}
                    monitorClasses={mockClasses}
                    onCreated={mockOnCreated}
                />
            </SafeAreaProvider>
        );
    };

    describe('7.1 - Rendering and Validation', () => {
        it('should render form fields correctly when visible', () => {
            const { getByPlaceholderText, getByText } = renderModal(true);

            expect(getByPlaceholderText('Ex: Oficina de Pintura')).toBeTruthy();
            expect(getByPlaceholderText('Detalhes da atividade...')).toBeTruthy();
            expect(getByPlaceholderText('09:00')).toBeTruthy();
            expect(getByPlaceholderText('10:00')).toBeTruthy();
            expect(getByText('Nova Atividade')).toBeTruthy();
            expect(getByText('Salva offline e sincroniza automaticamente')).toBeTruthy();
        });

        it('should display error when title is empty upon submission', async () => {
            const { getByText } = renderModal(true);

            const submitButton = getByText('Criar Atividade');
            fireEvent.press(submitButton);

            await waitFor(() => {
                expect(getByText('Título é obrigatório')).toBeTruthy();
            });
            
            expect(mockOnCreated).not.toHaveBeenCalled();
            expect(mockSqliteService.run).not.toHaveBeenCalled();
        });

        it('should display error when end time is before or equal to start time', async () => {
            const { getByPlaceholderText, getByText } = renderModal(true);

            const titleInput = getByPlaceholderText('Ex: Oficina de Pintura');
            fireEvent.changeText(titleInput, 'Atividade Teste');

            const startInput = getByPlaceholderText('09:00');
            fireEvent.changeText(startInput, '10:00');

            const endInput = getByPlaceholderText('10:00');
            fireEvent.changeText(endInput, '09:00');

            const submitButton = getByText('Criar Atividade');
            fireEvent.press(submitButton);

            await waitFor(() => {
                expect(getByText('Horário de término deve ser após o início')).toBeTruthy();
            });

            expect(mockOnCreated).not.toHaveBeenCalled();
            expect(mockSqliteService.run).not.toHaveBeenCalled();
        });

        it('should display error when time format is invalid', async () => {
            const { getByPlaceholderText, getByText } = renderModal(true);

            const titleInput = getByPlaceholderText('Ex: Oficina de Pintura');
            fireEvent.changeText(titleInput, 'Atividade Teste');

            const startInput = getByPlaceholderText('09:00');
            fireEvent.changeText(startInput, '9:00'); // invalid format

            const endInput = getByPlaceholderText('10:00');
            fireEvent.changeText(endInput, '10:00');

            const submitButton = getByText('Criar Atividade');
            fireEvent.press(submitButton);

            await waitFor(() => {
                expect(getByText('Use o formato HH:MM (ex: 09:30)')).toBeTruthy();
            });

            expect(mockOnCreated).not.toHaveBeenCalled();
        });

        it('should display error when start time or end time is empty upon submission', async () => {
            const { getByPlaceholderText, getByText } = renderModal(true);

            const titleInput = getByPlaceholderText('Ex: Oficina de Pintura');
            fireEvent.changeText(titleInput, 'Atividade Sem Horario');

            const submitButton = getByText('Criar Atividade');
            fireEvent.press(submitButton);

            await waitFor(() => {
                expect(getByText('Horário de início é obrigatório')).toBeTruthy();
            });

            // Fill start time but keep end time empty
            const startInput = getByPlaceholderText('09:00');
            fireEvent.changeText(startInput, '09:00');

            fireEvent.press(submitButton);

            await waitFor(() => {
                expect(getByText('Horário de término é obrigatório')).toBeTruthy();
            });

            expect(mockOnCreated).not.toHaveBeenCalled();
            expect(mockSqliteService.run).not.toHaveBeenCalled();
        });
    });

    describe('7.2 - Successful Creation', () => {
        it('should create activity and sync queue record locally, and trigger callbacks on online success', async () => {
            mockConnectivityService.getStatus.mockReturnValue('online');
            const alertSpy = jest.spyOn(Alert, 'alert');

            const { getByPlaceholderText, getByText } = renderModal(true);

            // Fill fields
            const titleInput = getByPlaceholderText('Ex: Oficina de Pintura');
            fireEvent.changeText(titleInput, 'Oficina de Pintura');

            const descInput = getByPlaceholderText('Detalhes da atividade...');
            fireEvent.changeText(descInput, 'Descricao legal');

            const startInput = getByPlaceholderText('09:00');
            fireEvent.changeText(startInput, '14:30');

            const endInput = getByPlaceholderText('10:00');
            fireEvent.changeText(endInput, '15:30');

            // Submit
            const submitButton = getByText('Criar Atividade');
            fireEvent.press(submitButton);

            await waitFor(() => {
                expect(mockSqliteService.run).toHaveBeenCalledTimes(2);
            });

            // First call: INSERT INTO class_activities
            expect(mockSqliteService.run).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('INSERT INTO class_activities'),
                ['mocked-uuid-123', 'class-1', 'Oficina de Pintura', 'Descricao legal', '14:30', '15:30', 'activity']
            );

            // Second call: INSERT INTO sync_queue
            expect(mockSqliteService.run).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining('INSERT INTO sync_queue'),
                [
                    expect.stringContaining('"id":"mocked-uuid-123"'),
                    expect.any(Number),
                ]
            );

            expect(mockOnCreated).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
            expect(alertSpy).toHaveBeenCalledWith(
                '✓ Atividade criada!',
                '"Oficina de Pintura" foi adicionada à agenda.'
            );
        });
    });

    describe('7.3 - Offline Behavior', () => {
        it('should create local activity and sync record offline, and display offline alert', async () => {
            mockConnectivityService.getStatus.mockReturnValue('offline');
            const alertSpy = jest.spyOn(Alert, 'alert');

            const { getByPlaceholderText, getByText } = renderModal(true);

            // Fill fields
            const titleInput = getByPlaceholderText('Ex: Oficina de Pintura');
            fireEvent.changeText(titleInput, 'Atividade Offline');

            const startInput = getByPlaceholderText('09:00');
            fireEvent.changeText(startInput, '14:30');

            const endInput = getByPlaceholderText('10:00');
            fireEvent.changeText(endInput, '15:30');

            // Submit
            const submitButton = getByText('Criar Atividade');
            fireEvent.press(submitButton);

            await waitFor(() => {
                expect(mockSqliteService.run).toHaveBeenCalledTimes(2);
            });

            expect(mockOnCreated).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
            expect(alertSpy).toHaveBeenCalledWith(
                'Atividade salva localmente',
                'Ela será sincronizada automaticamente quando houver conexão.'
            );
        });
    });
});
