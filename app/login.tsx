import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button, Card, TextInput } from 'react-native-paper';

interface User {
  username: string;
  password: string;
  role: 'student' | 'teacher';
}

const hardcodedUsers: User[] = [
  { username: 'nguyenvana', password: '123456', role: 'teacher' },
  { username: 'nguyenvanb', password: '123456', role: 'teacher' },
  { username: 'nguyenvanc', password: '123456', role: 'teacher' },
  { username: 'nguyenvand', password: '123456', role: 'teacher' },
];

const LoginScreen: React.FC = () => {
  const [username, setusername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [usernameError, setUsernameError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const navigation = useNavigation<NavigationProp<any>>();

  const validateInputs = (): boolean => {
    let valid = true;
    setUsernameError('');
    setPasswordError('');
    if (!username) {
      setUsernameError('Vui lòng nhập tên người dùng');
      valid = false;
    }
    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      valid = false;
    }
    return valid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    try {
      const user = hardcodedUsers.find(
        (u) => u.username === username && u.password === password
      );
      if (!user) {
        alert('Tên người dùng hoặc mật khẩu không đúng');
        setLoading(false);
        return;
      }
      await AsyncStorage.setItem('userToken', JSON.stringify(user));
      console.log("Đăng nhập thành công");
      navigation.navigate("Index");
    } catch (error) {
      alert('Đã xảy ra lỗi khi đăng nhập');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title 
          title="Đăng nhập" 
          titleStyle={styles.cardTitle}
        />
        <Card.Content>
          <TextInput
            label="Tên Người Dùng"
            value={username}
            onChangeText={setusername}
            autoCapitalize="none"
            style={styles.input}
            mode="outlined"
            outlineColor={usernameError ? "#E57373" : "#E0E0E0"}
            activeOutlineColor={usernameError ? "#E57373" : "#4A90E2"}
            textColor="#333333"
            left={<TextInput.Icon icon="account" color="#4A90E2" />}
          />
          {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
          <TextInput
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            outlineColor={passwordError ? "#E57373" : "#E0E0E0"}
            activeOutlineColor={passwordError ? "#E57373" : "#4A90E2"}
            textColor="#333333"
            left={<TextInput.Icon icon="lock" color="#4A90E2" />}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          <Button
            mode="contained"
            onPress={handleLogin}
            disabled={loading}
            style={styles.button}
            buttonColor="#4A90E2"
            textColor="#FFFFFF"
            contentStyle={styles.buttonContent}
            icon="login"
          >
            Đăng nhập
          </Button>
          {loading && <ActivityIndicator animating color="#4A90E2" style={styles.loader} />}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  card: {
    width: '90%',
    borderRadius: 16,
    elevation: 4,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#4A90E2',
    fontSize: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  button: {
    borderRadius: 8,
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  loader: {
    marginTop: 12,
  },
  errorText: {
    color: "#E57373",
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
});

export default LoginScreen;