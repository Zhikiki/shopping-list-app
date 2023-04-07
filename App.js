import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert, LogBox } from 'react-native';

import { useEffect } from 'react';

// import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import firebase functions for initialisation Cloud Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// import firebase functions that disable/enable connection to DB when internet connection lost/exist
import { disableNetwork, enableNetwork } from 'firebase/firestore';

// import package to verify internet connection
import { useNetInfo } from '@react-native-community/netinfo';

// import the screens
import ShoppingLists from './components/ShoppingLists';
import ShoppingListsRealTime from './components/ShoppingListsRealTime';
import Welcome from './components/Welcome';

const Stack = createNativeStackNavigator();

const App = () => {
  // definition of the state that represents the network connectivity status
  const connectionStatus = useNetInfo();

  /* Checks if user is connected to the internet 
  connectionStatus.isConnected - is useEffect() dependency []
  useEffect will be every time re-executed every time when value of dependency changes
  */
  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert('Connection lost!');
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);

  // web app's Firebase configuration
  const firebaseConfig = {
    apiKey: 'AIzaSyBpN2c6Pdh1yGcjb8JASZzDNW2nVImo6Y0',
    authDomain: 'shopping-list-demo-9d936.firebaseapp.com',
    projectId: 'shopping-list-demo-9d936',
    storageBucket: 'shopping-list-demo-9d936.appspot.com',
    messagingSenderId: '797816656388',
    appId: '1:797816656388:web:de133c86a74ea731f1db51',
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  // Initialize Cloud Firestore and get a reference to the service
  const db = getFirestore(app);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Welcome'>
        <Stack.Screen name='Welcome' component={Welcome} />
        <Stack.Screen name='ShoppingListsRealTime'>
          {/* {(props) => <ShoppingLists db={db} {...props} />} */}
          {(props) => (
            <ShoppingListsRealTime
              db={db}
              isConnected={connectionStatus.isConnected}
              {...props}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
