import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';

const ChatScreen = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim()) {
      Alert.alert('Por favor', 'Digite uma pergunta antes de enviar.');
      return;
    }

    const userMessage = { text: prompt, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setPrompt('');

    setLoading(true);

    const baseUrl = "https://free-chatgpt-api.p.rapidapi.com/chat-completion-one";
    const headers = {
        "x-rapidapi-key": "c9d143c772mshdec85ce6360dd14p1e7d84jsn9a29e0f400f1", // Note: Hardcoding API keys is not recommended for production.
        "x-rapidapi-host": "free-chatgpt-api.p.rapidapi.com"
    };

    const fullPrompt = `
Você é um assistente altamente especializado. Receberá um problema e deverá fornecer uma solução clara e objetiva no formato de um único retorno.
Instruções:
1. Analise o problema descrito.
2. Resolva de forma direta, incluindo algumas explicações se necessário para que o usuário entenda a solução.
3. Retorne apenas a solução, em uma frase ou bloco de código, se aplicável.
4. Analise os agendamentos disponíveis: [] // Placeholder for agendamentos_str, as we don't have this data here yet.
5. A ideia de sua resposta é ajudar o usuário a gerenciar os agendamentos, ele irá dar um problema, e você irá receber em conjunto os agendamentos, assim encontrando a melhor forma de resolver o problema do usuário.
6. Voce nao deve nunca retornar o codigo python, e sim o nome formatado corretamente
${userMessage.text}
`;

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
        setMessages(prevMessages => [...prevMessages, { text: aiResponseText, sender: 'ai' }]);

    } catch (error) {
        console.error('Erro ao chamar a API:', error);
        setMessages(prevMessages => [...prevMessages, { text: 'Erro ao comunicar com o servidor.', sender: 'ai' }]);
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
              {message.text}
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