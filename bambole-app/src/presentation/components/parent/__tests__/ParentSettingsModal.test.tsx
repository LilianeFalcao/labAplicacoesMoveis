import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { ParentSettingsModal } from '../ParentSettingsModal';
import { Linking } from 'react-native';

// Mock useTheme hook
jest.mock('../../../contexts/ThemeContext', () => ({
    useTheme: () => ({
        colors: {
            primary: '#005E9E',
            background: '#F8FAFC',
            surface: '#FFFFFF',
            onPrimary: '#FFFFFF',
            onBackground: '#1E293B',
            onSurface: '#0F172A',
            error: '#EF4444',
            warning: '#F59E0B',
            success: '#10B981',
            gray: {
                50: '#F8FAFC',
                100: '#F1F5F9',
                200: '#E2E8F0',
                300: '#CBD5E1',
                400: '#94A3B8',
                500: '#64748B',
                600: '#475569',
                700: '#334155',
                800: '#1E293B',
                900: '#0F172A',
            }
        },
        activeTheme: {
            spacing: {
                xs: 9,
                sm: 8,
                md: 16,
                lg: 25,
                xl: 32,
                xxl: 48,
            }
        }
    })
}));

// Mocks for Repositories
const mockFindByUserId = jest.fn();
const mockFindByGuardianId = jest.fn();
const mockFindClassById = jest.fn();

jest.mock('../../../../infrastructure/enrollment/repositories/SupabaseGuardianRepository', () => ({
    SupabaseGuardianRepository: jest.fn().mockImplementation(() => ({
        findByUserId: mockFindByUserId
    }))
}));

jest.mock('../../../../infrastructure/enrollment/repositories/SupabaseChildRepository', () => ({
    SupabaseChildRepository: jest.fn().mockImplementation(() => ({
        findByGuardianId: mockFindByGuardianId
    }))
}));

jest.mock('../../../../infrastructure/activity/repositories/SupabaseClassRepository', () => ({
    SupabaseClassRepository: jest.fn().mockImplementation(() => ({
        findById: mockFindClassById
    }))
}));

// Mock Linking
jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve(true));

describe('ParentSettingsModal', () => {
    const mockUser = {
        id: 'user_123',
        email: { value: 'responsavel@bambole.com' }
    };
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render Personal Data panel correctly', () => {
        const { getByText } = render(
            <ParentSettingsModal
                isVisible={true}
                onClose={mockOnClose}
                sectionId="1"
                sectionTitle="Dados Pessoais"
                user={mockUser}
            />
        );

        expect(getByText('Dados Pessoais')).toBeTruthy();
        expect(getByText('responsavel@bambole.com')).toBeTruthy();
        expect(getByText('Responsável (Pai/Mãe)')).toBeTruthy();
        expect(getByText('user_123')).toBeTruthy();
        expect(getByText('Ativa')).toBeTruthy();
    });

    it('should render Linked Children panel correctly after loading data', async () => {
        mockFindByUserId.mockResolvedValue({ id: 'guardian_999' });
        mockFindByGuardianId.mockResolvedValue([
            { id: 'child_1', name: { value: 'Lucas Silva' }, classId: 'class_abc', photoUrl: undefined }
        ]);
        mockFindClassById.mockResolvedValue({ name: 'Maternal A' });

        const { getByText, queryByText } = render(
            <ParentSettingsModal
                isVisible={true}
                onClose={mockOnClose}
                sectionId="2"
                sectionTitle="Filhos Vinculados"
                user={mockUser}
            />
        );

        expect(getByText('Filhos Vinculados')).toBeTruthy();
        
        await waitFor(() => {
            expect(queryByText('Carregando filhos vinculados...')).toBeNull();
            expect(getByText('Lucas Silva')).toBeTruthy();
            expect(getByText('Maternal A')).toBeTruthy();
        });
    });

    it('should render Notifications panel with switch toggles', () => {
        const { getByText } = render(
            <ParentSettingsModal
                isVisible={true}
                onClose={mockOnClose}
                sectionId="3"
                sectionTitle="Notificações"
                user={mockUser}
            />
        );

        expect(getByText('Notificações')).toBeTruthy();
        expect(getByText('Presenças e Faltas')).toBeTruthy();
        expect(getByText('Fotos e Atividades')).toBeTruthy();
        expect(getByText('Avisos e Comunicados')).toBeTruthy();
    });

    it('should render Security panel', () => {
        const { getByText } = render(
            <ParentSettingsModal
                isVisible={true}
                onClose={mockOnClose}
                sectionId="4"
                sectionTitle="Segurança"
                user={mockUser}
            />
        );

        expect(getByText('Segurança')).toBeTruthy();
        expect(getByText('Acesso Protegido')).toBeTruthy();
        expect(getByText('Tokens Criptografados')).toBeTruthy();
        expect(getByText('Alterar de Senha')).toBeTruthy();
    });

    it('should render Help Center panel and trigger Linking actions', () => {
        const { getByText } = render(
            <ParentSettingsModal
                isVisible={true}
                onClose={mockOnClose}
                sectionId="5"
                sectionTitle="Central de Ajuda"
                user={mockUser}
            />
        );

        expect(getByText('Central de Ajuda')).toBeTruthy();
        expect(getByText('Enviar E-mail')).toBeTruthy();
        expect(getByText('Ligar Agora')).toBeTruthy();

        // Trigger phone call linking
        const callBtn = getByText('Ligar Agora');
        fireEvent.press(callBtn);
        expect(Linking.openURL).toHaveBeenCalledWith('tel:1140028922');

        // Trigger email linking
        const emailBtn = getByText('Enviar E-mail');
        fireEvent.press(emailBtn);
        expect(Linking.openURL).toHaveBeenCalledWith('mailto:suporte@bambole.edu.br?subject=Suporte Bambolê App');
    });
});
