import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Image,
  Alert,
  Animated,
} from 'react-native';
const {width, height} = Dimensions.get('window');

import {inject, observer} from 'mobx-react';
import Player from '../components/Player';
import songs from '../songs';

const SongList = props => {
  const {formatTime, onPlaySkip} = props.store;

  const renderTrackItem = ({item, id}) => {
    return (
      <TouchableOpacity
        onPress={() => onPlaySkip(item.id)}
        style={styles.itemContainer}>
        <View style={styles.ImageArea}>
          <Image
            style={{height: height * 0.12, width: width * 0.18}}
            resizeMode="contain"
            source={item.artwork}
          />
        </View>

        <View style={styles.TextArea}>
          <Text style={styles.ArtistText}> {item.artist} </Text>
          <Text style={styles.SongText}> {item.title} </Text>
        </View>
        <View style={styles.TimeArea}>
          <TouchableOpacity>
            <Text style={styles.TimeText}>{formatTime(item.duration)}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={songs}
        renderItem={renderTrackItem}
        keyExtractor={songs => songs.id}
      />
      <View style={styles.PlayerArea}>
        <Player />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#323232',
  },
  PlayerArea: {
    height: height * 0.16,
    width: width,
    justifyContent: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: height * 0.12,
    width: width * 0.96,
    marginVertical: 11,
    backgroundColor: '#6DB193',
  },
  TimeText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '400',
    opacity: 0.85,
  },

  ImageArea: {
    flex: 1,
    height: height * 0.12,
    width: width * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: 'green',
  },
  ImageStyle: {
    height: 25,
    width: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  TextArea: {
    height: height * 0.12,
    width: width * 0.54,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: 'yellow',
  },
  TimeArea: {
    height: height * 0.12,
    width: width * 0.21,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: 'purple',
  },
  ArtistText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  SongText: {
    fontSize: 23,
    fontWeight: '100',
    opacity: 0.75,
    color: 'white',
    textAlign: 'center',
  },
});
export default inject('store')(observer(SongList));
