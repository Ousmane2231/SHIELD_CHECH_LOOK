import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as Device from 'expo-device';

// --- TES CLÉS SUPABASE (À compléter) ---
const supabaseUrl = 'https://frsvuwpidxsxuczgwmfh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyc3Z1d3BpZHhzeHVjemd3bWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyODM0MzAsImV4cCI6MjA4ODg1OTQzMH0.ZHSIrJ5zysauA3bcMQKEJt_rKMWic8VM54HXsB7tW_I';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {

  useEffect(() => {
    checkSecurityStatus();
  }, []);

  const checkSecurityStatus = async () => {
    try {
      // Identifiant unique du téléphone
      const monImei = Device.modelId || "device_inconnu"; 

      // Vérification dans ta table 'objets_voles'
      const { data, error } = await supabase
        .from('objets_voles')
        .select('id')
        .eq('identifiant', monImei)
        .single();

      if (data) {
        // Si trouvé dans la table, on verrouille
        await AsyncStorage.setItem('isLocked', 'true');
        triggerLock();
      }
    } catch (error) {
      // Mode hors-ligne : vérification mémoire
      const isLocked = await AsyncStorage.getItem('isLocked');
      if (isLocked === 'true') triggerLock();
    }
  };

  const triggerLock = () => {
    Alert.alert("ALERTE SÉCURITÉ", "Cet appareil est déclaré volé et a été verrouillé par Shield Check.");
  };

  const requestAdmin = async () => {
    await IntentLauncher.startActivityAsync('android.app.action.ADD_DEVICE_ADMIN', {
      extra: { 
        'android.app.extra.DEVICE_ADMIN': 'com.shieldcheck.mali.AdminReceiver',
        'android.app.extra.ADD_EXPLANATION': 'Activez cette option pour sécuriser votre appareil.'
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SHIELD CHECK</Text>
      <Text style={styles.subtitle}>Système Anti-Vol Actif</Text>
      <TouchableOpacity style={styles.button} onPress={requestAdmin}>
        <Text style={styles.buttonText}>ACTIVATION ADMIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 32, color: '#38bdf8', fontWeight: 'bold' },
  subtitle: { color: '#94a3b8', marginBottom: 50 },
  button: { backgroundColor: '#38bdf8', padding: 20, borderRadius: 25 },
  buttonText: { color: '#0f172a', fontWeight: 'bold' }
});
