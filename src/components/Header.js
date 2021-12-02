import React from 'react';
import {View, Text, Dimensions} from 'react-native';
const {width, height} = Dimensions.get('window');

export default function Header() {
  return (
    <View
      style={{
        width: width,
        height: height * 0.07,
        backgroundColor: '#FFBF86',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth:0.7,
        borderBottomColor:'white'
      }}>
      <Text
        style={{
          color: 'white',
          fontSize: 25,
          fontWeight:'bold',
          textAlign: 'center',
          opacity: 0.7,
        }}>
        SONGS
      </Text>
    </View>
  );
}
