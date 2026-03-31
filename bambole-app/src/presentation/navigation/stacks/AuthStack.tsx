import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../../screens/auth/LoginScreen';
import { SignUpScreen } from '../../screens/auth/SignUpScreen';
import { PasswordRecoveryScreen } from '../../screens/auth/PasswordRecoveryScreen';
import { AuthStackParamList } from '../types';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: true, title: 'Cadastro' }} />
        <Stack.Screen name="Recovery" component={PasswordRecoveryScreen} options={{ headerShown: true, title: 'Recuperar Senha' }} />
    </Stack.Navigator>
);
