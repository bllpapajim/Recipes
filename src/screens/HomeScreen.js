import React, { useState, useContext } from 'react';
import { View, Text, Button, Alert, StyleSheet, FlatList } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { AuthContext } from './AuthContext';


const RECIPES_URL = 'https://automation.ebit.gr/wp-content/uploads/2025/01/recipes.json';
const INGREDIENTS_URL = 'https://automation.ebit.gr/wp-content/uploads/2025/01/ingredients.json';
const COUNTRIES_URL = 'https://automation.ebit.gr/wp-content/uploads/2025/01/countries.json';

const HomeScreen = ({ navigation }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [isUpdating, setIsUpdating] = useState(false);

  const downloadJsonFiles = async () => {
    try {
      setIsUpdating(true);

      // Ορισμός διαδρομών αποθήκευσης
      const recipesUri = FileSystem.documentDirectory + 'recipes.json';
      const ingredientsUri = FileSystem.documentDirectory + 'ingredients.json';
      const countriesUri = FileSystem.documentDirectory + 'countries.json';

      // Κατέβασμα αρχείων JSON
      await FileSystem.downloadAsync(RECIPES_URL, recipesUri);
      await FileSystem.downloadAsync(INGREDIENTS_URL, ingredientsUri);
      await FileSystem.downloadAsync(COUNTRIES_URL, countriesUri);

      Alert.alert('Success', 'Files updated successfully!');
    } catch (error) {
      console.error('Error updating data:', error);
      Alert.alert('Error', 'Failed to update data.');
    } finally {
      setIsUpdating(false);
    }
  };

  return ( 
    <View style={styles.container}>
    <Text style={styles.title}>Welcome to HomeScreen</Text>
    {isAuthenticated ? (
      <Text>You are logged in!</Text>
    ) : (
      <Text>You are not logged in. Please sign in.</Text>
    )}
      <Button
        title="View Favorites"
        onPress={() => isAuthenticated ? navigation.navigate('FavoritesScreen') : navigation.navigate('LoginScreen')}
      />
      <Text style={styles.title}>Update Data</Text>
      <Button title="Download & Update" onPress={downloadJsonFiles} disabled={isUpdating} />
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default HomeScreen;
