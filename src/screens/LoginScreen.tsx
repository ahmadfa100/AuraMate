// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const LoginScreen: React.FC = () => {
  const { signInWithMagicLink, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');

  const onSend = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address');
      return;
    }
    await signInWithMagicLink(email);
    Alert.alert('Magic link sent', 'Check your email and open the link on your device');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to AuraMate</Text>
      <Text style={styles.subtitle}>Sign in with your email — we’ll send a magic link.</Text>

      <TextInput
        style={styles.input}
        placeholder="your@university.edu"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={onSend} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Magic Link</Text>}
      </TouchableOpacity>

      <Text style={styles.small}>By signing in you accept our privacy policy. This app is not a substitute for professional care.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  input: { borderColor: '#ddd', borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  small: { marginTop: 12, color: '#666', fontSize: 12 },
  error: { color: 'red', marginTop: 10 },
});
