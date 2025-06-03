import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';

const ChatScreen = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('Aguardando sua pergunta...');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim()) {
      Alert.alert('Por favor', 'Digite uma pergunta antes de enviar.');
      return;
    }

    setLoading(true);
    setResponse('Pensando...');

    const baseUrl = "https://free-chatgpt-api.p.rapidapi.com/chat-completion-one";
    const headers = {
        "x-rapidapi-key": "c9d143c772mshdec85ce6360dd14p1e7d84jsn9a29e0f400f1", // Note: Hardcoding API keys is not recommended for production.
        "x-rapidapi-host": "free-chatgpt-api.p.rapidapi.com"
        // No "Content-Type" needed for GET with query parameters
    };

    // Construct the full prompt as shown in your Python example
    const fullPrompt = `
Você é um assistente altamente especializado. Receberá um problema e deverá fornecer uma solução clara e objetiva no formato de um único retorno.
Instruções:
1. Analise o problema descrito.
2. Resolva de forma direta, incluindo algumas explicações se necessário para que o usuário entenda a solução.
3. Retorne apenas a solução, em uma frase ou bloco de código, se aplicável.
4. Analise os agendamentos disponíveis: [] // Placeholder for agendamentos_str, as we don't have this data here yet.
5. A ideia de sua resposta é ajudar o usuário a gerenciar os agendamentos, ele irá dar um problema, e você irá receber em conjunto os agendamentos, assim encontrando a melhor forma de resolver o problema do usuário.
6. Voce nao deve nunca retornar o codigo python, e sim o nome formatado corretamente
${prompt}
`;

    // Encode the prompt for the URL
    const encodedPrompt = encodeURIComponent(fullPrompt);
    const urlWithParams = `${baseUrl}?prompt=${encodedPrompt}`;

    try {
        // Use GET method
        const response = await fetch(urlWithParams, {
            method: 'GET',
            headers: headers,
        });

        console.log('Status Code:', response.status);
        const data = await response.json();
        console.log('Response Data:', data);
        
        if (response.ok) {
            // Assuming the response structure is { "response": "AI's answer" }
            setResponse(data.response || 'Não foi possível obter uma resposta válida.');
        } else {
            // Handle non-200 responses
            setResponse(`Erro da API: ${data.message || data.error || response.status}`);
        }
    } catch (error) {
        console.error('Erro ao chamar a API:', error);
        setResponse('Erro ao comunicar com o servidor.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Ajuste conforme necessário
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.responseText}>{response}</Text>
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
  },
  responseText: {
    fontSize: 16,
    color: '#333',
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