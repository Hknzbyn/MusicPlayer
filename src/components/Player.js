import React, {useEffect, useState, useRef} from 'react';
import {
  Text,
  Modal,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Pressable,
  Alert,
  FlatList,
  Animated,
  SafeAreaView,
  Image,
} from 'react-native';
const {width, height} = Dimensions.get('window');
import TrackPlayer, {
  Capability,
  useTrackPlayerEvents,
  usePlaybackState,
  TrackPlayerEvents,
  STATE_PLAYING,
  Event,
  PLAYBACK_TRACK_CHANGED,
} from 'react-native-track-player';

import SliderBar from '../components/SliderBar';
import songs from '../songs';

import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';

import {inject, observer} from 'mobx-react';

//imp RNTrackPlayer...
const TRACK_PLAYER_CONTROLS_OPTS = {
  waitforBuffer: true,
  stopWithApp: false,
  alwaysPauseOnInterruption: true,
  capabilities: [
    TrackPlayer.CAPABILITY_PLAY,
    TrackPlayer.CAPABILITY_PAUSE,
    TrackPlayer.CAPABILITY_SKIP,

    TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
    TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
    TrackPlayer.CAPABILITY_SEEK_TO,
  ],
  compactCapabilities: [
    TrackPlayer.CAPABILITY_PLAY,
    TrackPlayer.CAPABILITY_PAUSE,
    TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
    TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
  ],
};

const Player = props => {
  const {storeTrackId, onPlaySkip, goPrev, goNext} = props.store;

  const [modalVisible, setModalVisible] = useState(false);
  const [songIndex, setSongIndex] = useState(0);

  //Anim
  const PlayPauseAnim = React.useRef(null);
  const SoundAnim = React.useRef(null);
  const [timer, setTimer] = useState(0);

  //Player
  const isPlaying = useRef('paused'); //paused play loading
  const playbackState = usePlaybackState();
  const isPlayerReady = useRef(false);
  const index = useRef(0);
  const isItFromUser = useRef(true);

  //Lottie and Player settings
  useEffect(() => {
    console.log('Player State', playbackState);
    //set the player state
    if (playbackState === 'playing' || playbackState === 3) {
      isPlaying.current = 'playing';
      PlayPauseAnim.current?.play(50, 0);
      const ClosedModalLottie = setInterval(() => {
        setTimer(timer => timer + 1);
        SoundAnim.current?.play(100, 130);
        //SoundAnim.current?.play(130, 100);
      }, 1000);

      return () => {
        PlayPauseAnim.current?.reset(null);
        clearInterval(ClosedModalLottie);
      };
    } else if (playbackState === 'paused' || playbackState === 2) {
      isPlaying.current = 'paused';
      PlayPauseAnim.current?.play(0, 50);
      SoundAnim.current?.play(1, 1);

      return () => {
        PlayPauseAnim.current?.reset(null);
        SoundAnim.current?.reset(null);
      };
    } else {
      isPlaying.current = 'loading';
      SoundAnim.current?.play(1, 1);
    }
    return () => {
      PlayPauseAnim.current?.reset(null);
      SoundAnim.current?.reset(null);
    };
  }, [playbackState, modalVisible]);

  //Track-Player Setup
  useEffect(() => {
    TrackPlayer.setupPlayer().then(async () => {
      await TrackPlayer.reset();
      await TrackPlayer.add(songs);
      TrackPlayer.play();
      isPlayerReady.current = true;
      await TrackPlayer.updateOptions(TRACK_PLAYER_CONTROLS_OPTS);

      //add listener on track change
      TrackPlayer.addEventListener(PLAYBACK_TRACK_CHANGED, async e => {
        const trackId = await TrackPlayer.getCurrentTrack(); //get the current id

        if (trackId !== index.current) {
          setSongIndex(trackId);
          isItFromUser.current = false;

          if (trackId > index.current) {
            goNext;
          } else {
            goPrev;
          }
          setTimeout(() => {
            isItFromUser.current = true;
          }, 200);
        }
      });

      TrackPlayer.addEventListener(TrackPlayerEvents.REMOTE_DUCK, e => {
        if (e.paused) {
          TrackPlayer.pause();
        } else {
          TrackPlayer.play();
        }
      });
    });
    return () => {
      TrackPlayer.destroy();
    };
  }, []);

  //Change Track with mobx actions
  useEffect(() => {
    if (storeTrackId !== songIndex) {
      setSongIndex(storeTrackId);
      index.current = storeTrackId;
    } else {
      setSongIndex(songIndex);
    }
  }, [storeTrackId, songIndex]);

  //Change song & re-render
  useEffect(() => {
    if (isPlayerReady.current && isItFromUser.current) {
      onPlaySkip(songs[songIndex].id);
    }

    index.current = storeTrackId;
  }, [songIndex]);

  //Modal open song images
  const renderPlayerImage = () => {
    return (
      <View style={styles.PlayerImage}>
        <Image
          style={{
            height: 320,
            width: 320,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          resizeMode="contain"
          source={songs[songIndex].artwork}
        />
      </View>
    );
  };

  //Modal close - button Images
  const renderSmallImage = () => {
    return (
      <View>
        <Image
          style={styles.SmallPlayerImage}
          resizeMode="cover"
          source={songs[songIndex].artwork}
        />
      </View>
    );
  };

  //Pause/Play Btn
  const onPlayPause = () => {
    if (isPlaying.current === 'playing') {
      TrackPlayer.pause();
    } else if (isPlaying.current === 'paused') {
      TrackPlayer.play();
    }
  };

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* Modal is open - PlayerArea */}
            <View style={styles.PlayerArea}>
              <View style={styles.ImageArea}>
                <SafeAreaView
                  style={{
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    height: height,
                    maxHeight: 350,
                  }}>
                  <SafeAreaView style={{height: 320}}>
                    <FlatList
                      scrollEnabled={false}
                      pagingEnabled={false}
                      data={songs}
                      renderItem={renderPlayerImage}
                      keyExtractor={songs => songs.id}
                    />
                  </SafeAreaView>
                </SafeAreaView>
              </View>
              <View style={styles.TrackTextArea}>
                <Text style={styles.ArtistText}>{songs[songIndex].artist}</Text>
                <Text style={styles.SongText}>{songs[songIndex].title}</Text>
              </View>

              <View style={styles.SliderArea}>
                <SliderBar />
              </View>

              <View style={styles.ControllerArea}>
                <TouchableOpacity
                  onPress={() => goPrev(storeTrackId - 1)}
                  style={styles.ControllerIconArea}>
                  <MaterialCommunityIcons
                    size={50}
                    color={'white'}
                    name="skip-previous"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onPlayPause}
                  style={styles.ControllerIconArea}>
                  <LottieView
                    ref={PlayPauseAnim}
                    style={{
                      height: height * 0.12,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    source={require('../../assets/lottie/13053-play.json')}
                    autoPlay={true}
                    loop={false}
                    speed={5}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => goNext(storeTrackId + 1)}
                  style={styles.ControllerIconArea}>
                  <MaterialCommunityIcons
                    size={50}
                    color={'white'}
                    name="skip-next"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.exitview}>
                <Pressable onPress={() => setModalVisible(!modalVisible)}>
                  <AntDesign size={25} color={'white'} name="close" />
                </Pressable>
              </View>
            </View>
            {/*END* Modal is open - PlayerArea */}
          </View>
        </View>
      </Modal>

      {/* Modal is closed - Button_version - SmallPlayerArea */}
      <TouchableOpacity
        onPress={() => setModalVisible(!modalVisible)}
        style={styles.SmallPlayerArea}>
        <View style={styles.SmallImageArea}>
          <View style={styles.SmallPlayerImage}>
            <FlatList
              scrollEnabled={false}
              pagingEnabled={false}
              data={songs}
              renderItem={renderSmallImage}
              keyExtractor={songs => songs.id}
            />
          </View>
        </View>
        <View style={styles.SmallTextArea}>
          <View>
            <Text style={styles.SmallArtistText}>
              {songs[songIndex].artist}
            </Text>

            <Text style={styles.SmallSongText}>{songs[songIndex].title}</Text>
          </View>

          <View>
            <LottieView
              ref={SoundAnim}
              style={styles.SoundLottie}
              source={require('../../assets/lottie/lf20_6jfc4gby.json')}
              autoSize={false}
              autoPlay={true}
              loop={false}
              speed={0.8}
            />
          </View>
        </View>

        <View style={styles.SmallControllerArea}>
          <TouchableOpacity
            onPress={goPrev}
            style={styles.SmallControllerIconArea}>
            <MaterialCommunityIcons
              size={30}
              color={'white'}
              name="skip-previous"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onPlayPause}
            style={styles.SmallControllerIconArea}>
            <LottieView
              ref={PlayPauseAnim}
              style={{
                height: height * 0.07,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={require('../../assets/lottie/13053-play.json')}
              autoPlay={true}
              loop={false}
              speed={5}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goNext}
            style={styles.SmallControllerIconArea}>
            <MaterialCommunityIcons
              size={30}
              color={'white'}
              name="skip-next"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      {/*END* Modal is closed - Button_version - SmallPlayerArea */}
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  //Modal open view
  modalView: {
    margin: 20,
    backgroundColor: '#FFBF86', //#FED2AA
    borderRadius: 0,

    borderWidth: 0.4,
    borderColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: height,
    width: width,
  },

  // Modal open Player
  PlayerArea: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal open Image
  ImageArea: {
    height: 320,
    width: 320,

    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: 'green',
  },

  //Modal open Image
  TrackImageArea: {
    height: height * 0.55,
    width: width * 0.9,
    borderRadius: 10,
    shadowColor: '#F3F0D7',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.75,
    shadowRadius: 25,
    elevation: 5,
    justifyContent: 'center',
    justifyContent: 'center',
    //backgroundColor: 'yellow',
  },

  TrackTextArea: {
    height: height * 0.12,
    width: width * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: 'orange',
  },

  ArtistText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },

  SongText: {
    fontSize: 30,
    fontWeight: '100',
    opacity: 0.75,
    color: 'white',
    textAlign: 'center',
  },

  SliderArea: {
    height: height * 0.1,
    width: width * 0.9,
    //backgroundColor: 'purple',
    justifyContent: 'center',
  },

  // Btn Area
  ControllerArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: height * 0.15,
    width: width * 0.9,
    //backgroundColor: 'black',
  },

  ControllerIconArea: {
    height: height * 0.07,
    width: width * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: 'green',
  },

  //exit icon area view
  exitview: {
    width: width * 0.2,
    height: height * 0.07,
    justifyContent: 'flex-end',
    alignItems: 'center',
    //backgroundColor: 'green',
  },

  //Modal close - button view
  SmallPlayerArea: {
    elevation: 1,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.4,
    borderColor: 'gray',
    height: height * 0.15,
    width: width,
    backgroundColor: '#FED2AA',
  },

  SmallImageArea: {
    height: height * 0.14,
    width: width * 0.2,

    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: 'red',
  },
  PlayerImage: {
    height: 320,
    width: 320,
  },

  SmallPlayerImage: {
    height: 65,
    width: 65,
    borderRadius: 60 / 2,
  },

  SmallTextArea: {
    height: height * 0.14,
    width: width * 0.46,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: 'blue',
  },
  //SoundLottieStyles
  SoundLottie: {
    height: width * 0.05,
    width: width * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },

  SmallArtistText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    //marginLeft: 5,
  },

  SmallSongText: {
    fontSize: 19,
    fontWeight: '100',
    color: 'white',
    textAlign: 'center',

    opacity: 0.8,
    //marginLeft: 5,
  },

  SmallControllerArea: {
    flexDirection: 'row',
    height: height * 0.14,
    width: width * 0.33,
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: 'purple',
  },

  SmallControllerIconArea: {
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: 'black',
  },
});

export default inject('store')(observer(Player));
