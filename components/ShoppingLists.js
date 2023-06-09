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
import { collection, getDocs, addDoc } from 'firebase/firestore';

import React from 'react';
import { useState, useEffect } from 'react';

const ShoppingLists = ({ db }) => {
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');
  const [item1, setItem1] = useState('');
  const [item2, setItem2] = useState('');

  const fetchShoppingLists = async () => {
    /*db - database object passed as props from App.js
  shoppinglists - name of the collection in firebase*/
    const listsDocuments = await getDocs(collection(db, 'shoppinglists'));

    /* newLists array will be full filled in forEach() loop*/
    let newLists = [];

    /* forEach() will help to get:
  - document id
  - the actuale document properties (name and items)
  .push - adds an object to the newLists variable
  using the ... operator, the properties of docObject.data() will be spread out - we will get it one by one (key: value), not as an object.*/
    listsDocuments.forEach((docObject) => {
      newLists.push({ id: docObject.id, ...docObject.data() });
    });

    /* state setter function that assignes ne array to the lists state */
    setLists(newLists);
  };

  /* useEffect() fetches data object from db
  ${lists} is in the dependency array of useEffect, 
  we force a render cycle in case the lists state has been changed
  listsDocuments represents your shoppinglists documents */
  useEffect(() => {
    fetchShoppingLists();
  }, [`${lists}`]);

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
            const newList = { name: listName, items: [item1, item2] };
            addShoppingList(newList);
          }}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
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

export default ShoppingLists;
