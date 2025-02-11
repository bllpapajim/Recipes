import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IngredientsScreen = ({ navigation, language = 'en', isAuthenticated }) => {
  const [input, setInput] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [suggestedIngredients, setSuggestedIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [ingredientsData, setIngredientsData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [storedIngredientsData, setStoredIngredientsData] = useState(null);
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  useEffect(() => {
    loadData();
    loadFavorites();
    loadSelectedIngredients();
  }, [language]);

  const loadData = async () => {
    try {
      let storedIngredients = await AsyncStorage.getItem('ingredients');
      let storedRecipes = await AsyncStorage.getItem('recipes');
      let storedFavorites = await AsyncStorage.getItem('favorites');

      if (!storedFavorites) {
        storedFavorites = '[]';
      }
      setFavorites(JSON.parse(storedFavorites));

      if (!storedIngredients || !storedRecipes) {
        console.log('No data found in AsyncStorage. Loading from local JSON.');
        const localIngredients = require('../../assets/data/ingredients.json');
        const localRecipes = require('../../assets/data/recipes.json');
        await AsyncStorage.setItem('ingredients', JSON.stringify(localIngredients));
        await AsyncStorage.setItem('recipes', JSON.stringify(localRecipes));
        storedIngredients = JSON.stringify(localIngredients);
        storedRecipes = JSON.stringify(localRecipes);
      }

      console.log('Stored Ingredients JSON:', storedIngredients);
      console.log('Stored Recipes JSON:', storedRecipes);

      setStoredIngredientsData(storedIngredients);
      setIngredientsData(JSON.parse(storedIngredients)?.ingredients || []);
      setRecipes(JSON.parse(storedRecipes)?.recipes || []);

      // Extract unique tags, difficulties, and countries from recipes for filters
      const allTags = JSON.parse(storedRecipes)?.recipes.flatMap((recipe) => recipe.tags) || [];
      const uniqueTags = [...new Set(allTags)];

      const allDifficulties = JSON.parse(storedRecipes)?.recipes.map((recipe) => recipe.difficulty) || [];
      const uniqueDifficulties = [...new Set(allDifficulties)];

      const allCountries = JSON.parse(storedRecipes)?.recipes.map((recipe) => recipe.country?.en) || [];
      const uniqueCountries = [...new Set(allCountries)];

      // Οργάνωση των φίλτρων σε κατηγορίες
      setFilters({
        tags: uniqueTags,
        difficulties: uniqueDifficulties,
        countries: uniqueCountries,
      });
    } catch (error) {
      console.error('Error loading data:', error);
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

  const loadSelectedIngredients = async () => {
    try {
      const storedSelectedIngredients = await AsyncStorage.getItem('selectedIngredients');
      if (storedSelectedIngredients) {
        setSelectedIngredients(JSON.parse(storedSelectedIngredients));
      }
    } catch (error) {
      console.error('Error loading selected ingredients:', error);
    }
  };

  const saveSelectedIngredients = async (ingredients) => {
    try {
      await AsyncStorage.setItem('selectedIngredients', JSON.stringify(ingredients));
    } catch (error) {
      console.error('Error saving selected ingredients:', error);
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

  const handleInputChange = (text) => {
    setInput(text);
    if (text.trim().length > 0) {
      const filtered = ingredientsData.filter((ingredient) => {
        const isAlreadySelected = selectedIngredients.some((item) => item.id === ingredient.id);
        return !isAlreadySelected && Object.values(ingredient.translations || {}).some((translation) =>
          translation?.toLowerCase().includes(text.toLowerCase())
        );
      });
      setSuggestedIngredients(filtered);
    } else {
      setSuggestedIngredients([]);
    }
  };

  const addIngredient = (ingredient) => {
    if (!selectedIngredients.find((item) => item.id === ingredient.id)) {
      const updatedSelectedIngredients = [...selectedIngredients, ingredient];
      setSelectedIngredients(updatedSelectedIngredients);
      saveSelectedIngredients(updatedSelectedIngredients);
    }
    setInput('');
    setSuggestedIngredients([]);
  };

  const removeIngredient = (ingredient) => {
    const updatedSelectedIngredients = selectedIngredients.filter((item) => item.id !== ingredient.id);
    setSelectedIngredients(updatedSelectedIngredients);
    saveSelectedIngredients(updatedSelectedIngredients);
  };

  const toggleFilter = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const findRecipes = () => {
    // Δημιουργούμε ξεχωριστές λίστες για τα φίλτρα tags, difficulty και country
    const tagFilters = selectedFilters.filter(filter =>
      filters.tags.includes(filter)
    );
    const difficultyFilters = selectedFilters.filter(filter =>
      filters.difficulties.includes(filter)
    );
    const countryFilters = selectedFilters.filter(filter =>
      filters.countries.includes(filter)
    );

    const matchingRecipes = recipes.filter((recipe) => {
      // Συνθήκη για τα επιλεγμένα συστατικά
      const matchesIngredients = selectedIngredients.length === 0 || selectedIngredients.every((item) =>
        recipe.ingredients.some((ingredient) => ingredient.id === item.id)
      );

      // Συνθήκη για τα φίλτρα tags
      const matchesTags = tagFilters.length === 0 || tagFilters.every(tag =>
        recipe.tags.includes(tag)
      );

      // Συνθήκη για τα φίλτρα difficulty
      const matchesDifficulty = difficultyFilters.length === 0 || difficultyFilters.includes(recipe.difficulty);

      // Συνθήκη για τα φίλτρα country
      const matchesCountry = countryFilters.length === 0 || countryFilters.includes(recipe.country?.en);

      // Επιστρέφουμε true μόνο αν όλες οι συνθήκες ικανοποιούνται
      return matchesIngredients && matchesTags && matchesDifficulty && matchesCountry;
    });

    // Χρησιμοποιούμε ένα Set για να αποφύγουμε διπλές εμφανίσεις
    const uniqueRecipeIds = [...new Set(matchingRecipes.map(recipe => recipe.id))];
    const uniqueRecipes = uniqueRecipeIds.map(id => matchingRecipes.find(recipe => recipe.id === id));

    console.log(uniqueRecipes);
    return uniqueRecipes;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Ingredients</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type an ingredient"
          value={input}
          onChangeText={handleInputChange}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Text>Filters ({selectedFilters.length})</Text>
        </TouchableOpacity>
      </View>

      {selectedFilters.length > 0 && (
        <View style={styles.selectedFiltersContainer}>
          <Text style={styles.subtitle}>Selected Filters:</Text>
          <FlatList
            horizontal
            data={selectedFilters}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => toggleFilter(item)}
                style={styles.selectedFilterItem}
              >
                <Text>{item}</Text>
                <Icon name="times" size={16} color="#F44336" style={styles.removeFilterIcon} />
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {suggestedIngredients.length > 0 ? (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestedIngredients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => addIngredient(item)}
                style={styles.suggestionItem}
              >
                <Text>{item.translations[language] || item.translations['en']}</Text>
                <Icon name="plus" size={20} color="#4CAF50" />
              </TouchableOpacity>
            )}
          />
        </View>
      ) : input.trim().length > 0 ? (
        <Text style={styles.noResults}>No matching ingredients found.</Text>
      ) : null}

      <Text style={styles.subtitle}>Selected Ingredients:</Text>
      <FlatList
        data={selectedIngredients}
        keyExtractor={(item) => item.id}
        style={{ minHeight: 150 }} // Προσθήκη ύψους
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => removeIngredient(item)}
            style={styles.ingredientItem}
          >
            <Text>{item.translations[language] || item.translations['en']}</Text>
            <Icon name="times" size={20} color="#F44336" />
          </TouchableOpacity>
        )}
      />


      <Text style={styles.subtitle}>Matching Recipes:</Text>
      <FlatList
        data={findRecipes()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('RecipeDetails', { recipe: item })}
            style={styles.recipeItem}
          >
            <Text>{item.name[language] || item.name['en']}</Text>
            <TouchableOpacity onPress={() => toggleFavorite(item)}>
              <Text style={{ fontSize: 24, color: 'gold' }}>
                {favorites.some((fav) => fav.id === item.id) ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Filters</Text>

          {/* Ενότητα Tags */}
          <Text style={styles.filterCategoryTitle}>Tags</Text>
          <FlatList
            data={filters.tags}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => toggleFilter(item)}
                style={[
                  styles.filterItem,
                  selectedFilters.includes(item) && styles.selectedFilterItem,
                ]}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />

          {/* Ενότητα Difficulty */}
          <Text style={styles.filterCategoryTitle}>Difficulty</Text>
          <FlatList
            data={filters.difficulties}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => toggleFilter(item)}
                style={[
                  styles.filterItem,
                  selectedFilters.includes(item) && styles.selectedFilterItem,
                ]}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />

          {/* Ενότητα Country */}
          <Text style={styles.filterCategoryTitle}>Country</Text>
          <FlatList
            data={filters.countries}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => toggleFilter(item)}
                style={[
                  styles.filterItem,
                  selectedFilters.includes(item) && styles.selectedFilterItem,
                ]}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />

          <Button title="Close" onPress={() => setIsFilterModalVisible(false)} />
        </View>
      </Modal>
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
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 5,
  },
  selectedFiltersContainer: {
    marginBottom: 20,
  },
  selectedFilterItem: {
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 5,
    marginRight: 10,
  },
  suggestionsContainer: {
    maxHeight: 200, // Αύξηση του ύψους της λίστας αναζήτησης
    marginBottom: 20,
  },
  suggestionItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noResults: {
    padding: 15,
    color: '#888',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  ingredientItem: {
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#90caf9',
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  filterItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedFilterItem: {
    backgroundColor: '#e3f2fd',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  filterCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  filterItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedFilterItem: {
    backgroundColor: '#e3f2fd',
  },
  selectedFiltersContainer: {
    marginBottom: 20,
  },
  selectedFilterItem: {
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 5,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeFilterIcon: {
    marginLeft: 5,
  },
});

export default IngredientsScreen;