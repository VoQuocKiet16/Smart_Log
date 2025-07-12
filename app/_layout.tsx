import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { Text, View } from "react-native";
import Index from "./index";
import LoginScreen from "./login";
import TeacherInputScreen from "./teacher-input";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CustomHeader() {
  const [username, setUsername] = React.useState("");
  React.useEffect(() => {
    AsyncStorage.getItem("userToken").then((userStr) => {
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUsername(user.username);
        } catch {}
      }
    });
  }, []);
  return (
    <View>
      <Text style={{ fontWeight: "bold", fontSize: 20, color: "#4A90E2" }}>Quản Lý Sổ Đầu Bài</Text>
      {username ? (
        <Text style={{ fontSize: 14, color: "#888", marginTop: 2, marginBottom: 10, textAlign: 'center', width: '100%' }}>Xin chào {username}</Text>
      ) : null}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          // Chỉ có 1 tab nên iconName luôn là "home" hoặc bạn muốn icon khác thì đổi ở đây
          return <MaterialCommunityIcons name="home" size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "#999"
      })}
    >
      <Tab.Screen 
        name="Control" 
        component={Index} 
        options={{ 
          headerTitle: () => <CustomHeader />, 
          title: "" 
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Index" component={MainTabs} />
      <Stack.Screen name="Teacher-Input" component={TeacherInputScreen} />
    </Stack.Navigator>
  );
}
