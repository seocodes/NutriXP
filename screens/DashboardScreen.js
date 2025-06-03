import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import CustomButton from '../components/CustomButton';
import { doc, getDoc, enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const DashboardScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // aqui ele vai pegar os dados do usuário quando ele entrar na tela de acordo com o auth e o firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const user = auth.currentUser;
        if (user) {
          console.log('Dados do usuário (Auth):', {
            email: user.email,
            uid: user.uid,
            emailVerified: user.emailVerified,
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime,
            name: user.name
          });

          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              console.log('Dados do usuário (Firestore):', data);
              setUserData(data);
            } else {
              console.log('Documento do usuário não encontrado no Firestore');
            }
          } catch (firestoreError) {
            console.error('Erro ao acessar Firestore:', firestoreError);
            Alert.alert(
              'Aviso',
              'Não foi possível acessar alguns dados. Verifique sua conexão com a internet.'
            );
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        Alert.alert(
          'Erro',
          'Ocorreu um erro ao carregar os dados. Por favor, tente novamente.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Bem-vindo ao NutriXP!</Text>
      <Text style={styles.emailText}>Nome: {userData?.name || 'Carregando...'}</Text>
      {isLoading && <Text style={styles.loadingText}>Carregando dados...</Text>}
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Atividade recente</Text>
        // aqui ele vai pegar as atividades recentes do usuário
      </View>
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
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DashboardScreen; 