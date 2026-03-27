import React, { createContext, useContext, useState } from 'react';
import { User } from '@/domain/identity/entities/User';
import { Role, UserRole } from '@/domain/identity/value-objects/Role';
import { Email } from '@/domain/identity/value-objects/Email';

interface AuthContextData {
    user: User | null;
    signIn: (role: UserRole) => void;
    signOut: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Temporary sign in for navigation testing
    const signIn = (role: UserRole) => {
        const mockUser = new User(
            'mock-id',
            Email.create('mock@test.com'),
            Role.create(role)
        );
        setUser(mockUser);
    };

    const signOut = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
