
import config from '../../../config';

const baseImageURL = 'https://raw.githubusercontent.com/ChildMindInstitute/mindlogger-applet-builder/master/src/assets/icons/';
export const getInitialProtocol = () => ({
  id: null,
  description: '',
  markdownData: '',
  image: '',
  name: '',
  protocolVersion: '1.0.0',
  valid: false,
  prizeActivity: null,
  activities: [],
  tokenPrizeModal: false
});

export default {
  protocol: getInitialProtocol(),
  baseImageURL,
  templateUpdateRequest: {
    pending: false
  },
  itemInputTypes: [
    {
      text: "radio",
      icon: baseImageURL + 'item-types/radio-icon.png',
    },
    {
      text: "stackedRadio",
      icon: baseImageURL + 'item-types/radio-icon.png',
    },
    {
      text: 'checkbox',
      icon: baseImageURL + 'item-types/check-box-icon.png',
    },
    {
      text: "stackedCheckbox",
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
      text: "stackedSlider",
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
      text: "ageSelector",
      icon: baseImageURL + 'item-types/slider-icon.png',
    },
    {
      text: "markdownMessage",
      icon: baseImageURL + 'item-types/message-icon.png',
    },
    {
      text: "cumulativeScore",
      icon: baseImageURL + 'item-types/cumulative-icon.png',
    },
    {
      text: "pastBehaviorTracker",
      icon: baseImageURL + 'item-types/past-behavior-tracker-icon.png'
    }
  ],
  templates: [],
  versions: null,
  nodeEnv: null,
  original: null,
  currentScreen: config.PROTOCOL_SCREEN,
  currentActivity: null,
  themeId: null,
  originalThemeId: null
}
