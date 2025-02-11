// RecipeSearchScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RecipeSearchScreen = ({ navigation, language = 'en', isAuthenticated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [ingredientsData, setIngredientsData] = useState({});
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadRecipes();
    loadIngredients();
    loadFavorites();
  }, []);

  const loadRecipes = async () => {
    try {
      const storedRecipes = await AsyncStorage.getItem('recipes');
      console.log('Stored Recipes JSON:', storedRecipes);
  
      if (!storedRecipes) {
        console.log('No recipes found in AsyncStorage. Loading from local JSON.');
        
        // Αν δεν υπάρχουν αποθηκευμένες συνταγές, φόρτωσε από το τοπικό JSON
        const localRecipes = require('../../assets/data/recipes.json');
        
        await AsyncStorage.setItem('recipes', JSON.stringify(localRecipes));
        setRecipes(localRecipes.recipes);
        
        console.log('Loaded Recipes from local JSON:', localRecipes);
      } else {
        setRecipes(JSON.parse(storedRecipes)?.recipes || []);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };
  
  const loadIngredients = async () => {
    try {
      const storedIngredients = await AsyncStorage.getItem('ingredients');
      console.log('Stored Ingredients JSON:', storedIngredients);
      const parsedIngredients = JSON.parse(storedIngredients)?.ingredients || [];
      
      const ingredientMap = parsedIngredients.reduce((acc, ingredient) => {
        acc[ingredient.id] = ingredient.translations;
        return acc;
      }, {});
      
      setIngredientsData(ingredientMap);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      setFavorites(JSON.parse(storedFavorites) || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (recipe) => {
    const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigation.navigate('LoginScreen');
      return;
    }
    

    const updatedFavorites = favorites.some((fav) => fav.id === recipe.id)
      ? favorites.filter((fav) => fav.id !== recipe.id)
      : [...favorites, recipe];

    setFavorites(updatedFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = recipes.filter((recipe) =>
        Object.values(recipe.name).some((name) => name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        recipe.ingredients.some((ingredient) =>
          Object.values(ingredientsData[ingredient.id] || {}).some((ingredientName) =>
            ingredientName.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      );
      console.log('Filtered Recipes:', filtered);
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes([]);
    }
  }, [searchQuery, recipes, language, ingredientsData]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Recipes</Text>

      <TextInput
        style={styles.input}
        placeholder="Type to search recipes..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredRecipes.length > 0 ? (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('RecipeDetails', { recipe: item })}
              style={styles.recipeItem}
            >
              <Text style={styles.recipeTitle}>{item.name[language] || item.name['en']}</Text>
              <TouchableOpacity
                onPress={() => toggleFavorite(item)}
                style={styles.favoriteButton}
              >
                <Text style={styles.favoriteText}>
                  {favorites.some((fav) => fav.id === item.id) ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      ) : searchQuery.trim().length > 0 ? (
        <Text style={styles.noResults}>No matching recipes found.</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  recipeItem: {
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  favoriteButton: {
    padding: 5,
  },
  favoriteText: {
    fontSize: 24,
    color: 'gold',
  },
  noResults: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default RecipeSearchScreen;

