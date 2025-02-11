// RecipeDetails.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RecipeDetails = ({ route }) => {
  const { recipe, language = 'en' } = route.params;
  const [ingredientsData, setIngredientsData] = useState({});

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const storedIngredients = await AsyncStorage.getItem('ingredients');
      const parsedIngredients = JSON.parse(storedIngredients)?.ingredients || [];
      
      const ingredientMap = parsedIngredients.reduce((acc, ingredient) => {
        acc[ingredient.id] = {
          name: ingredient.translations,
          unit: ingredient.unit,
        };
        return acc;
      }, {});

      setIngredientsData(ingredientMap);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{recipe.name?.[language] || recipe.name?.['en'] || 'Unnamed Recipe'}</Text>

      {recipe.servings && <Text style={styles.info}>Servings: {recipe.servings}</Text>}
      {recipe.difficulty && <Text style={styles.info}>Difficulty: {recipe.difficulty}</Text>}

      {recipe.ingredients && (
        <View>
          <Text style={styles.subtitle}>Ingredients:</Text>
          <FlatList
            data={recipe.ingredients}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              const ingredientName = capitalizeFirstLetter(
                ingredientsData[item.id]?.name?.[language] || ingredientsData[item.id]?.name?.['en'] || 'Unknown Ingredient'
              );
              const unit = ingredientsData[item.id]?.unit || '';
              return (
                <Text style={styles.ingredient}>{item.quantity} {unit} - {ingredientName}</Text>
              );
            }}
          />
        </View>
      )}

      {recipe.instructions && (
        <View>
          <Text style={styles.subtitle}>Instructions:</Text>
          <FlatList
            data={Array.isArray(recipe.instructions[language]) ? recipe.instructions[language] : [recipe.instructions[language]]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.step}>- {item}</Text>
            )}
          />
        </View>
      )}
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
  info: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  ingredient: {
    fontSize: 16,
    marginBottom: 5,
  },
  step: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
});

export default RecipeDetails;
