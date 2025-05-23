import { Redirect } from 'expo-router';
import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/context/AuthContext';

export default function Home() {
  const { state, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Cargando...</Text>
      </View>
    );
  }
}
