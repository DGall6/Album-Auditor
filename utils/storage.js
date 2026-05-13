import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKS_KEY = 'books_list';

export const getBooks = async () => {
  try {
    const books = await AsyncStorage.getItem(BOOKS_KEY);
    return books ? JSON.parse(books) : [];
  } catch (error) {
    console.error('Error getting books:', error);
    return [];
  }
};

export const saveBooks = async (books) => {
  try {
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    return true;
  } catch (error) {
    console.error('Error saving books:', error);
    return false;
  }
};

export const addBook = async (book) => {
  try {
    const books = await getBooks();
    const newBook = {
      id: Date.now(),
      ...book,
      favorite: false,
      currentPage: 0,
      completed: false,
    };
    books.push(newBook);
    await saveBooks(books);
    return newBook;
  } catch (error) {
    console.error('Error adding book:', error);
    return null;
  }
};

export const deleteBook = async (bookId) => {
  try {
    const books = await getBooks();
    const filteredBooks = books.filter(book => book.id !== bookId);
    await saveBooks(filteredBooks);
    return true;
  } catch (error) {
    console.error('Error deleting book:', error);
    return false;
  }
};

export const toggleFavorite = async (bookId) => {
  try {
    const books = await getBooks();
    const bookIndex = books.findIndex(book => book.id === bookId);
    if (bookIndex !== -1) {
      books[bookIndex].favorite = !books[bookIndex].favorite;
      await saveBooks(books);
      return books[bookIndex];
    }
    return null;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return null;
  }
};

export const updateCurrentPage = async (bookId, pageNumber) => {
  try {
    const books = await getBooks();
    const bookIndex = books.findIndex(book => book.id === bookId);
    if (bookIndex !== -1) {
      books[bookIndex].currentPage = parseInt(pageNumber, 10);
      await saveBooks(books);
      return books[bookIndex];
    }
    return null;
  } catch (error) {
    console.error('Error updating current page:', error);
    return null;
  }
};

export const toggleCompleted = async (bookId) => {
  try {
    const books = await getBooks();
    const bookIndex = books.findIndex(book => book.id === bookId);
    if (bookIndex !== -1) {
      books[bookIndex].completed = !books[bookIndex].completed;
      await saveBooks(books);
      return books[bookIndex];
    }
    return null;
  } catch (error) {
    console.error('Error toggling completed:', error);
    return null;
  }
};
