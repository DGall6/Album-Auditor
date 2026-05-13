import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { addBook } from '../../utils/storage';

export default function AddBookScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchBooks = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Please enter a book title to search');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          searchQuery
        )}&limit=20`
      );
      const data = await response.json();

      const formattedBooks = data.docs.map((doc) => ({
        key: doc.key,
        title: doc.title,
        author: doc.author_name ? doc.author_name[0] : 'Unknown Author',
        first_publish_year: doc.first_publish_year,
        cover_url: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : null,
        description: doc.description
          ? typeof doc.description === 'string'
            ? doc.description
            : doc.description.value || null
          : null,
      }));

      setSearchResults(formattedBooks);
    } catch (error) {
      console.error('Error searching books:', error);
      Alert.alert('Error', 'Failed to search books. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (bookData) => {
    try {
      const newBook = await addBook(bookData);
      if (newBook) {
        Alert.alert(
          'Success',
          `"${bookData.title}" has been added to your library!`,
          [
            {
              text: 'OK',
              onPress: () => {
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to add book. Please try again.');
      }
    } catch (error) {
      console.error('Error adding book:', error);
      Alert.alert('Error', 'Failed to add book. Please try again.');
    }
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1 }}>
        {item.cover_url && (
          <Image
            source={{ uri: item.cover_url }}
            style={{
              width: 45,
              height: 68,
              borderRadius: 4,
              backgroundColor: '#f0f0f0',
              position: 'absolute',
              left: 0,
              top: 0,
            }}
            resizeMode="cover"
          />
        )}
        <View style={{ marginLeft: item.cover_url ? 72 : 0 }}>
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
          <Text style={{ fontSize: 12, color: '#999' }}>
            {item.first_publish_year || 'Unknown'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleAddBook(item)}
        style={{
          backgroundColor: '#007AFF',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 6,
          marginLeft: 12,
        }}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 }}>
          Search for a Book
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <TextInput
            placeholder="Enter book title..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchBooks}
            editable={!loading}
            style={{
              flex: 1,
              backgroundColor: '#fff',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: '#e0e0e0',
              fontSize: 14,
            }}
          />
          <TouchableOpacity
            onPress={searchBooks}
            disabled={loading}
            style={{
              backgroundColor: '#007AFF',
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 8,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="search" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 12, color: '#666' }}>Searching books...</Text>
        </View>
      ) : searched && searchResults.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <MaterialIcons
            name="search-off"
            size={64}
            color="#ccc"
            style={{ marginBottom: 16 }}
          />
          <Text
            style={{
              fontSize: 18,
              color: '#666',
              textAlign: 'center',
            }}
          >
            No books found for "{searchQuery}"
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#999',
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            Try a different search term
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item, index) => item.key + index}
          onEndReachedThreshold={0.1}
        />
      )}
     </SafeAreaView>
  );
}
