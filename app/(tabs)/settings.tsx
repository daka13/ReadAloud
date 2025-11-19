import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { AppSettings, PLAYBACK_SPEEDS, EXPO_SPEECH_VOICES } from '@/types';
import { storageService } from '@/services/storageService';
import { ttsService } from '@/services/ttsService';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await storageService.getSettings();
      setSettings(savedSettings);

      // Update TTS service with API keys
      ttsService.setAPIKeys(savedSettings.apiKeys);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      await storageService.saveSettings(settings);

      // Update TTS service with new API keys
      ttsService.setAPIKeys(settings.apiKeys);

      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all books, progress, and settings. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAll();
              await loadSettings();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  if (isLoading || !settings) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* TTS Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Text-to-Speech</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Voice</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={settings.tts.selectedVoice}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  tts: { ...settings.tts, selectedVoice: value },
                })
              }
              style={styles.picker}
            >
              {EXPO_SPEECH_VOICES.map((voice) => (
                <Picker.Item key={voice.id} label={voice.name} value={voice.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Playback Speed</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={settings.tts.playbackSpeed}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  tts: { ...settings.tts, playbackSpeed: value },
                })
              }
              style={styles.picker}
            >
              {PLAYBACK_SPEEDS.map((speed) => (
                <Picker.Item
                  key={speed}
                  label={`${speed.toFixed(1)}x`}
                  value={speed}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Volume</Text>
          <Text style={styles.settingValue}>
            {Math.round(settings.tts.volume * 100)}%
          </Text>
        </View>
      </View>

      {/* Premium API Keys */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium TTS Services (Optional)</Text>
        <Text style={styles.sectionDescription}>
          Add API keys to use premium voice services
        </Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>ElevenLabs API Key</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter ElevenLabs API key"
          value={settings.apiKeys.elevenlabs || ''}
          onChangeText={(value) =>
            setSettings({
              ...settings,
              apiKeys: { ...settings.apiKeys, elevenlabs: value },
            })
          }
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Cartesia API Key</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter Cartesia API key"
          value={settings.apiKeys.cartesia || ''}
          onChangeText={(value) =>
            setSettings({
              ...settings,
              apiKeys: { ...settings.apiKeys, cartesia: value },
            })
          }
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Auto-save Progress</Text>
          <Switch
            value={settings.autoSaveProgress}
            onValueChange={(value) =>
              setSettings({ ...settings, autoSaveProgress: value })
            }
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Cache</Text>
          <Switch
            value={settings.cacheEnabled}
            onValueChange={(value) =>
              setSettings({ ...settings, cacheEnabled: value })
            }
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={saveSettings}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Text>
      </TouchableOpacity>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>App</Text>
          <Text style={styles.aboutValue}>ReadAloud</Text>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.dangerText]}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
  pickerContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  picker: {
    width: 150,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  aboutLabel: {
    fontSize: 14,
    color: '#666',
  },
  aboutValue: {
    fontSize: 14,
    color: '#000',
  },
  dangerText: {
    color: '#FF3B30',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
});
