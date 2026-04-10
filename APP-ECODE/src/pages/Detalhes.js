import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function Detalhes({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Esta é a tela de Detalhes.</Text>
      <Button
        title="Voltar"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  texto: { fontSize: 18, marginBottom: 20 }
});