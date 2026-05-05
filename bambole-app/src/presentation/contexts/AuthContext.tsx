import React, { createContext, useContext, useState } from 'react';
import { User } from '@/domain/identity/entities/User';
import { Role, UserRole } from '@/domain/identity/value-objects/Role';
import { Email } from '@/domain/identity/value-objects/Email';

interface AuthContextData {
    user: User | null;
    signIn: (email: string, role: UserRole) => void;
    signOut: () => void;
    isLoading: boolean;
    isSimulated: boolean;
    startSimulation: (email: string, role: UserRole) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSimulated, setIsSimulated] = useState(false);

    // Temporary sign in for navigation testing
    const signIn = (email: string, role: UserRole) => {
        const mockUser = new User(
            email, // Deterministic ID for mock
            Email.create(email),
            Role.create(role)
        );
        setUser(mockUser);
        setIsSimulated(false);
    };

    const startSimulation = (email: string, role: UserRole) => {
        const mockUser = new User(
            email, // Deterministic ID for mock
            Email.create(email),
            Role.create(role)
        );
        setUser(mockUser);
        setIsSimulated(true);
    };

    const signOut = () => {
        setUser(null);
        setIsSimulated(false);
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, isLoading, isSimulated, startSimulation }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
