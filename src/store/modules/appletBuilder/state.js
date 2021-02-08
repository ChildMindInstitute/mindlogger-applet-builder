
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
    activities: []
  },
  baseImageURL,
  itemInputTypes: [
    {
      text: "radio",
      icon: baseImageURL + 'save-icon.png',
    },
    {
      text: "text",
      icon: baseImageURL + 'save-icon.png',
    },
    {
      text: "slider",
      icon: baseImageURL + 'save-icon.png',
    },
    {
      text: "photo",
      icon: baseImageURL + 'save-icon.png',
    },
    {
      text: "video",
      icon: baseImageURL + 'save-icon.png',
    },
    {
      text: "timeRange",
      icon: baseImageURL + 'save-icon.png',
    },
    {
      text: "date",
      icon: baseImageURL + 'save-icon.png',
    },
    {
      text: "drawing",
      icon: baseImageURL + 'save-icon.png',
    },
    {
      text: "audioRecord",
      icon: baseImageURL + 'save-icon.png',
    },
    {
      text: "audioImageRecord",
      icon: baseImageURL + 'save-icon.png',
    },
    {
      text: "geolocation",
      icon: baseImageURL + 'save-icon.png',
    },
    {
      text: "audioStimulus",
      icon: baseImageURL + 'save-icon.png',
    },
    {
      text: "markdownMessage",
      icon: baseImageURL + 'save-icon.png',
    },
    {
      text: "cumulativeScore",
      icon: baseImageURL + 'save-icon.png',
    },
  ],
  templates: [],
  original: null,
  currentScreen: config.PROTOCOL_SCREEN,
  currentActivity: null,
}
