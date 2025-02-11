import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({
  languageStrings,
  setLanguage,
  theme,
  setTheme,
  navigation,
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem('appLanguage');
      const storedTheme = await AsyncStorage.getItem('appTheme');
      if (storedLanguage) setSelectedLanguage(storedLanguage);
      if (storedTheme) setTheme(storedTheme === 'dark' ? 'dark' : 'light');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveLanguage = async (language) => {
    setSelectedLanguage(language);
    setLanguage(language);
    await AsyncStorage.setItem('appLanguage', language);
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('appTheme', newTheme);
  };

  const handleSubscription = () => {
    navigation.navigate('SubscriptionScreen');
  };

  return (
    <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
      <Text style={styles.title}>
        {languageStrings.settings || 'Settings'}
      </Text>

      {/* Language Selection */}
      <Text style={styles.subtitle}>
        {languageStrings.select_language || 'Select Language'}
      </Text>
      <View style={styles.languageContainer}>
        <TouchableOpacity
          style={[
            styles.languageButton,
            selectedLanguage === 'en' && styles.selectedLanguage,
          ]}
          onPress={() => saveLanguage('en')}
        >
          <Text style={styles.languageText}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.languageButton,
            selectedLanguage === 'gr' && styles.selectedLanguage,
          ]}
          onPress={() => saveLanguage('gr')}
        >
          <Text style={styles.languageText}>Ελληνικά</Text>
        </TouchableOpacity>
      </View>

      {/* Theme Selection */}
      <Text style={styles.subtitle}>
        {languageStrings.select_theme || 'Select Theme'}
      </Text>
      <View style={styles.themeContainer}>
        <Text style={styles.themeLabel}>
          {theme === 'light'
            ? languageStrings.light_theme || 'Light Theme'
            : languageStrings.dark_theme || 'Dark Theme'}
        </Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
        />
      </View>

      {/* Subscription */}
      <Text style={styles.subtitle}>
        {languageStrings.subscription || 'Subscription'}
      </Text>
      <Button
        title={languageStrings.manage_subscription || 'Manage Subscription'}
        onPress={handleSubscription}
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
  darkContainer: {
    backgroundColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#000',
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedLanguage: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  languageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  themeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  themeLabel: {
    fontSize: 16,
    color: '#000',
  },
});
