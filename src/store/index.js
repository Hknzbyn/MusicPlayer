import {makeObservable, observable, action, computed, runInAction} from 'mobx';

import TrackPlayer, {
  Capability,
  useTrackPlayerEvents,
  usePlaybackState,
  TrackPlayerEvents,
  STATE_PLAYING,
  Event,
} from 'react-native-track-player';

import {PLAYBACK_TRACK_CHANGED} from 'react-native-track-player';

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
};

class Store {
  storeTrackId = 0;
  constructor() {
    makeObservable(this, {
      storeTrackId: observable,
      onPlaySkip: action,
      formatTime: action,
      goPrev: action,
      goNext: action,
    });
  }

  //Show Time (min:sec)
  formatTime = secs => {
    let minutes = Math.floor(secs / 60);
    let seconds = Math.ceil(secs - minutes * 60);

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  };

  //change song specific_Song
  onPlaySkip = trackIndex => {
    TrackPlayer.skip(trackIndex);
    runInAction(() => {
      this.storeTrackId = trackIndex;
    });
  };

  //change song next_Song
  goNext = () => {
    TrackPlayer.skipToNext();
    runInAction(() => {
      if (this.storeTrackId === 5) {
        this.storeTrackId === 0;
      } else {
        this.storeTrackId++;
      }
    });
  };

  //change song previous_Song
  goPrev = () => {
    TrackPlayer.skipToPrevious();
    runInAction(() => {
      if (this.storeTrackId === 0) {
        this.storeTrackId === 5;
      } else {
        this.storeTrackId--;
      }
    });
  };
}

export default new Store();
