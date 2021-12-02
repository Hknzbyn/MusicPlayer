import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet,Dimensions} from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, {usePlaybackState} from 'react-native-track-player';
import {useTrackPlayerProgress} from 'react-native-track-player';
import {PLAYBACK_TRACK_CHANGED} from 'react-native-track-player';
const { width, height } = Dimensions.get('window');


import {inject, observer} from 'mobx-react';

const SliderBar = props => {
  const {formatTime}=props.store;
  const {position, duration} = useTrackPlayerProgress(1000, null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seek, setSeek] = useState(0);

  
  useEffect(() => {
    TrackPlayer.addEventListener(PLAYBACK_TRACK_CHANGED, () => {
      setIsSeeking(false);
    });
  }, []);


  //change duration with slider
  const handleChange = val => {
    TrackPlayer.seekTo(val);
    TrackPlayer.play().then(() => {
      setTimeout(() => {
        setIsSeeking(false);
      }, 1000);
    });
  };

  return (
    <View style={styles.container}>
      <Slider
        style={{width: width*0.88, height: 40}}
        minimumValue={0}
        value={isSeeking ? seek : position}
        onValueChange={value => {
          TrackPlayer.pause();
          setIsSeeking(true);
          setSeek(value);
        }}
        maximumValue={duration}
        minimumTrackTintColor="#ffffff"
        onSlidingComplete={handleChange}
        maximumTrackTintColor="rgba(255, 255, 255, .5)"
        thumbTintColor="#fff"
      />
      <View style={styles.timeContainer}>
        <Text style={styles.timers}>
          {formatTime(isSeeking ? seek : position)}
        </Text>
        <Text style={styles.timers}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    height: 70,
  },
  timers: {
    color: '#fff',
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default inject('store')(observer(SliderBar));
