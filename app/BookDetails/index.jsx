import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { toggleFavorite, deleteBook, updateCurrentPage, toggleCompleted } from '../../utils/storage';

export default function BookDetailsScreen() {
    const route = useRoute();
    const router = useRouter();
    const [book, setBook] = useState(null);
    const [isEditingPage, setIsEditingPage] = useState(false);
    const [pageInput, setPageInput] = useState('0');

    useFocusEffect(
        useCallback(() => {
            if (route.params?.bookData) {
                const parsedBook = JSON.parse(route.params.bookData);
                setBook(parsedBook);
                setPageInput(parsedBook.currentPage?.toString() || '0');
            }
        }, [route.params?.bookData])
    );

    if (!book) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Text>Loading book details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleFavoriteToggle = async () => {
        const updatedBook = await toggleFavorite(book.id);
        if (updatedBook) {
            setBook(updatedBook);
        }
    };

    const handleSaveCurrentPage = async () => {
        const updatedBook = await updateCurrentPage(book.id, pageInput);
        if (updatedBook) {
            setBook(updatedBook);
            setIsEditingPage(false);
        }
    };

    const handleCancelEditPage = () => {
        setPageInput(book.currentPage?.toString() || '0');
        setIsEditingPage(false);
    };

    const handleToggleCompleted = async () => {
        const updatedBook = await toggleCompleted(book.id);
        if (updatedBook) {
            setBook(updatedBook);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Book',
            `Are you sure you want to delete "${book.title}"?`,
            [
                {
                    text: 'Cancel',
                    onPress: () => { },
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        const success = await deleteBook(book.id);
                        if (success) {
                            router.back();
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#e0e0e0',
                }}
            >
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
                    <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Book Details</Text>
                <View style={{ width: 40 }} />
            </View>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={{ alignItems: 'center', marginBottom: 24 }}>
                        {book.cover_url && (
                            <Image
                                source={{ uri: book.cover_url }}
                                style={{
                                    width: 150,
                                    height: 220,
                                    borderRadius: 8,
                                    backgroundColor: '#f0f0f0',
                                }}
                                resizeMode="cover"
                            />
                        )}
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            gap: 16,
                            justifyContent: 'center',
                            marginBottom: 18,
                        }}
                    >
                        <TouchableOpacity
                            onPress={handleToggleCompleted}
                            style={{
                                backgroundColor: book.completed ? '#4CAF50' : '#d0d0d0',
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <MaterialIcons name="check-circle" size={24} color="#fff" />
                            <Text style={{ fontWeight: 'bold', color: '#fff' }}>
                                {book.completed ? 'Completed' : 'Mark Complete'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>
                            {book.title}
                        </Text>
                        <Text style={{ fontSize: 16, color: '#333', marginBottom: 4 }}>
                            By {book.author}
                        </Text>
                        <Text style={{ fontSize: 14, color: '#333' }}>
                            Published: {book.first_publish_year || book.releaseDate || 'Unknown'}
                        </Text>

                        {isEditingPage ? (
                            <View style={{ marginTop: 12, gap: 8 }}>
                                <Text style={{ fontSize: 14, color: '#333' }}>
                                    Current Page
                                </Text>
                                <TextInput
                                    value={pageInput}
                                    onChangeText={setPageInput}
                                    keyboardType="number-pad"
                                    placeholder="Enter page number"
                                    style={{
                                        borderWidth: 1,
                                        borderColor: '#007AFF',
                                        borderRadius: 6,
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        fontSize: 14,
                                        marginBottom: 8,
                                    }}
                                />
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    <TouchableOpacity
                                        onPress={handleSaveCurrentPage}
                                        style={{
                                            flex: 1,
                                            backgroundColor: '#007AFF',
                                            paddingVertical: 8,
                                            borderRadius: 6,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleCancelEditPage}
                                        style={{
                                            flex: 1,
                                            backgroundColor: '#ccc',
                                            paddingVertical: 8,
                                            borderRadius: 6,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text style={{ color: '#333', fontWeight: 'bold' }}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>
                                        Current Page
                                    </Text>
                                    <Text style={{ fontSize: 16, color: '#666', marginTop: 4 }}>
                                        {book.currentPage || 0}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setIsEditingPage(true)}
                                    style={{ padding: 8 }}
                                >
                                    <MaterialIcons name="edit" size={20} color="#007AFF" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {book.description && (
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 }}>
                                Description
                            </Text>
                            <Text style={{ fontSize: 14, color: '#555', lineHeight: 22 }}>
                                {book.description}
                            </Text>
                        </View>
                    )}

                    <View
                        style={{
                            flexDirection: 'row',
                            gap: 16,
                            justifyContent: 'center',
                        }}
                    >
                        <TouchableOpacity
                            onPress={handleFavoriteToggle}
                            style={{
                                backgroundColor: book.favorite ? '#FFD700' : '#f0f0f0',
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <MaterialIcons
                                name={book.favorite ? 'star' : 'star-outline'}
                                size={24}
                                color={book.favorite ? '#333' : '#999'}
                            />
                            <Text
                                style={{
                                    fontWeight: 'bold',
                                    color: book.favorite ? '#333' : '#666',
                                }}
                            >
                                {book.favorite ? 'Favorited' : 'Favorite'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleDelete}
                            style={{
                                backgroundColor: '#ff6b6b',
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <MaterialIcons name="delete" size={24} color="#fff" />
                            <Text style={{ fontWeight: 'bold', color: '#fff' }}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
