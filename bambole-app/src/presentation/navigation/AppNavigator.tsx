import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { AuthStack } from './stacks/AuthStack';
import { ParentStack, MonitorStack, AdminStack } from './stacks/RoleStacks';

export const navigationRef = createNavigationContainerRef<any>();

export const AppNavigator = () => {
    const { user } = useAuth();

    return (
        <NavigationContainer ref={navigationRef}>
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
