import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import CustomButton from '../components/CustomButton';

const ProfileSetupScreen = ({ navigation }) => {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [dietaryOptions, setDietaryOptions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!age || !weight || !height || !gender || !fitnessGoal || !dietaryOptions) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          age: parseInt(age),
          weight: parseFloat(weight),
          height: parseFloat(height),
          gender: gender,
          fitnessGoal: fitnessGoal,
          dietaryOptions: dietaryOptions,
          profileCompleted: true,
        }, { merge: true }); // merge: atualiza o documento existente sem sobrescrever outros campos
        Alert.alert('Sucesso', 'Seu perfil foi salvo com sucesso!');
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Erro', 'Usuário não autenticado.');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar seu perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
 // assim que ele entra na tela, ele pega os dados do usuario e preenche os campos
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setAge(userData.age ? String(userData.age) : '');
            setWeight(userData.weight ? String(userData.weight) : '');
            setHeight(userData.height ? String(userData.height) : '');
            setGender(userData.gender || '');
            setFitnessGoal(userData.fitnessGoal || '');
            setDietaryOptions(userData.dietaryOptions || '');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Complete seu Perfil</Text>
        <Text style={styles.subtitle}>Nos ajude a personalizar sua experiência!</Text>

        <TextInput
          style={styles.input}
          placeholder="Idade"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Peso (kg)"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Altura (cm)"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Gênero:</Text>
        <View style={styles.optionContainer}>
          <TouchableOpacity
            style={[styles.optionButton, gender === 'Masculino' && styles.selectedOption]}
            onPress={() => setGender('Masculino')}
          >
            <Text style={gender === 'Masculino' ? styles.selectedOptionText : styles.optionText}>Masculino</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, gender === 'Feminino' && styles.selectedOption]}
            onPress={() => setGender('Feminino')}
          >
            <Text style={gender === 'Feminino' ? styles.selectedOptionText : styles.optionText}>Feminino</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Objetivo na Academia (ex: Ganhar massa, Emagrecer)"
          value={fitnessGoal}
          onChangeText={setFitnessGoal}
        />

        <TextInput
          style={styles.input}
          placeholder="Opções Alimentares (ex: Vegetariano, Sem glúten)"
          value={dietaryOptions}
          onChangeText={setDietaryOptions}
        />

        <CustomButton
          title="Salvar Perfil"
          onPress={handleSaveProfile}
          iconName="save"
          disabled={loading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    alignSelf: 'flex-start',
    width: '100%',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionText: {
    color: '#333',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileSetupScreen; 