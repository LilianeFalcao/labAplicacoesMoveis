import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/infrastructure/supabase/client';
import { User } from '@/domain/identity/entities/User';
import { Role, UserRole } from '@/domain/identity/value-objects/Role';
import { Email } from '@/domain/identity/value-objects/Email';
import { SupabaseUserRepository } from '@/infrastructure/identity/repositories/SupabaseUserRepository';
import { SupabaseAuthService } from '@/infrastructure/identity/services/SupabaseAuthService';
import { SignInUseCase } from '@/application/identity/use-cases/SignInUseCase';
import { SignUpParentUseCase } from '@/application/identity/use-cases/SignUpParentUseCase';
import { SupabaseGuardianRepository } from '@/infrastructure/enrollment/repositories/SupabaseGuardianRepository';

interface AuthContextData {
    user: User | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (fullName: string, email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Dependencies
    const userRepository = new SupabaseUserRepository();
    const authService = new SupabaseAuthService();
    const guardianRepository = new SupabaseGuardianRepository();
    const signInUseCase = new SignInUseCase(authService, userRepository);
    const signUpUseCase = new SignUpParentUseCase(authService, userRepository, guardianRepository);

    const loadUserProfile = async (userId: string) => {
        try {
            const profile = await userRepository.findById(userId);
            setUser(profile);
        } catch (error) {
            console.error('Error loading profile:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        if (!user) return;
        const profile = await userRepository.findById(user.id);
        setUser(profile);
    };

    useEffect(() => {
        // Check active sessions and sets up the listener
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                loadUserProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                loadUserProfile(session.user.id);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            await signInUseCase.execute(email, password);
            // Profiling is handled by onAuthStateChange
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const signUp = async (fullName: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            await signUpUseCase.execute(fullName, email, password);
            // Profiling will be triggered by onAuthStateChange in Supabase 
            // after the session is created
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const signOut = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            signIn, 
            signUp,
            signOut, 
            isLoading,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
