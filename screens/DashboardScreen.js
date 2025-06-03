import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth } from '../services/firebaseConfig';

const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Bem-vindo ao NutriXP!</Text>
      <Text style={styles.emailText}>Email: {auth.currentUser?.email}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4CAF50',
  },
  emailText: {
    fontSize: 16,
    color: '#666',
  },
});

export default DashboardScreen; 