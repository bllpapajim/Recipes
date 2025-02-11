import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Button,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RecipesScreen = ({ navigation, language = 'en' }) => {
  const [favorites, setFavorites] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [recipeCountry, setRecipeCountry] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [recipeDifficulty, setRecipeDifficulty] = useState('easy');
  const [recipePreparationTime, setRecipePreparationTime] = useState('');
  const [recipeCookingTime, setRecipeCookingTime] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [ingredientsData, setIngredientsData] = useState([]);

  // Φόρτωση αγαπημένων, τοπικών συνταγών και υλικών κατά την πρώτη φόρτωση
  useEffect(() => {
    loadFavorites();
    loadUserRecipes();
    loadIngredients();
  }, []);

  // Φόρτωση αγαπημένων συνταγών
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      setFavorites(JSON.parse(storedFavorites) || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Φόρτωση τοπικών συνταγών
  const loadUserRecipes = async () => {
    try {
      const storedUserRecipes = await AsyncStorage.getItem('userRecipes');
      setUserRecipes(JSON.parse(storedUserRecipes) || []);
    } catch (error) {
      console.error('Error loading user recipes:', error);
    }
  };

  // Φόρτωση υλικών από το JSON
  const loadIngredients = async () => {
    try {
      const storedIngredients = await AsyncStorage.getItem('ingredients');
      if (!storedIngredients) {
        const localIngredients = require('../../assets/data/ingredients.json');
        await AsyncStorage.setItem('ingredients', JSON.stringify(localIngredients));
        setIngredientsData(localIngredients.ingredients);
      } else {
        setIngredientsData(JSON.parse(storedIngredients).ingredients);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  // Αποθήκευση μιας νέας συνταγής
  const saveUserRecipe = async () => {
    if (
      recipeName.trim() === '' ||
      recipeCountry.trim() === '' ||
      recipeDescription.trim() === '' ||
      selectedIngredients.length === 0
    ) {
      alert('Please fill all fields and select at least one ingredient.');
      return;
    }

    const newRecipe = {
      id: Date.now().toString(), // Χρήση timestamp ως μοναδικό ID
      name: { en: recipeName }, // Προσθήκη γλώσσας
      country: { en: recipeCountry },
      description: { en: recipeDescription },
      difficulty: recipeDifficulty,
      time: {
        preparation: recipePreparationTime,
        cooking: recipeCookingTime,
      },
      ingredients: selectedIngredients.map(ing => ({
        id: ing.id,
        quantity: ing.quantity || '1', // Προσθήκη ποσότητας
      })),
      isUserRecipe: true, // Προσθήκη flag για τοπικές συνταγές
    };

    const updatedUserRecipes = [...userRecipes, newRecipe];
    setUserRecipes(updatedUserRecipes);
    await AsyncStorage.setItem('userRecipes', JSON.stringify(updatedUserRecipes));

    // Εκκαθάριση των πεδίων και κλείσιμο του modal
    setRecipeName('');
    setRecipeCountry('');
    setRecipeDescription('');
    setRecipeDifficulty('easy');
    setRecipePreparationTime('');
    setRecipeCookingTime('');
    setSelectedIngredients([]);
    setIsModalVisible(false);
  };

  // Διαγραφή μιας τοπικής συνταγής
  const deleteUserRecipe = async (recipeId) => {
    const updatedUserRecipes = userRecipes.filter(recipe => recipe.id !== recipeId);
    setUserRecipes(updatedUserRecipes);
    await AsyncStorage.setItem('userRecipes', JSON.stringify(updatedUserRecipes));
  };

  // Προσθήκη/αφαίρεση υλικού από την επιλογή
  const toggleIngredient = (ingredient) => {
    if (selectedIngredients.some((item) => item.id === ingredient.id)) {
      setSelectedIngredients(selectedIngredients.filter((item) => item.id !== ingredient.id));
    } else {
      setSelectedIngredients([...selectedIngredients, { ...ingredient, quantity: '1' }]);
    }
  };

  // Ενημέρωση ποσότητας για ένα υλικό
  const updateIngredientQuantity = (ingredientId, quantity) => {
    const updatedIngredients = selectedIngredients.map(ing =>
      ing.id === ingredientId ? { ...ing, quantity } : ing
    );
    setSelectedIngredients(updatedIngredients);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Recipes</Text>

      {/* Κουμπί για προσθήκη νέας συνταγής */}
      <Button title="Add New Recipe" onPress={() => setIsModalVisible(true)} />

      {/* Modal για προσθήκη νέας συνταγής */}
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Recipe</Text>

          <TextInput
            style={styles.input}
            placeholder="Recipe Name"
            value={recipeName}
            onChangeText={setRecipeName}
          />

          <TextInput
            style={styles.input}
            placeholder="Country"
            value={recipeCountry}
            onChangeText={setRecipeCountry}
          />

          <TextInput
            style={styles.input}
            placeholder="Description"
            value={recipeDescription}
            onChangeText={setRecipeDescription}
          />

          <Text style={styles.label}>Difficulty:</Text>
          <Picker
            selectedValue={recipeDifficulty}
            style={styles.picker}
            onValueChange={(itemValue) => setRecipeDifficulty(itemValue)}
          >
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>

          <TextInput
            style={styles.input}
            placeholder="Preparation Time (e.g., 15 min)"
            value={recipePreparationTime}
            onChangeText={setRecipePreparationTime}
          />

          <TextInput
            style={styles.input}
            placeholder="Cooking Time (e.g., 30 min)"
            value={recipeCookingTime}
            onChangeText={setRecipeCookingTime}
          />

          <Text style={styles.label}>Select Ingredients:</Text>
          <FlatList
            data={ingredientsData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.ingredientItem}>
                <TouchableOpacity
                  onPress={() => toggleIngredient(item)}
                  style={[
                    styles.ingredientButton,
                    selectedIngredients.some((ing) => ing.id === item.id) && styles.selectedIngredientButton,
                  ]}
                >
                  <Text>{item.translations[language] || item.translations['en']}</Text>
                </TouchableOpacity>
                {selectedIngredients.some((ing) => ing.id === item.id) && (
                  <TextInput
                    style={styles.quantityInput}
                    placeholder="Quantity"
                    value={selectedIngredients.find((ing) => ing.id === item.id)?.quantity || '1'}
                    onChangeText={(text) => updateIngredientQuantity(item.id, text)}
                  />
                )}
              </View>
            )}
          />

          <Button title="Save Recipe" onPress={saveUserRecipe} />
          <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
        </View>
      </Modal>

      {/* Εμφάνιση αγαπημένων συνταγών */}
      <Text style={styles.subtitle}>Favorite Recipes</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.recipeItem}
            onPress={() => navigation.navigate('RecipeDetails', { recipe: item })}
          >
            <Text>{item.name[language] || item.name['en']}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Εμφάνιση τοπικών συνταγών */}
      <Text style={styles.subtitle}>My Recipes</Text>
      <FlatList
        data={userRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.recipeItem}>
            <TouchableOpacity
              onPress={() => navigation.navigate('RecipeDetails', { recipe: item })}
            >
              <Text>{item.name.en}</Text>
              <Text>{item.description.en}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteUserRecipe(item.id)}>
              <Icon name="trash" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  recipeItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ingredientButton: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    flex: 1,
  },
  selectedIngredientButton: {
    backgroundColor: '#e3f2fd',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    marginLeft: 10,
    width: 80,
  },
});

export default RecipesScreen;