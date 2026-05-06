import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './context/ThemeContext';
import LoginScreen from './screens/LoginScreen';
import ScreenGestion from './screens/ScreenGestion';
import ScreenGestionProductos from './screens/ScreenGestionProductos';
import AlertasScreen from './screens/AlertasScreen';
import ScreenGestionRecetas from './screens/ScreenGestionRecetas';
// import HomeScreen from './screens/HomeScreen'; // tu siguiente pantalla

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="ScreenGestion" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ScreenGestion" component={ScreenGestion} />
          <Stack.Screen name="ScreenGestionProductos" component={ScreenGestionProductos} />
          <Stack.Screen name="AlertasScreen" component={AlertasScreen} />
          <Stack.Screen name="ScreenGestionRecetas" component={ScreenGestionRecetas} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}