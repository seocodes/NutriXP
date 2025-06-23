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
  Modal,
} from 'react-native';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import CustomButton from '../components/CustomButton';
import { useFocusEffect } from '@react-navigation/native';

const ProfileSetupScreen = ({ navigation }) => {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [dietaryOptions, setDietaryOptions] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [buying, setBuying] = useState(false);
  const [userCredits, setUserCredits] = useState(0);

  const handleSaveProfile = async () => {
    if (!age || !weight || !height || !gender || !fitnessGoal || !dietaryOptions) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // sava no doc dos users
        await setDoc(doc(db, 'users', user.uid), {
          age: parseInt(age),
          weight: parseFloat(weight),
          height: parseFloat(height),
          gender: gender,
          fitnessGoal: fitnessGoal,
          profileCompleted: true,
        }, { merge: true });

        // se ele salvar ele edita la e adciona esses dados
        await setDoc(doc(db, 'userDietaryInfo', user.uid), {
          dietaryOptions: dietaryOptions,
        }, { merge: true });

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
            setUserCredits(userData.credits || 0);
          }

         const dietaryDoc = await getDoc(doc(db, 'userDietaryInfo', user.uid));
          if (dietaryDoc.exists()) {
            const dietaryData = dietaryDoc.data();
            setDietaryOptions(dietaryData.dietaryOptions || '');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };

    fetchProfileData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchCredits = async () => {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserCredits(userData.credits || 0);
          }
        }
      };
      fetchCredits();
    }, [])
  );

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
        setUserCredits(currentCredits + amount);
        Alert.alert('Sucesso', `Você comprou ${amount} créditos!`);
        setModalVisible(false);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível comprar créditos.');
    } finally {
      setBuying(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={{width:'100%', alignItems:'center', marginBottom: 10}}>
          <CustomButton
            title={`Comprar Créditos (Você tem: ${userCredits})`}
            iconName="monetization-on"
            onPress={() => navigation.navigate('Payment')}
            style={{backgroundColor:'#2196F3', width:'100%'}}
          />
        </View>
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
          style={styles.inputLabel}
          placeholder="Objetivo na Academia (ex: Ganhar massa, Emagrecer)"
          value={fitnessGoal}
          onChangeText={setFitnessGoal}
          multiline={true}
        />

        <TextInput
          style={styles.inputLabel}
          placeholder="Opções Alimentares (ex: Vegetariano, Sem glúten)"
          value={dietaryOptions}
          onChangeText={setDietaryOptions}
          multiline={true}

        />

        <CustomButton
          title="Salvar Perfil"
          onPress={handleSaveProfile}
          iconName="save"
          disabled={loading}
        />
      </ScrollView>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha seu plano de créditos</Text>
            <View style={{marginVertical:10}}>
              <CustomButton
                title="10 créditos - Rápido (R$ 4,99)"
                iconName="flash-on"
                onPress={() => handleBuyCredits(10)}
                loading={buying}
              />
              <CustomButton
                title="30 créditos - Mais vendido (R$ 11,99)"
                iconName="star"
                onPress={() => handleBuyCredits(30)}
                style={{backgroundColor:'#FFD700'}}
                loading={buying}
              />
              <CustomButton
                title="100 créditos - Melhor valor (R$ 29,99)"
                iconName="local-offer"
                onPress={() => handleBuyCredits(100)}
                style={{backgroundColor:'#4CAF50'}}
                loading={buying}
              />
            </View>
            <CustomButton title="Fechar" onPress={() => setModalVisible(false)} iconName="close" style={{backgroundColor:'#f44336'}} />
          </View>
        </View>
      </Modal>
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
  inputLabel: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    width: '100%',
    height: 120,
    textAlignVertical: 'top', // CORRETO para alinhar texto no topo
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
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#4CAF50',
  },
});

export default ProfileSetupScreen; 