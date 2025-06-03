# 🥗 NutriXP

Aplicativo mobile inteligente focado em dietas personalizadas e saúde alimentar com integração de IA, pagamentos via Stripe e armazenamento seguro com Firebase.

<!-- Substitua pelo link do seu banner -->

## 📲 Visão Geral

O NutriXP é um aplicativo desenvolvido com React Native que utiliza Inteligência Artificial para criar planos alimentares personalizados e promover uma alimentação saudável. Com integração ao Firebase para autenticação e armazenamento de dados, e Stripe para processamento de pagamentos, o NutriXP oferece uma experiência completa e segura para usuários que buscam melhorar seus hábitos alimentares e qualidade de vida através da nutrição.

## 🚀 Tecnologias Utilizadas

- React Native
- Firebase Authentication
- Cloud Firestore
- Stripe React Native SDK
- Firebase Cloud Functions
- TypeScript

## 📦 Instalação

Siga os passos abaixo para configurar o projeto localmente:

### 1. Clone o repositório

```bash
git clone https://github.com/seocodes/NutriXP.git
cd NutriXP
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure o Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Habilite a autenticação por e-mail/senha.
3. Crie um banco de dados Firestore.
4. Obtenha as configurações do Firebase e substitua no arquivo `firebaseConfig.ts`:

```typescript
// src/config/firebaseConfig.ts
export const firebaseConfig = {
  apiKey: 'SUA_API_KEY',
  authDomain: 'SEU_AUTH_DOMAIN',
  projectId: 'SEU_PROJECT_ID',
  storageBucket: 'SEU_STORAGE_BUCKET',
  messagingSenderId: 'SEU_MESSAGING_SENDER_ID',
  appId: 'SEU_APP_ID',
};
```

### 4. Configure o Stripe

1. Crie uma conta em [Stripe](https://stripe.com/).
2. Obtenha sua chave pública de teste.
3. Substitua no arquivo `stripeConfig.ts`:

```typescript
// src/config/stripeConfig.ts
export const STRIPE_PUBLISHABLE_KEY = 'SUA_CHAVE_PÚBLICA_DE_TESTE';
```

### 5. Configure as funções do Firebase (opcional)

Se estiver utilizando Firebase Cloud Functions para processar pagamentos:

1. Instale as ferramentas do Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Inicialize as funções:

```bash
firebase init functions
```

3. Implemente as funções necessárias para processar pagamentos com Stripe.

### 6. Execute o aplicativo

```bash
npx react-native run-android
# ou
npx react-native run-ios
```

## 💳 Integração com Stripe

O NutriXP utiliza o Stripe React Native SDK para processar pagamentos de forma segura. A integração permite:

- Aceitar pagamentos com cartão de crédito/débito
- Gerenciar assinaturas e pagamentos recorrentes
- Utilizar o PaymentSheet para uma experiência de checkout simplificada

Para mais detalhes sobre a integração, consulte a [documentação oficial do Stripe](https://stripe.com/docs).

## 📁 Estrutura do Projeto

```
NutriXP/
├── android/
├── ios/
├── src/
│   ├── components/
│   ├── config/
│   ├── screens/
│   ├── services/
│   └── utils/
├── App.tsx
├── firebase.json
├── package.json
└── README.md
```

## ✅ Funcionalidades

- Cadastro e login de usuários com Firebase Authentication
- Formulário para coleta de dados nutricionais do usuário (peso, altura, restrições alimentares, objetivos, etc.)
- Geração de planos alimentares personalizados utilizando IA
- Acompanhamento de progresso nutricional
- Calculadora de macronutrientes e calorias
- Banco de dados de alimentos e receitas saudáveis
- Processamento de pagamentos com Stripe
- Armazenamento seguro de dados no Firestore

## 🛠️ Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

1. Fork o projeto
2. Crie uma branch para sua feature: `git checkout -b minha-feature`
3. Faça commit das suas alterações: `git commit -m 'Adiciona minha feature'`
4. Envie para o repositório remoto: `git push origin minha-feature`
5. Abra um Pull Request

## 🌐 Links Importantes

- [Repositório](https://github.com/seocodes/NutriXP)
- [Documentação do Firebase](https://firebase.google.com/docs)
- [Documentação do Stripe](https://stripe.com/docs)

---

Desenvolvido por [@seocodes](https://github.com/seocodes) & [@joaobenedetmachado](https://github.com/joaobenedetmachado)
