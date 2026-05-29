import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

interface MonitorSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MonitorSidebar: React.FC<MonitorSidebarProps> = ({ isOpen, onClose }) => {
    const { user, signOut } = useAuth();
    const navigation = useNavigation<any>();
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    useEffect(() => {
        const loadSavedPhoto = async () => {
            if (isOpen && user?.id) {
                try {
                    const saved = await AsyncStorage.getItem(`profile_photo_${user.id}`);
                    if (saved) {
                        setPhotoUri(saved);
                    } else {
                        setPhotoUri(null);
                    }
                } catch (err) {
                    console.error('Failed to load profile photo', err);
                }
            }
        };
        loadSavedPhoto();
    }, [isOpen, user?.id]);
    const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    
    // State to control rendering, allowing animation to finish before unmounting
    const [isRendered, setIsRendered] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
        }

        Animated.parallel([
            Animated.timing(translateX, {
                toValue: isOpen ? 0 : -DRAWER_WIDTH,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: isOpen ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            if (!isOpen) {
                setIsRendered(false);
            }
        });
    }, [isOpen]);

    const handleNavigate = (route: string) => {
        onClose();
        navigation.navigate(route);
    };

    if (!isRendered) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? 'auto' : 'none'}>
            {/* Backdrop */}
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View style={[styles.backdrop, { opacity }]} />
            </TouchableWithoutFeedback>

            {/* Drawer Content */}
            <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
                <TouchableOpacity 
                    style={styles.header}
                    activeOpacity={0.7}
                    onPress={() => handleNavigate('Profile')}
                >
                    <View style={styles.avatarCircle}>
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} style={styles.avatarImage} />
                        ) : (
                            <MaterialCommunityIcons name="account-tie" size={40} color="#FFF" />
                        )}
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.userName}>{user?.email?.value?.split('@')[0] || 'Monitor'}</Text>
                        <Text style={styles.userRole}>Monitor(a) Ativo</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.menu}>
                    <MenuItem 
                        icon="home-outline" 
                        label="Início" 
                        onPress={() => handleNavigate('MonitorHome')} 
                    />
                    <MenuItem 
                        icon="account-group-outline" 
                        label="Minhas Turmas" 
                        onPress={() => handleNavigate('MonitorClasses')} 
                    />
                    <MenuItem 
                        icon="history" 
                        label="Histórico de Atividades" 
                        onPress={() => handleNavigate('ActivityHistory')} 
                    />
                    <MenuItem 
                        icon="alert-circle-outline" 
                        label="Reportar Incidente" 
                        onPress={() => {
                            onClose();
                            // This would typically open a modal or navigate
                        }} 
                    />
                    
                    <View style={styles.divider} />
                    
                    <MenuItem 
                        icon="account-circle-outline" 
                        label="Meu Perfil" 
                        onPress={() => handleNavigate('Profile')} 
                    />
                    <MenuItem 
                        icon="cog-outline" 
                        label="Configurações" 
                        onPress={() => handleNavigate('MonitorSettings')} 
                    />
                    <MenuItem 
                        icon="help-circle-outline" 
                        label="Ajuda e Suporte" 
                        onPress={() => {}} 
                    />
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                        <MaterialCommunityIcons name="logout" size={24} color={Theme.colors.error} />
                        <Text style={styles.logoutText}>Sair da Conta</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

const MenuItem = ({ icon, label, onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <MaterialCommunityIcons name={icon} size={24} color={Theme.colors.gray[600]} />
        <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    drawer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: DRAWER_WIDTH,
        backgroundColor: 'white',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 30,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.gray[100],
        marginBottom: 20,
    },
    avatarCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    headerInfo: {
        marginLeft: 15,
    },
    userName: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
        textTransform: 'capitalize',
    },
    userRole: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
    },
    menu: {
        flex: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        marginBottom: 5,
    },
    menuLabel: {
        marginLeft: 15,
        ...Theme.typography.body1,
        color: Theme.colors.gray[700],
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: Theme.colors.gray[100],
        marginVertical: 20,
    },
    footer: {
        paddingVertical: 30,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.gray[100],
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutText: {
        marginLeft: 10,
        ...Theme.typography.body2,
        color: Theme.colors.error,
        fontWeight: 'bold',
    },
});
