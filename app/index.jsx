import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getBooks, toggleFavorite, deleteBook } from '../utils/storage';

export default function HomeScreen() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBooks = async () => {
    setLoading(true);
    const loadedBooks = await getBooks();
    setBooks(loadedBooks);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [])
  );

  const filteredBooks = books.filter(book => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showOnlyFavorites || book.favorite;
    return matchesSearch && matchesFavorite;
  });

  const handleFavoriteToggle = async (bookId) => {
    const updatedBook = await toggleFavorite(bookId);
    if (updatedBook) {
      const updatedBooks = books.map(b =>
        b.id === bookId ? updatedBook : b
      );
      setBooks(updatedBooks);
    }
  };

  const handleDeleteBook = (bookId, bookTitle) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${bookTitle}"?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            const success = await deleteBook(bookId);
            if (success) {
              const updatedBooks = books.filter(b => b.id !== bookId);
              setBooks(updatedBooks);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleSelectBook = (book) => {
    router.push({
      pathname: '/BookDetails',
      params: { bookData: JSON.stringify(book) },
    });
  };

  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelectBook(item)}
      style={{
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        alignItems: 'center',
      }}
    >
      {item.cover_url && (
        <Image
          source={{ uri: item.cover_url }}
          style={{
            width: 60,
            height: 90,
            marginRight: 12,
            borderRadius: 4,
            backgroundColor: '#f0f0f0',
          }}
          resizeMode="cover"
        />
      )}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 4,
          }}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>
          {item.author}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#999' }}>
            {item.first_publish_year || item.releaseDate || 'Unknown'}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color:
                item.completed
                  ? '#4CAF50'
                  : item.currentPage && item.currentPage > 0
                  ? '#FF9800'
                  : '#999',
            }}
          >
            {item.completed
              ? 'Completed'
              : item.currentPage && item.currentPage > 0
              ? 'In Progress'
              : 'Not Started'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={{ padding: 8 }}
        onPress={() => handleFavoriteToggle(item.id)}
      >
        <MaterialIcons
          name={item.favorite ? 'star' : 'star-outline'}
          size={24}
          color={item.favorite ? '#FFD700' : '#999'}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={{ padding: 8 }}
        onPress={() => handleDeleteBook(item.id, item.title)}
      >
        <MaterialIcons name="delete" size={24} color="#ff6b6b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>
            My Books
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/AddBook')}
            style={{
              backgroundColor: '#007AFF',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
            }}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Search by title or author..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: '#e0e0e0',
          }}
        />

        <TouchableOpacity
          onPress={() => setShowOnlyFavorites(!showOnlyFavorites)}
          style={{
            backgroundColor: showOnlyFavorites ? '#FFD700' : '#fff',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#e0e0e0',
          }}
        >
          <MaterialIcons
            name="star"
            size={18}
            color={showOnlyFavorites ? '#333' : '#999'}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              fontWeight: showOnlyFavorites ? 'bold' : 'normal',
              color: showOnlyFavorites ? '#333' : '#666',
            }}
          >
            Favorites Only
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, color: '#666' }}>Loading books...</Text>
        </View>
      ) : filteredBooks.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <MaterialIcons
            name="library-books"
            size={64}
            color="#ccc"
            style={{ marginBottom: 16 }}
          />
          <Text
            style={{
              fontSize: 18,
              color: '#666',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            {books.length === 0
              ? 'No books yet. Add one to get started!'
              : 'No books match your search.'}
          </Text>
          {books.length === 0 && (
            <TouchableOpacity
              onPress={() => router.push('/AddBook')}
              style={{
                backgroundColor: '#007AFF',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                Add Your First Book
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={item => item.id.toString()}
          onEndReachedThreshold={0.1}
        />
      )}
    </SafeAreaView>
  );
}
