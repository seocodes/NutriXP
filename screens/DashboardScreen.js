import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import CustomButton from '../components/CustomButton';
import { doc, getDoc, enableNetwork, disableNetwork, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Modal } from 'react-native';

const Tab = createBottomTabNavigator();

const DashboardScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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
            await enableNetwork(db);

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              console.log('Dados do usuário (Firestore):', data);
              setUserData(data);
            } else {
              console.log('Documento do usuário não encontrado no Firestore');
              setUserData({ profileCompleted: false });
            }
          } catch (firestoreError) {
            console.error('Erro ao acessar Firestore:', firestoreError);
            Alert.alert(
              'Aviso',
              'Não foi possível acessar alguns dados. Verifique sua conexão com a internet.'
            );
            setUserData({ profileCompleted: false });
          }
        } else {
          setIsLoading(false);
          setUserData(null);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        Alert.alert(
          'Erro',
          'Ocorreu um erro ao carregar os dados. Por favor, tente novamente.'
        );
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    return () => {
      disableNetwork(db).catch(console.error);
    };
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const q = query(
        collection(db, 'chatMessages'),
        orderBy('timestamp', 'desc') // ordenar por mais recente primeiro
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedMessages = [];
        snapshot.forEach((doc) => {
          // apenas add mensagens do próprio user
          if (doc.data().userId === user.uid) {
            fetchedMessages.push({ id: doc.id, ...doc.data() });
          }
        });
        setMessages(fetchedMessages.slice(0, 5)); // limitar a 5 mensagens mais recentes
      }, (error) => {
        console.error("Error fetching chat messages:", error);
      });

      return () => unsubscribe();
    }
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

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const MessageCard = ({ message, onPress }) => (
    <TouchableOpacity onPress={() => onPress(message)} style={styles.messageCard}>
      <Text style={styles.messageText} numberOfLines={2}>
        {message.text || message.content || 'Mensagem sem texto'}
      </Text>
      <Text style={styles.messageDate}>
        {formatDate(message.timestamp)}
      </Text>
    </TouchableOpacity>
  );


  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.welcomeText}>Bem-vindo {auth.currentUser?.emailname || 'Carregando...'}!</Text>
      {isLoading && <Text style={styles.loadingText}>Carregando dados...</Text>}

      {!isLoading && userData && !userData.profileCompleted && (
        <View style={styles.profilePromptCard}>
          <Text style={styles.profilePromptText}>
            Seu perfil está incompleto. Por favor, preencha seus dados para uma experiência personalizada!
          </Text>
          <CustomButton
            title="Completar Perfil"
            onPress={() => navigation.navigate('Profile')}
            iconName="account-circle"
            style={styles.completeProfileButton}
          />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Atividade recente</Text>

        {messages.length > 0 ? (
          messages.map((message, index) =>
            message.sender === "ai" ? (
              <MessageCard
                key={message.id || index}
                message={message}
                onPress={(msg) => {
                  setSelectedMessage(msg);
                  setModalVisible(true);
                }}
              />
            ) : null
          )
        ) : (
          <Text style={styles.cardText}>Nenhuma atividade recente</Text>
        )}


      </View>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mensagem Completa</Text>
            <ScrollView>
              <Text style={styles.modalText}>{selectedMessage?.text || selectedMessage?.content}</Text>
            </ScrollView>
            <CustomButton title="Fechar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    backgroundColor: "#d1d1d1",
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    height: 60,
    width: '80%',
    resizeMode: 'contain',
    marginBottom: 20,
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
    marginBottom: 15,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  messageCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  messageDate: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  profilePromptCard: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profilePromptText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  completeProfileButton: {
    backgroundColor: '#F57C00',
    marginTop: 10,
    width: '80%',
  },
});

export default DashboardScreen;