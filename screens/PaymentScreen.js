import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import CustomButton from '../components/CustomButton';

const PaymentScreen = () => {
  const navigation = useNavigation();
  const [buying, setBuying] = useState(false);

  const handleBuyCredits = async (amount) => {
    setBuying(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let currentCredits = 0;
        if (userDoc.exists()) {
          const userData = userDoc.data();
          currentCredits = userData.credits || 0;
        }
        await setDoc(doc(db, 'users', user.uid), {
          credits: currentCredits + amount,
        }, { merge: true });
        Alert.alert('Sucesso', `Você comprou ${amount} créditos!`);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível comprar créditos.');
    } finally {
      setBuying(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Escolha seu plano de créditos</Text>
      <Text style={styles.subtitle}>Desbloqueie respostas do nutricionista e tenha acesso ilimitado ao chat!</Text>
      <View style={styles.plansContainer}>
        <CustomButton
          title="10 créditos - Rápido (R$ 4,99)"
          iconName="flash-on"
          onPress={() => handleBuyCredits(10)}
          loading={buying}
          style={styles.planButton}
        />
        <CustomButton
          title="30 créditos - Mais vendido (R$ 11,99)"
          iconName="star"
          onPress={() => handleBuyCredits(30)}
          loading={buying}
          style={[styles.planButton, styles.bestSeller]}
        />
        <CustomButton
          title="100 créditos - Melhor valor (R$ 29,99)"
          iconName="local-offer"
          onPress={() => handleBuyCredits(100)}
          loading={buying}
          style={[styles.planButton, styles.bestValue]}
        />
      </View>
      <Text style={styles.infoText}>Os créditos são usados a cada mensagem enviada ao chat. Aproveite para tirar todas as suas dúvidas!</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  logo: {
    height: 80,
    width: '70%',
    resizeMode: 'contain',
    marginBottom: 10,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  plansContainer: {
    width: '100%',
    marginBottom: 30,
  },
  planButton: {
    marginBottom: 18,
    paddingVertical: 18,
    fontSize: 18,
    borderRadius: 12,
    elevation: 3,
  },
  bestSeller: {
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#FFA000',
  },
  bestValue: {
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#388E3C',
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
});

export default PaymentScreen; 