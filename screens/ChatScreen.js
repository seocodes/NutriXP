import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import Markdown from 'react-native-markdown-display';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

const ChatScreen = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState(["Pergunte suas dietas aqui",]);
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [dietaryOptions, setDietaryOptions] = useState('');
  const [allUserData, setAllUserData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: '',
    fitnessGoal: '',
    dietaryOptions: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid)); // pega os dados do usuario no db
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log(userData)
            setAllUserData({ // salva num state
              age: userData.age ? String(userData.age) : '',
              weight: userData.weight ? String(userData.weight) : '',
              height: userData.height ? String(userData.height) : '',
              gender: userData.gender || '',
              fitnessGoal: userData.fitnessGoal || '',
              dietaryOptions: userData.dietaryOptions || ''
            });

          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };

    fetchProfileData();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) { // faz a querie pro db de todas as mensagens caso tenha user
      const q = query(collection(db, 'chatMessages'), orderBy('timestamp'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedMessages = [];
        snapshot.forEach((doc) => {
          // apenas add mensagens do proprio user
          if (doc.data().userId === user.uid) { // aqui ele pega todas as mensagens DO USUARIO authenticado
            fetchedMessages.push(doc.data());
          }
        });
        setMessages(fetchedMessages);
      }, (error) => {
        console.error("Error fetching chat messages:", error);
      });

      return () => unsubscribe();
    }
  }, []);

  const handleSend = async () => {
    if (!prompt.trim()) {
      Alert.alert('Por favor', 'Digite uma pergunta antes de enviar.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado. Por favor, faça login novamente.');
      return;
    }

    const userMessage = {
      text: prompt,
      sender: 'user',
      userId: user.uid,
      timestamp: serverTimestamp(),
    };

    // Add mensagem do user no db
    try {
      await addDoc(collection(db, 'chatMessages'), userMessage);
    } catch (firestoreError) {
      console.error('Erro ao salvar mensagem do usuário no Firestore:', firestoreError);
      Alert.alert('Erro', 'Não foi possível enviar sua mensagem. Tente novamente.');
      setLoading(false);
      return;
    }

    setPrompt('');
    setLoading(true);

    const baseUrl = "https://free-chatgpt-api.p.rapidapi.com/chat-completion-one";
    const headers = {
      "x-rapidapi-key": "c9d143c772mshdec85ce6360dd14p1e7d84jsn9a29e0f400f1",
      "x-rapidapi-host": "free-chatgpt-api.p.rapidapi.com"
    };

    const fullPrompt = `
        Você é um assistente altamente especializado em fazer dietas. Voce é um nutricionista com mais de 10 anos de experiencia e deve ajudar o usuario a encontrar a melhor dieta de acordo com seus dados:
        1. Analise o problema descrito.
        2. Resolva de forma direta e clara
        3. Voce deve focar em resolver o problema do cliente
        4. Segue os dados: 
        Idade: ${allUserData.age}
        Peso: ${allUserData.weight}
        Altura: ${allUserData.height}
        Gênero: ${allUserData.gender}
        Objetivo: ${allUserData.fitnessGoal}
        Preferências alimentares: ${allUserData.dietaryOptions}
        ${userMessage.text}
`;

    console.log(fullPrompt)
    const encodedPrompt = encodeURIComponent(fullPrompt);
    const urlWithParams = `${baseUrl}?prompt=${encodedPrompt}`;

    try {
      const response = await fetch(urlWithParams, {
        method: 'GET',
        headers: headers,
      });

      console.log('Status Code:', response.status);
      const data = await response.json();
      console.log('Response Data:', data);

      let aiResponseText;
      if (response.ok) {
        aiResponseText = data.response || 'Não foi possível obter uma resposta válida.';
      } else {
        aiResponseText = `Erro da API: ${data.message || data.error || response.status}`;
      }

      const aiMessage = {
        text: aiResponseText,
        sender: 'ai',
        userId: user.uid,
        timestamp: serverTimestamp(),
      };

      // adciona a mensagem pro db
      await addDoc(collection(db, 'chatMessages'), aiMessage);

    } catch (error) {
      console.error('Erro ao chamar a API ou salvar mensagem do AI:', error);
      const errorMessage = {
        text: 'Erro ao comunicar com o servidor.',
        sender: 'ai',
        userId: user.uid,
        timestamp: serverTimestamp(),
      };
      await addDoc(collection(db, 'chatMessages'), errorMessage); //caso de erro ne
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {messages.map((message, index) => (
          <View key={index} style={message.sender === 'user' ? styles.userMessageContainer : styles.aiMessageContainer}>
            <Text style={message.sender === 'user' ? styles.userMessageText : styles.aiMessageText}>
              <Markdown>
                {message.text}
              </Markdown>
            </Text>
          </View>
        ))}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.loadingText}>Pensando...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua pergunta..."
          value={prompt}
          onChangeText={setPrompt}
          editable={!loading}
        />
        <Button
          title={loading ? "Enviando..." : "Enviar"}
          onPress={handleSend}
          disabled={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 15,
    justifyContent: 'flex-end',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: '80%',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessageText: {
    fontSize: 16,
    color: '#333',
  },
  aiMessageText: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loadingText: {
    marginLeft: 5,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
});

export default ChatScreen; 