import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SupermarketScreen({ navigation, languageStrings }) {
  const [dailyPlan, setDailyPlan] = useState([]);
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedPlanType, setSelectedPlanType] = useState('daily'); // 'daily' or 'weekly'

  useEffect(() => {
    fetchRecipes();
    loadPlans();
  }, []);

  const fetchRecipes = async () => {
    try {
      const storedRecipes = await AsyncStorage.getItem('recipes');
      if (storedRecipes) {
        setRecipes(JSON.parse(storedRecipes));
      } else {
        const response = await fetch('https://example.com/recipes.json'); // Replace with your URL
        const data = await response.json();
        await AsyncStorage.setItem('recipes', JSON.stringify(data));
        setRecipes(data);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  const loadPlans = async () => {
    try {
      const storedDailyPlan = JSON.parse(
        await AsyncStorage.getItem('dailyPlan')
      ) || [];
      const storedWeeklyPlan = JSON.parse(
        await AsyncStorage.getItem('weeklyPlan')
      ) || [];
      setDailyPlan(storedDailyPlan);
      setWeeklyPlan(storedWeeklyPlan);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const savePlan = async () => {
    if (selectedPlanType === 'daily') {
      await AsyncStorage.setItem('dailyPlan', JSON.stringify(dailyPlan));
    } else {
      await AsyncStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan));
    }
  };

  const addRecipeToPlan = (recipe) => {
    if (selectedPlanType === 'daily' && dailyPlan.length < 2) {
      setDailyPlan([...dailyPlan, recipe]);
    } else if (selectedPlanType === 'weekly') {
      setWeeklyPlan([...weeklyPlan, recipe]);
    } else {
      alert(
        languageStrings.limit_reached ||
          'You have reached the limit for this plan.'
      );
    }
  };

  const removeRecipeFromPlan = (recipeId) => {
    if (selectedPlanType === 'daily') {
      setDailyPlan(dailyPlan.filter((r) => r.id !== recipeId));
    } else {
      setWeeklyPlan(weeklyPlan.filter((r) => r.id !== recipeId));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {languageStrings.supermarket || 'Supermarket'}
      </Text>

      {/* Plan Type Selector */}
      <View style={styles.planSelector}>
        <Button
          title={languageStrings.daily_plan || 'Daily Plan'}
          onPress={() => setSelectedPlanType('daily')}
          color={selectedPlanType === 'daily' ? '#007BFF' : '#ccc'}
        />
        <Button
          title={languageStrings.weekly_plan || 'Weekly Plan'}
          onPress={() => setSelectedPlanType('weekly')}
          color={selectedPlanType === 'weekly' ? '#007BFF' : '#ccc'}
        />
      </View>

      {/* Plan List */}
      <Text style={styles.subtitle}>
        {selectedPlanType === 'daily'
          ? languageStrings.daily_plan || 'Daily Plan'
          : languageStrings.weekly_plan || 'Weekly Plan'}
      </Text>
      <FlatList
        data={selectedPlanType === 'daily' ? dailyPlan : weeklyPlan}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.recipeItem}>
            <Text style={styles.recipeTitle}>{item.name}</Text>
            <TouchableOpacity
              onPress={() => removeRecipeFromPlan(item.id)}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>
                {languageStrings.remove || 'Remove'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noResults}>
            {languageStrings.no_recipes || 'No recipes added yet.'}
          </Text>
        }
      />

      {/* Recipe Selection */}
      <Text style={styles.subtitle}>
        {languageStrings.add_recipes || 'Add Recipes to Plan'}
      </Text>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.recipeItem}
            onPress={() => addRecipeToPlan(item)}
          >
            <Text style={styles.recipeTitle}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <Button
        title={languageStrings.save_plan || 'Save Plan'}
        onPress={savePlan}
      />
    </View>
  );
}

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
  planSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recipeItem: {
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  removeButton: {
    marginTop: 10,
    padding: 5,
    backgroundColor: '#FF6347',
    borderRadius: 5,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noResults: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#999',
  },
});
