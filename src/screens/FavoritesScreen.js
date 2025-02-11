import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const saveRecipes = async (recipesData) => {
    try {
      await AsyncStorage.setItem('recipes', JSON.stringify(recipesData));
      console.log("Recipes saved locally.");
    } catch (error) {
      console.error("Error saving recipes to storage", error);
    }
  };

  
  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favorites');
      const parsedFavorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    //   console.log("Loaded favorites:", parsedFavorites);
      setFavorites(parsedFavorites);
    } catch (error) {
      console.error("Error loading favorites", error);
    }
  };
  
  const loadRecipes = async () => {
    try {
      const storedRecipes = await AsyncStorage.getItem('recipes');
      const parsedRecipes = storedRecipes ? JSON.parse(storedRecipes) : [];
      console.log("Loaded recipes from storage:", parsedRecipes);
      setRecipes(parsedRecipes);
    } catch (error) {
      console.error("Error loading recipes from storage", error);
      setRecipes([]);
    }
  };
    
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite Recipes</Text>
      {recipes.length > 0 ? (
        <FlatList
          data={recipes.filter(recipe => favorites.includes(recipe.id))}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.recipeItem}>
              <Text>{item.name}</Text>
            </View>
          )}
        />
      ) : (
        <Text>No recipes found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recipeItem: {
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default FavoritesScreen;
