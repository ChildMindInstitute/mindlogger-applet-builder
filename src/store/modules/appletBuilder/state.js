
import config from '../../../config';

const baseImageURL = 'https://raw.githubusercontent.com/jj105/applet-builder-images/master/';
export default {
  protocol: {
    id: '',
    description: '',
    markdownData: '',
    name: '',
    protocolVersion: '',
    isValid: false,
    prizeActivity: null,
    activities: []
  },
  baseImageURL,
  itemInputTypes: [
    {
      text: "radio",
      icon: baseImageURL + 'item-types/radio-icon.png',
    },
    {
      text: 'checkbox',
      icon: baseImageURL + 'item-types/check-box-icon.png',
    },
    {
      text: "text",
      icon: baseImageURL + 'item-types/text-input-icon.png',
    },
    {
      text: "slider",
      icon: baseImageURL + 'item-types/slider-icon.png',
    },
    {
      text: "photo",
      icon: baseImageURL + 'item-types/photo-icon.png',
    },
    {
      text: "video",
      icon: baseImageURL + 'item-types/video-icon.png',
    },
    {
      text: "timeRange",
      icon: baseImageURL + 'item-types/time-range.png',
    },
    {
      text: "date",
      icon: baseImageURL + 'item-types/date-icon.png',
    },
    {
      text: "drawing",
      icon: baseImageURL + 'item-types/drawing-icon.png',
    },
    {
      text: "audioRecord",
      icon: baseImageURL + 'item-types/audio-icon.png',
    },
    {
      text: "audioImageRecord",
      icon: baseImageURL + 'item-types/audio-image-record-icon.png',
    },
    {
      text: "geolocation",
      icon: baseImageURL + 'item-types/geolocation-icon.png',
    },
    {
      text: "audioStimulus",
      icon: baseImageURL + 'item-types/audio-stimulus-icon.png',
    },
    {
      text: "markdownMessage",
      icon: baseImageURL + 'item-types/message-icon.png',
    },
    {
      text: "cumulativeScore",
      icon: baseImageURL + 'item-types/cumulative-icon.png',
    },
  ],
  templates: [],
  original: null,
  currentScreen: config.PROTOCOL_SCREEN,
  currentActivity: null,
}
