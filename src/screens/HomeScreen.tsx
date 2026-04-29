import React, {useCallback, useState} from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import MenuButton from '../components/MenuButton';
import {RootStackParamList} from '../types/navigation';
import {getUsername, saveUsername} from '../storage/userStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  useFocusEffect(
    useCallback(() => {
      const loadUsername = async () => {
        const storedUsername = await getUsername();

        if (storedUsername) {
          setUsername(storedUsername);
          setNewUsername(storedUsername);
        }
      };

      loadUsername();
    }, []),
  );

  const openNameModal = () => {
    setNewUsername(username);
    setIsNameModalVisible(true);
  };

  const closeNameModal = () => {
    setIsNameModalVisible(false);
    setNewUsername(username);
  };

  const handleSaveUsername = async () => {
    const trimmedUsername = newUsername.trim();

    if (!trimmedUsername) {
      Alert.alert('Eksik Bilgi', 'Kullanıcı adı boş bırakılamaz.');
      return;
    }

    await saveUsername(trimmedUsername);
    setUsername(trimmedUsername);
    setIsNameModalVisible(false);

    Alert.alert('Başarılı', 'Kullanıcı adı güncellendi.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={openNameModal} activeOpacity={0.8}>
          <Text style={styles.usernameLabel}>Oyuncu</Text>
          <Text style={styles.usernameText}>{username || 'Oyuncu'}</Text>
          <Text style={styles.changeHint}>Değiştirmek için dokun</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Word Crush</Text>

        <MenuButton title="Yeni Oyun" onPress={() => navigation.navigate('NewGame')} />
        <MenuButton
          title="Skor Tablosu"
          onPress={() => navigation.navigate('Scoreboard')}
        />
        <MenuButton title="Market" onPress={() => navigation.navigate('Market')} />
      </View>

      <Modal
        visible={isNameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeNameModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Kullanıcı Adını Değiştir</Text>
            <Text style={styles.modalDescription}>
              Ana ekranda görünecek oyuncu adını yaz.
            </Text>

            <TextInput
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Kullanıcı adı"
              style={styles.input}
              maxLength={20}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeNameModal}>
                <Text style={styles.cancelButtonText}>Vazgeç</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveUsername}>
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4E8',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  usernameLabel: {
    fontSize: 12,
    color: '#8C7B75',
    marginBottom: 2,
  },
  usernameText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#7A4E00',
  },
  changeHint: {
    fontSize: 11,
    color: '#9F7C3A',
    marginTop: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    color: '#3B2F2F',
    marginBottom: 40,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6D7BE',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3B2F2F',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: '#5C4B51',
    lineHeight: 22,
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E6D7BE',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#3B2F2F',
    backgroundColor: '#F8F4E8',
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#8C7B75',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#D98E04',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});