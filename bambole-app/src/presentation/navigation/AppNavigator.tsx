import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { AuthStack } from './stacks/AuthStack';
import { ParentStack, MonitorStack, AdminStack } from './stacks/RoleStacks';

export const AppNavigator = () => {
    const { user } = useAuth();

    return (
        <NavigationContainer>
            {!user ? (
                <AuthStack />
            ) : user.role.value === 'parent' ? (
                <ParentStack />
            ) : user.role.value === 'monitor' ? (
                <MonitorStack />
            ) : (
                <AdminStack />
            )}
        </NavigationContainer>
    );
};
