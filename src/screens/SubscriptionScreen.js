import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Button,
} from 'react-native';

export default function SubscriptionScreen({ navigation, languageStrings, isLoggedIn }) {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSubscribe = () => {
    if (!isLoggedIn) {
      Alert.alert(
        languageStrings.login_required || 'Login Required',
        languageStrings.please_login_to_subscribe || 'Please login to proceed with subscription.',
        [{ text: languageStrings.ok || 'OK', onPress: () => navigation.navigate('Login') }]
      );
      return;
    }

    if (selectedPlan) {
      Alert.alert(
        languageStrings.subscription_success || 'Subscription Successful',
        `${languageStrings.you_have_selected || 'You have selected'}: ${selectedPlan}`,
        [{ text: languageStrings.ok || 'OK' }]
      );
    } else {
      Alert.alert(
        languageStrings.no_plan_selected || 'No Plan Selected',
        languageStrings.please_select_a_plan || 'Please select a subscription plan.',
        [{ text: languageStrings.ok || 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {languageStrings.subscription || 'Subscription Plans'}
      </Text>

      {/* Subscription Plans */}
      <View style={styles.planContainer}>
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'Free' && styles.selectedPlanCard,
          ]}
          onPress={() => setSelectedPlan('Free')}
        >
          <Text style={styles.planTitle}>
            {languageStrings.free_plan || 'Free Plan'}
          </Text>
          <Text style={styles.planDetails}>
            {languageStrings.free_plan_description || 'Access limited features for free.'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === '1€/month' && styles.selectedPlanCard,
          ]}
          onPress={() => setSelectedPlan('1€/month')}
        >
          <Text style={styles.planTitle}>
            {languageStrings.monthly_plan || '1€/month'}
          </Text>
          <Text style={styles.planDetails}>
            {languageStrings.monthly_plan_description || 'Access all features for 1€ per month.'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === '5€/month' && styles.selectedPlanCard,
          ]}
          onPress={() => setSelectedPlan('5€/month')}
        >
          <Text style={styles.planTitle}>
            {languageStrings.premium_plan || '5€/month'}
          </Text>
          <Text style={styles.planDetails}>
            {languageStrings.premium_plan_description || 'Access premium features for 5€ per month.'}
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title={languageStrings.subscribe_now || 'Subscribe Now'}
        onPress={handleSubscribe}
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
  planContainer: {
    marginBottom: 20,
  },
  planCard: {
    padding: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedPlanCard: {
    borderColor: '#007BFF',
    backgroundColor: '#E6F0FF',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  planDetails: {
    fontSize: 14,
    color: '#555',
  },
});
