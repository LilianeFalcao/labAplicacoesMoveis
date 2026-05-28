import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image, 
    Dimensions, 
    ActivityIndicator, 
    Alert, 
    Switch, 
    FlatList, 
    Animated, 
    RefreshControl,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/base/AppCard';
import { useAuth } from '../../contexts/AuthContext';
import { SupabaseGuardianRepository } from '../../../infrastructure/enrollment/repositories/SupabaseGuardianRepository';
import { GetGuardianConsentUseCase } from '../../../application/enrollment/use-cases/GetGuardianConsentUseCase';
import { UpdateGuardianConsentUseCase } from '../../../application/enrollment/use-cases/UpdateGuardianConsentUseCase';
import { SupabaseChildRepository } from '../../../infrastructure/enrollment/repositories/SupabaseChildRepository';
import { SupabaseActivityRepository } from '../../../infrastructure/activity/repositories/SupabaseActivityRepository';
import { GetActivityFeedUseCase } from '../../../application/activity/use-cases/GetActivityFeedUseCase';
import { MockEnrollmentService } from '../../../application/activity/services/MockEnrollmentService';

const { width } = Dimensions.get('window');
const GRID_SIZE = width / 3;

// InstagramPostCard Component to encapsulate Double Tap to Like and Pulsing Heart Animation
const InstagramPostCard = ({ 
    item, 
    onToggleLike, 
    onOpenComments 
}: { 
    item: any; 
    onToggleLike: (id: string, forceLike?: boolean) => void; 
    onOpenComments: (id: string) => void; 
}) => {
    const [lastPress, setLastPress] = useState(0);
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    const handleDoubleTap = () => {
        const now = Date.now();
        const DOUBLE_PRESS_DELAY = 300;
        if (now - lastPress < DOUBLE_PRESS_DELAY) {
            // Trigger heart scale and opacity animation sequence
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scaleValue, {
                        toValue: 1.2,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleValue, {
                        toValue: 1.0,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.delay(400),
                    Animated.timing(scaleValue, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true,
                    })
                ]),
                Animated.sequence([
                    Animated.timing(opacityValue, {
                        toValue: 0.9,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.delay(500),
                    Animated.timing(opacityValue, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true,
                    })
                ])
            ]).start();

            // Toggle like status
            onToggleLike(item.id, true);
        } else {
            setLastPress(now);
        }
    };

    const hasComments = item.comments && item.comments.length > 0;

    return (
        <View style={styles.feedCard}>
            {/* Header do Post */}
            <View style={styles.postHeader}>
                <Image source={{ uri: item.monitorAvatar }} style={styles.monitorAvatar} />
                <View style={styles.postHeaderInfo}>
                    <Text style={styles.monitorName}>{item.monitorName}</Text>
                    <Text style={styles.postSubinfo}>{item.className} • Colégio Bambolê</Text>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                    <MaterialCommunityIcons name="dots-horizontal" size={20} color={Theme.colors.gray[500]} />
                </TouchableOpacity>
            </View>

            {/* Imagem do Post com Toque Duplo */}
            <TouchableOpacity activeOpacity={1} onPress={handleDoubleTap} style={styles.imageContainer}>
                <Image source={{ uri: item.url }} style={styles.feedImage} />
                
                {/* Badge Sincronizando (Offline Queue) */}
                {item.isPending && (
                    <View style={styles.syncBadge}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color="#FFFFFF" />
                        <Text style={styles.syncBadgeText}>Sincronizando...</Text>
                    </View>
                )}

                {/* Coração Animado Central */}
                <Animated.View style={[
                    styles.heartOverlay,
                    {
                        opacity: opacityValue,
                        transform: [{ scale: scaleValue }]
                    }
                ]}>
                    <MaterialCommunityIcons name="heart" size={90} color="#FFFFFF" />
                </Animated.View>
            </TouchableOpacity>

            {/* Barra de Ações Rápidas */}
            <View style={styles.actionBar}>
                <View style={styles.leftActions}>
                    <TouchableOpacity onPress={() => onToggleLike(item.id)} style={styles.actionIcon}>
                        <MaterialCommunityIcons 
                            name={item.liked ? "heart" : "heart-outline"} 
                            size={26} 
                            color={item.liked ? "#EF4444" : Theme.colors.gray[700]} 
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIcon} onPress={() => onOpenComments(item.id)}>
                        <MaterialCommunityIcons name="comment-outline" size={24} color={Theme.colors.gray[700]} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.actionIcon}>
                    <MaterialCommunityIcons name="bookmark-outline" size={24} color={Theme.colors.gray[700]} />
                </TouchableOpacity>
            </View>

            {/* Curtidas, Legendas, Comentários e Data */}
            <View style={styles.postDetails}>
                <Text style={styles.likesText}>{item.likes} {item.likes === 1 ? 'curtida' : 'curtidas'}</Text>
                <Text style={styles.captionText}>
                    <Text style={styles.captionAuthor}>{item.monitorName} </Text>
                    {item.activity}
                </Text>
                {hasComments && (
                    <TouchableOpacity onPress={() => onOpenComments(item.id)} activeOpacity={0.7} style={styles.viewCommentsButton}>
                        <Text style={styles.viewCommentsText}>
                            Ver todos os {item.comments.length} {item.comments.length === 1 ? 'comentário' : 'comentários'}
                        </Text>
                    </TouchableOpacity>
                )}
                {!hasComments && !item.isPending && (
                    <TouchableOpacity onPress={() => onOpenComments(item.id)} activeOpacity={0.7} style={styles.viewCommentsButton}>
                        <Text style={styles.viewCommentsText}>Seja o primeiro a comentar...</Text>
                    </TouchableOpacity>
                )}
                <Text style={styles.postTime}>{item.date}</Text>
            </View>
        </View>
    );
};

export const PhotoFeedScreen = () => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [hasConsent, setHasConsent] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [updating, setUpdating] = useState<boolean>(false);
    const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

    // Instagram UI states
    const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
    const [photos, setPhotos] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Comments Modal states
    const [commentsModalVisible, setCommentsModalVisible] = useState(false);
    const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
    const [newCommentText, setNewCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const guardianRepo = new SupabaseGuardianRepository();
    const getConsentUseCase = new GetGuardianConsentUseCase(guardianRepo);
    const updateConsentUseCase = new UpdateGuardianConsentUseCase(guardianRepo);
    const userId = user?.id;

    const renderGridItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            activeOpacity={0.9} 
            style={{ width: GRID_SIZE, height: GRID_SIZE, padding: 1 }}
            onPress={() => setViewMode('feed')}
        >
            <Image source={{ uri: item.url }} style={{ width: '100%', height: '100%', backgroundColor: '#F1F5F9' }} />
            {item.isPending && (
                <View style={styles.gridSyncBadge}>
                    <MaterialCommunityIcons name="clock-outline" size={12} color="#FFFFFF" />
                </View>
            )}
            {item.liked && !item.isPending && (
                <View style={styles.gridHeartIcon}>
                    <MaterialCommunityIcons name="heart" size={12} color="#FFFFFF" />
                    <Text style={styles.gridHeartText}>{item.likes}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const activePhoto = photos.find(p => p.id === selectedPhotoId);
    const activeComments = activePhoto?.comments || [];

    const checkConsent = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const consent = await getConsentUseCase.execute(userId);
            setHasConsent(consent);
        } catch (error) {
            console.error('Failed to get guardian consent', error);
            setHasConsent(false);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const loadPhotos = useCallback(async () => {
        if (!userId || !hasConsent) return;
        setRefreshing(true);
        try {
            let classIds: string[] = [];
            try {
                const guardian = await guardianRepo.findByUserId(userId);
                if (guardian) {
                    const childRepo = new SupabaseChildRepository();
                    const children = await childRepo.findByGuardianId(guardian.id);
                    classIds = children.map(c => c.classId).filter((id): id is string => !!id);
                }
            } catch (e) {
                console.error("Erro ao obter turmas dinâmicas", e);
            }

            if (classIds.length === 0) {
                const enrollmentService = new MockEnrollmentService();
                classIds = await enrollmentService.getChildrenClassIds(userId);
            }

            const repository = SupabaseActivityRepository.getInstance();
            const useCase = new GetActivityFeedUseCase(repository);
            const feedPhotos = await useCase.execute({ classIds });

            const basePhotos = feedPhotos.map(p => {
                const rawLikes = p.likes || [];
                const rawComments = p.comments || [];
                return {
                    id: p.id,
                    url: p.photoUri,
                    date: p.timestamp.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }),
                    activity: p.caption || 'Atividade Livre e Interação no colégio',
                    likes: rawLikes.length,
                    likesList: rawLikes,
                    liked: rawLikes.includes(userId),
                    comments: rawComments,
                    monitorName: p.monitorName || 'Monitor Bambolê',
                    monitorAvatar: p.monitorAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
                    className: p.className || (p.classId === '1' ? 'Maternal A' : 'Jardim B'),
                    isPending: p.isPending,
                };
            });

            // High-quality high-fidelity templates as fallback/extra posts
            const mockPhotos = [
                {
                    id: 'm1',
                    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600',
                    date: '31 de Março',
                    activity: 'Trabalho em equipe e passes curtos nas aulas de Futebol! Ver a dedicação de cada um é indescritível! ⚽️',
                    likes: 18,
                    likesList: [] as string[],
                    liked: false,
                    comments: [] as any[],
                    monitorName: 'Mariana Lima',
                    monitorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
                    className: 'Maternal A',
                    isPending: false,
                },
                {
                    id: 'm2',
                    url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600',
                    date: '31 de Março',
                    activity: 'Aquarela e liberdade artística! Hoje exploramos o power das cores e o desenvolvimento da coordenação fina. 🎨🖌️',
                    likes: 24,
                    likesList: [] as string[],
                    liked: true,
                    comments: [] as any[],
                    monitorName: 'Prof. Ricardo',
                    monitorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
                    className: 'Jardim B',
                    isPending: false,
                },
                {
                    id: 'm3',
                    url: 'https://images.unsplash.com/photo-1540479859204-7cd3b0928f64?q=80&w=600',
                    date: '30 de Março',
                    activity: 'Atividade de dança criativa! Desenvolvendo a percepção rítmica e a criatividade expressiva em movimentos livres. 💃🕺',
                    likes: 15,
                    likesList: [] as string[],
                    liked: false,
                    comments: [] as any[],
                    monitorName: 'Ana Souza',
                    monitorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150',
                    className: 'Maternal A',
                    isPending: false,
                },
                {
                    id: 'm4',
                    url: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?q=80&w=600',
                    date: '30 de Março',
                    activity: 'Hora do conto na biblioteca. Viajando pelo universo mágico dos dinossauros! 🦕📖',
                    likes: 32,
                    likesList: [] as string[],
                    liked: false,
                    comments: [] as any[],
                    monitorName: 'Prof. Ricardo',
                    monitorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
                    className: 'Jardim B',
                    isPending: false,
                },
            ];

            const combined = basePhotos.length > 0 ? basePhotos : mockPhotos;
            setPhotos(combined);
        } catch (error) {
            console.error('Failed to load activity photos feed', error);
        } finally {
            setRefreshing(false);
        }
    }, [userId, hasConsent]);

    useEffect(() => {
        checkConsent();
    }, [checkConsent]);

    useEffect(() => {
        if (hasConsent === true) {
            loadPhotos();
        }
    }, [hasConsent, loadPhotos]);

    const handleAcceptConsent = async () => {
        if (!user) return;
        if (!termsAccepted) {
            Alert.alert('Aviso', 'Por favor, assinale o termo para autorizar o uso das imagens.');
            return;
        }

        setUpdating(true);
        try {
            await updateConsentUseCase.execute(user.id, true);
            setHasConsent(true);
            Alert.alert('Sucesso', 'Seu consentimento foi registrado. Galeria liberada!');
        } catch (error: any) {
            console.error('Failed to update consent', error);
            Alert.alert('Erro', 'Não foi possível registrar o termo de consentimento.');
        } finally {
            setUpdating(false);
        }
    };

    const toggleLike = async (photoId: string, forceLike?: boolean) => {
        if (!userId) return;

        if (photoId.startsWith('m')) {
            setPhotos(prevPhotos => 
                prevPhotos.map(photo => {
                    if (photo.id === photoId) {
                        const willLike = forceLike !== undefined ? forceLike : !photo.liked;
                        if (willLike === photo.liked) return photo;
                        return {
                            ...photo,
                            liked: willLike,
                            likes: willLike ? photo.likes + 1 : photo.likes - 1
                        };
                    }
                    return photo;
                })
            );
            return;
        }

        let originalPhoto: any = null;
        setPhotos(prevPhotos => 
            prevPhotos.map(photo => {
                if (photo.id === photoId) {
                    originalPhoto = { ...photo };
                    const willLike = forceLike !== undefined ? forceLike : !photo.liked;
                    if (willLike === photo.liked) return photo;

                    const updatedLikesList = willLike 
                        ? [...(photo.likesList || []), userId]
                        : (photo.likesList || []).filter((id: string) => id !== userId);

                    return {
                        ...photo,
                        liked: willLike,
                        likes: updatedLikesList.length,
                        likesList: updatedLikesList
                    };
                }
                return photo;
            })
        );

        try {
            const repository = SupabaseActivityRepository.getInstance();
            const updatedLikes = await repository.toggleLike(photoId, userId);
            
            setPhotos(prevPhotos => 
                prevPhotos.map(photo => {
                    if (photo.id === photoId) {
                        return {
                            ...photo,
                            liked: updatedLikes.includes(userId),
                            likes: updatedLikes.length,
                            likesList: updatedLikes
                        };
                    }
                    return photo;
                })
            );
        } catch (error) {
            console.error('Failed to toggle like on Supabase:', error);
            if (originalPhoto) {
                setPhotos(prevPhotos => 
                    prevPhotos.map(photo => photo.id === photoId ? originalPhoto : photo)
                );
            }
            Alert.alert('Erro', 'Não foi possível registrar sua curtida no momento.');
        }
    };

    const onOpenComments = (photoId: string) => {
        setSelectedPhotoId(photoId);
        setCommentsModalVisible(true);
    };

    const handleSendComment = async () => {
        if (!selectedPhotoId || !newCommentText.trim() || !userId) return;
        setSubmittingComment(true);
        
        const commentObj = {
            id: Math.random().toString(36).substring(2, 9),
            userId: userId,
            userName: user?.fullName || 'Responsável',
            text: newCommentText.trim(),
            createdAt: new Date().toISOString()
        };

        if (selectedPhotoId.startsWith('m')) {
            setPhotos(prevPhotos => 
                prevPhotos.map(photo => {
                    if (photo.id === selectedPhotoId) {
                        return {
                            ...photo,
                            comments: [...(photo.comments || []), commentObj]
                        };
                    }
                    return photo;
                })
            );
            setNewCommentText('');
            setSubmittingComment(false);
            return;
        }

        setPhotos(prevPhotos => 
            prevPhotos.map(photo => {
                if (photo.id === selectedPhotoId) {
                    return {
                        ...photo,
                        comments: [...(photo.comments || []), commentObj]
                    };
                }
                return photo;
            })
        );
        setNewCommentText('');

        try {
            const repository = SupabaseActivityRepository.getInstance();
            const updatedComments = await repository.addComment(selectedPhotoId, commentObj);
            
            setPhotos(prevPhotos => 
                prevPhotos.map(photo => {
                    if (photo.id === selectedPhotoId) {
                        return {
                            ...photo,
                            comments: updatedComments
                        };
                    }
                    return photo;
                })
            );
        } catch (error) {
            console.error('Failed to add comment on Supabase:', error);
            setPhotos(prevPhotos => 
                prevPhotos.map(photo => {
                    if (photo.id === selectedPhotoId) {
                        return {
                            ...photo,
                            comments: (photo.comments || []).filter((c: any) => c.id !== commentObj.id)
                        };
                    }
                    return photo;
                })
            );
            Alert.alert('Erro', 'Não foi possível publicar seu comentário no momento.');
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Theme.colors.primary} />
                    <Text style={styles.loadingText}>Carregando preferências...</Text>
                </View>
            );
        }

        if (hasConsent === false) {
            return (
                <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
                    <View style={[styles.header, { paddingTop: Math.max(insets.top, Theme.spacing.md) }]}>
                        <Text style={styles.headerTitle}>Fotos da Turma</Text>
                    </View>

                    <FlatList
                        data={[1]}
                        keyExtractor={(item) => item.toString()}
                        contentContainerStyle={styles.scrollContentConsent}
                        renderItem={() => (
                            <AppCard style={styles.consentCard}>
                                <View style={styles.shieldIconContainer}>
                                    <MaterialCommunityIcons name="shield-lock-outline" size={48} color={Theme.colors.primary} />
                                </View>

                                <Text style={styles.consentTitle}>Termo de Consentimento de Uso de Imagem</Text>
                                
                                <Text style={styles.consentSubtitle}>
                                    Em conformidade com a Lei Geral de Proteção de Dados (LGPD), precisamos da sua autorização expressa para exibir as fotos do dia a dia escolar do seu filho.
                                </Text>

                                <View style={styles.legalInfoBox}>
                                    <View style={styles.legalRow}>
                                        <MaterialCommunityIcons name="check-decagram" size={20} color="#059669" />
                                        <Text style={styles.legalText}>
                                            <Text style={{ fontWeight: 'bold' }}>Segurança Total:</Text> As imagens ficam restritas a este aplicativo seguro.
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.legalRow}>
                                        <MaterialCommunityIcons name="school" size={20} color="#059669" />
                                        <Text style={styles.legalText}>
                                            <Text style={{ fontWeight: 'bold' }}>Finalidade:</Text> Registros puramente didáticos, pedagógicos e de comemorações.
                                        </Text>
                                    </View>

                                    <View style={styles.legalRow}>
                                        <MaterialCommunityIcons name="cancel" size={20} color="#059669" />
                                        <Text style={styles.legalText}>
                                            <Text style={{ fontWeight: 'bold' }}>Sem Comercialização:</Text> Fotos nunca serão expostas ao público ou terceiros.
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.switchContainer}>
                                    <Switch
                                        value={termsAccepted}
                                        onValueChange={setTermsAccepted}
                                        trackColor={{ false: '#CBD5E1', true: Theme.colors.primary + '80' }}
                                        thumbColor={termsAccepted ? Theme.colors.primary : '#F1F5F9'}
                                    />
                                    <TouchableOpacity onPress={() => setTermsAccepted(!termsAccepted)} activeOpacity={0.8} style={{ flex: 1 }}>
                                        <Text style={styles.switchLabel}>
                                            Declaro que li e concordo com os termos descritos acima, autorizando a exibição das fotografias.
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={[styles.acceptButton, !termsAccepted && styles.disabledButton]}
                                    onPress={handleAcceptConsent}
                                    disabled={updating || !termsAccepted}
                                >
                                    {updating ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <MaterialCommunityIcons name="check-all" size={20} color="#FFFFFF" />
                                            <Text style={styles.acceptButtonText}>Autorizar e Acessar</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </AppCard>
                        )}
                    />
                </SafeAreaView>
            );
        }

        return (
            <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
                {/* Header Superior com Alternador de Visualização */}
                <View style={[styles.header, { paddingTop: Math.max(insets.top, Theme.spacing.md) }]}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>Fotos da Turma</Text>
                        <Text style={styles.headerSubtitle}>Bambolê Feed</Text>
                    </View>
                    
                    {/* Seletor Visual Grade/Feed */}
                    <View style={styles.viewSelector}>
                        <TouchableOpacity 
                            onPress={() => setViewMode('grid')} 
                            style={[styles.selectorButton, viewMode === 'grid' && styles.selectorActive]}
                        >
                            <MaterialCommunityIcons 
                                name="grid" 
                                size={20} 
                                color={viewMode === 'grid' ? Theme.colors.primary : Theme.colors.gray[400]} 
                            />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setViewMode('feed')} 
                            style={[styles.selectorButton, viewMode === 'feed' && styles.selectorActive]}
                        >
                            <MaterialCommunityIcons 
                                name="format-list-bulleted" 
                                size={20} 
                                color={viewMode === 'feed' ? Theme.colors.primary : Theme.colors.gray[400]} 
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Listagem de Fotos */}
                <FlatList
                    key={viewMode === 'grid' ? 'grid-view-key' : 'feed-view-key'}
                    data={photos}
                    numColumns={viewMode === 'grid' ? 3 : 1}
                    renderItem={viewMode === 'grid' ? renderGridItem : ({ item }) => <InstagramPostCard item={item} onToggleLike={toggleLike} onOpenComments={onOpenComments} />}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={viewMode === 'grid' ? styles.gridContent : styles.feedContent}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={loadPhotos} 
                            colors={[Theme.colors.primary]}
                            tintColor={Theme.colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="image-off-outline" size={48} color={Theme.colors.gray[300]} />
                            <Text style={styles.emptyText}>Nenhuma foto publicada até o momento.</Text>
                        </View>
                    }
                />

                {/* Modal de Comentários Premium */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={commentsModalVisible}
                    onRequestClose={() => setCommentsModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView 
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                            style={styles.modalContent}
                        >
                            {/* Drag Handle & Header */}
                            <View style={styles.modalHeader}>
                                <View style={styles.dragHandle} />
                                <View style={styles.modalHeaderTitleRow}>
                                    <Text style={styles.modalTitle}>Comentários</Text>
                                    <TouchableOpacity 
                                        style={styles.closeButton} 
                                        onPress={() => setCommentsModalVisible(false)}
                                    >
                                        <MaterialCommunityIcons name="close" size={22} color={Theme.colors.gray[500]} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Lista de Comentários */}
                            <FlatList
                                data={activeComments}
                                keyExtractor={(item, index) => item.id || index.toString()}
                                contentContainerStyle={styles.commentsListContent}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <View style={styles.commentItem}>
                                        <View style={styles.commentAvatarContainer}>
                                            <View style={styles.commentAvatarPlaceholder}>
                                                <Text style={styles.commentAvatarText}>
                                                    {item.userName ? item.userName.charAt(0).toUpperCase() : 'R'}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.commentBody}>
                                            <View style={styles.commentHeaderRow}>
                                                <Text style={styles.commentAuthor}>{item.userName}</Text>
                                                <Text style={styles.commentTime}>
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : ''}
                                                </Text>
                                            </View>
                                            <Text style={styles.commentText}>{item.text}</Text>
                                        </View>
                                    </View>
                                )}
                                ListEmptyComponent={
                                    <View style={styles.emptyCommentsContainer}>
                                        <MaterialCommunityIcons name="message-text-outline" size={40} color={Theme.colors.gray[300]} />
                                        <Text style={styles.emptyCommentsText}>Sem comentários ainda.</Text>
                                        <Text style={styles.emptyCommentsSubtext}>Inicie a conversa compartilhando uma mensagem carinhosa!</Text>
                                    </View>
                                }
                            />

                            {/* Input de Novo Comentário */}
                            <View style={styles.commentInputRow}>
                                <TextInput
                                    style={styles.commentInput}
                                    placeholder="Adicione um comentário..."
                                    placeholderTextColor={Theme.colors.gray[400]}
                                    value={newCommentText}
                                    onChangeText={setNewCommentText}
                                    multiline
                                    maxLength={250}
                                />
                                <TouchableOpacity 
                                    style={[
                                        styles.sendCommentButton,
                                        (!newCommentText.trim() || submittingComment) && styles.disabledSendCommentButton
                                    ]}
                                    onPress={handleSendComment}
                                    disabled={!newCommentText.trim() || submittingComment}
                                >
                                    {submittingComment ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </Modal>
            </SafeAreaView>
        );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.md,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        elevation: 2,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        ...Theme.typography.h3,
        fontSize: 18,
        fontWeight: '800',
        color: Theme.colors.onBackground,
    },
    headerSubtitle: {
        fontSize: 11,
        color: Theme.colors.primary,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 1,
    },
    viewSelector: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        padding: 2,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    selectorButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 18,
    },
    selectorActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    gridContent: {
        paddingTop: 1,
    },
    feedContent: {
        paddingBottom: 24,
        backgroundColor: '#FAFAFA',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        gap: Theme.spacing.md,
    },
    loadingText: {
        fontSize: 14,
        color: Theme.colors.gray[500],
        fontWeight: '500',
    },
    // Grid Item Details
    gridHeartIcon: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    gridHeartText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '700',
    },
    // Instagram Style Feed Card Styles
    feedCard: {
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ECEFF1',
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: Theme.spacing.sm,
    },
    monitorAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    postHeaderInfo: {
        flex: 1,
    },
    monitorName: {
        fontSize: 14,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    postSubinfo: {
        fontSize: 11,
        color: Theme.colors.gray[500],
        marginTop: 1,
    },
    moreButton: {
        padding: 4,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1, // Quadradinho clássico Instagram
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    feedImage: {
        width: '100%',
        height: '100%',
    },
    heartOverlay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: Theme.spacing.xs,
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Theme.spacing.md,
    },
    actionIcon: {
        padding: 4,
    },
    postDetails: {
        paddingHorizontal: Theme.spacing.md,
        paddingBottom: Theme.spacing.md,
    },
    likesText: {
        fontSize: 13,
        fontWeight: '700',
        color: Theme.colors.onBackground,
        marginBottom: 3,
    },
    captionText: {
        fontSize: 13,
        color: Theme.colors.onBackground,
        lineHeight: 18,
    },
    captionAuthor: {
        fontWeight: '700',
    },
    postTime: {
        fontSize: 10,
        color: Theme.colors.gray[400],
        textTransform: 'uppercase',
        marginTop: 6,
        fontWeight: '500',
    },
    // Empty View Styles
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 120,
        paddingHorizontal: Theme.spacing.xl,
        gap: Theme.spacing.md,
    },
    emptyText: {
        fontSize: 14,
        color: Theme.colors.gray[400],
        textAlign: 'center',
        fontWeight: '500',
    },
    // Consent Card Styles
    scrollContentConsent: {
        paddingHorizontal: Theme.spacing.lg,
        paddingTop: Theme.spacing.md,
        paddingBottom: Theme.spacing.xl,
    },
    consentCard: {
        padding: Theme.spacing.xl,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 6,
    },
    shieldIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Theme.colors.primary + '12',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.lg,
    },
    consentTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Theme.colors.onSurface,
        textAlign: 'center',
        marginBottom: Theme.spacing.md,
        lineHeight: 26,
    },
    consentSubtitle: {
        fontSize: 14,
        color: Theme.colors.gray[600],
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Theme.spacing.xl,
    },
    legalInfoBox: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: Theme.spacing.lg,
        gap: 16,
        marginBottom: Theme.spacing.xl,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    legalRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    legalText: {
        flex: 1,
        fontSize: 13,
        color: Theme.colors.gray[700],
        lineHeight: 18,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: Theme.spacing.xl,
        paddingHorizontal: 4,
    },
    switchLabel: {
        fontSize: 13,
        color: Theme.colors.gray[500],
        lineHeight: 18,
        fontWeight: '500',
    },
    acceptButton: {
        width: '100%',
        height: 52,
        backgroundColor: Theme.colors.primary,
        borderRadius: Theme.borderRadius.md,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: Theme.colors.gray[300],
        shadowOpacity: 0,
        elevation: 0,
    },
    acceptButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    syncBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    syncBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },
    gridSyncBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    viewCommentsButton: {
        marginTop: 6,
        paddingVertical: 2,
    },
    viewCommentsText: {
        fontSize: 13,
        color: Theme.colors.gray[500],
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '75%',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 10,
    },
    modalHeader: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    dragHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E2E8F0',
        marginBottom: 12,
    },
    modalHeaderTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: Theme.spacing.lg,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Theme.colors.onBackground,
    },
    closeButton: {
        padding: 4,
    },
    commentsListContent: {
        paddingHorizontal: Theme.spacing.lg,
        paddingTop: Theme.spacing.md,
        paddingBottom: Theme.spacing.xl,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 18,
        gap: 12,
    },
    commentAvatarContainer: {
        justifyContent: 'flex-start',
    },
    commentAvatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Theme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.primary + '20',
    },
    commentAvatarText: {
        fontSize: 12,
        fontWeight: '800',
        color: Theme.colors.primary,
    },
    commentBody: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    commentHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentAuthor: {
        fontSize: 13,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    commentTime: {
        fontSize: 10,
        color: Theme.colors.gray[400],
        fontWeight: '500',
    },
    commentText: {
        fontSize: 13,
        color: Theme.colors.gray[700],
        lineHeight: 18,
    },
    emptyCommentsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: Theme.spacing.xl,
        gap: 10,
    },
    emptyCommentsText: {
        fontSize: 15,
        fontWeight: '700',
        color: Theme.colors.gray[500],
    },
    emptyCommentsSubtext: {
        fontSize: 12,
        color: Theme.colors.gray[400],
        textAlign: 'center',
        lineHeight: 16,
    },
    commentInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingTop: Theme.spacing.sm,
        paddingBottom: Platform.OS === 'ios' ? Theme.spacing.xl : Theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
        gap: 12,
    },
    commentInput: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 13,
        color: Theme.colors.onBackground,
        maxHeight: 80,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    sendCommentButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    disabledSendCommentButton: {
        backgroundColor: Theme.colors.gray[300],
        shadowOpacity: 0,
        elevation: 0,
    },
});
