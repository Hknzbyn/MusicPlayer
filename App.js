import React from 'react';
import {View, Text, SafeAreaView, StyleSheet, Dimensions} from 'react-native';
const {width, height} = Dimensions.get('window');
import {Provider} from 'mobx-react';
import store from './src/store';

import SongList from './src/screens/SongList';
import Header from './src/components/Header';


export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Provider store={store}>
        <View style={styles.container}>
          <Header/>
          <SongList />
        </View>
      </Provider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#323232',
  },
  SongListArea: {
    height: height * 0.92,
    width: width,
    justifyContent: 'center',
  },
});
