import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';

// import firebase functions for quering data
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

// Importing storage for native apps
import AsyncStorage from '@react-native-async-storage/async-storage';

import React from 'react';
import { useState, useEffect } from 'react';

const ShoppingListsRealTime = ({ db, route, isConnected }) => {
  const { userID } = route.params;

  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');
  const [item1, setItem1] = useState('');
  const [item2, setItem2] = useState('');

  let unsubShoppinglists;

  /* useEffect() attaches listener only once, when component is mounted
  [] - dependency array is empty, we don't need to call useEffect more then once
  it will will be automatically run whenever there’s a change in the targeted database reference
  onSnapshot() - cheks whether there were any changes in collection and its documents. Arguments:
  - collection(db, 'shoppinglists') - reference that you attach the listener to
  - The callback function that’s called whenever there’s a change detected in the reference.
  In this case in callback function we get id and key/value of the items and pushh them to newList array
  then we set newLists as a value for lists setLists(newLists);
  */
  useEffect(() => {
    if (isConnected === true) {
      // unregister current onSnapshot() listener to avoid registering multiple listeners when
      // useEffect code is re-executed.
      if (unsubShoppinglists) unsubShoppinglists();
      unsubShoppinglists = null;

      const q = query(
        collection(db, 'shoppinglists'),
        where('uid', '==', userID)
      );
      unsubShoppinglists = onSnapshot(q, (documentsSnapshot) => {
        let newLists = [];
        documentsSnapshot.forEach((doc) => {
          newLists.push({ id: doc.id, ...doc.data() });
        });
        cacheShoppingLists(newLists);
        setLists(newLists);
      });
    } else {
      loadCachedLists();
    }

    // code to execute when the component will be unmounted
    // to clean the memory when listener is not needed any more
    return () => {
      if (unsubShoppinglists) unsubShoppinglists();
    };
  }, [isConnected]);

  // async function that sets lists with cached value
  // || [] will assign an empty array to cachedLists if when the shopping_lists item hasn’t been set yet in AsyncStorage
  const loadCachedLists = async () => {
    const cachedLists = (await AsyncStorage.getItem('shopping_lists')) || [];
    setLists(JSON.parse(cachedLists));
  };

  // cashing data whenever it is updated
  // try-catch function - to prevent the app from crashing in case AsyncStorage fails to store the data.
  const cacheShoppingLists = async (listsToCache) => {
    try {
      await AsyncStorage.setItem(
        'shopping_lists',
        JSON.stringify(listsToCache)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  const addShoppingList = async (newList) => {
    /*addDoc will add new document to collection and generate id
    we use db - database intialised in the App.js
    shoppinglists - name of the collection
    newList - object created from user inputs (listName, item1, item2)*/
    const newListRef = await addDoc(collection(db, 'shoppinglists'), newList);

    /*If new document was successfuly created .id and .data() will be set on it.
    if newListRef.id exists (true) - alert success message
    if newListRef.id doesn't exist (false) - alert fail message*/
    if (newListRef.id) {
      setLists([newList, ...lists]);
      Alert.alert(`The list '${listName}' has been added`);
    } else {
      Alert.alert(`Unable to add. Please try later`);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.listsContainer}
        data={lists}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>
              {/* The array function join() converts an array into a string.
             adds a separator string between each element from the array once concatenated*/}
              {item.name}: {item.items.join(', ')}
            </Text>
          </View>
        )}
      />

      {/* This code uses a ternary-operator-based conditional that checks the isConnected state. 
      If it’s true, the form will be rendered; 
      otherwise, nothing (null) will be rendered.*/}
      {isConnected === true ? (
        <View style={styles.listForm}>
          <TextInput
            style={styles.listName}
            placeholder='List Name'
            value={listName}
            onChangeText={setListName}
          />
          <TextInput
            style={styles.item}
            placeholder='Item #1'
            value={item1}
            onChangeText={setItem1}
          />
          <TextInput
            style={styles.item}
            placeholder='Item #2'
            value={item2}
            onChangeText={setItem2}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              const newList = {
                uid: userID,
                name: listName,
                items: [item1, item2],
              };
              if (
                newList.uid !== '' &&
                newList.name !== '' &&
                newList.items !== []
              ) {
                addShoppingList(newList);
              } else
                Alert.alert("You need to add name of the list and it's items");
            }}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView behavior='padding' />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listItem: {
    height: 70,
    justifyContent: 'center',
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#AAA',
    flex: 1,
    flexGrow: 1,
  },
  listForm: {
    flexBasis: 275,
    flex: 0,
    margin: 15,
    padding: 15,
    backgroundColor: '#CCC',
  },
  listName: {
    height: 50,
    padding: 15,
    fontWeight: '600',
    marginRight: 50,
    marginBottom: 15,
    borderColor: '#555',
    borderWidth: 2,
  },
  item: {
    height: 50,
    padding: 15,
    marginLeft: 50,
    marginBottom: 15,
    borderColor: '#555',
    borderWidth: 2,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#000',
    color: '#FFF',
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 20,
  },
});

export default ShoppingListsRealTime;
