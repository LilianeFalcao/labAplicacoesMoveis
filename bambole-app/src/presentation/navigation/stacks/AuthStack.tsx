import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../../screens/auth/LoginScreen';
import { SignUpScreen } from '../../screens/auth/SignUpScreen';
import { PasswordRecoveryScreen } from '../../screens/auth/PasswordRecoveryScreen';

const Stack = createStackNavigator();

export const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: true, title: 'Cadastro' }} />
        <Stack.Screen name="Recovery" component={PasswordRecoveryScreen} options={{ headerShown: true, title: 'Recuperar Senha' }} />
    </Stack.Navigator>
);
