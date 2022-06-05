
export default {
  name: "Stability_Task_touch",
  description: "This activity contains Stability tracker item.",
  activityType: "CST_TOUCH",
  items: [
    {
      name: "instructions",
      question: "In this task, you will see a disc that will drift either to the left or right side of the screen.\n Your job will be to keep the disc in the middle of the screen.\n If the disc is moving to the right, tap left side of control bar to bring it back to the center.\n If the disc is moving to the left, tap right side of control bar to bring the disc back to center.\n Do not let the disc touch the walls to the far left or right of the screen.\n There will be two phases to this task, a Challenge Phase, and a Focus Phase.",
      description: "Instructions for Stability Tracker",
      ui: {
        inputType: "markdownMessage",
        allow: ["disableBack"]
      }
    },
    {
      name: "calibration-instructions",
      question: "This is the Challenge Phase.\n There will be 3 trials.\n Each trial will begin at an easy level, but it will become more difficult to keep the disc at the center of the screen.\n Eventually, you will lose control of the disc.\n When it hits a wall at the edge of the screen, the trial ends and the disc will be moved back to the center of the screen.\n Try to keep the disc away from the walls for as long as possible on each trial.",
      ui: {
        inputType: "markdownMessage",
        allow: ["disableBack"]
      }
    },
    {
      name: "calibration-phase",
      ui: {
        inputType: "stabilityTracker",
        allow: ["disableBack"]
      },
      inputOptions: [
        {
          "@type": "schema:Number",
          "schema:name": "maxOffTargetTime",
          "schema:numberOfItems": 15
        },
        {
          "@type": "schema:Number",
          "schema:name": "numTestTrials",
          "schema:value": 10
        },
        {
          "@type": "schema:Text",
          "schema:name": "taskMode",
          "schema:value": "pseudo_stair"
        },
        {
          "@type": "schema:Number",
          "schema:name": "trackingDims",
          "schema:value": 2
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showScore",
          "schema:value": true
        },
        {
          "@type": "schema:Text",
          "schema:name": "phaseType",
          "schema:value": "challenge-phase"
        },
        {
          "@type": "schema:Double",
          "schema:name": "lambdaSlope",
          "schema:value": 20
        },
        {
          "@type": "schema:Text",
          "schema:name": "basisFunc",
          "schema:value": "zeros_1d"
        },
        {
          "@type": "schema:Double",
          "schema:name": "noiseLevel",
          "schema:value": 0
        },
        {
          "@type": "schema:Double",
          "schema:name": "taskLoopRate",
          "schema:value": 0.0167
        },
        {
          "@type": "schema:Double",
          "schema:name": "cyclesPerMin",
          "schema:value": 2
        },
        {
          "@type": "schema:Double",
          "schema:name": "durationMins",
          "schema:value": 5
        },
        {
          "@type": "schema:Number",
          "schema:name": "trialNumber",
          "schema:value": 3
        },
        {
          "@type": "schema:Double",
          "schema:name": "oobDuration",
          "schema:value": 0.2,
        },
        {
          "@type": "schema:Double",
          "schema:name": "initialLambda",
          "schema:value": 0.075
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showPreview",
          "schema:value": true
        },
        {
          "@type": "schema:Number",
          "schema:name": "numPreviewStim",
          "schema:value": 0
        },
        {
          "@type": "schema:Number",
          "schema:name": "previewStepGap",
          "schema:value": 100
        },
        {
          "@type": "schema:Number",
          "schema:name": "dimensionCount",
          "schema:value": 1
        },
        {
          "@type": "schema:Text",
          "schema:name": "userInputType",
          "schema:value": "touch"
        },
        {
          "@type": "schema:Double",
          "schema:name": "maxRad",
          "schema:value": 0.26167
        }
      ]
    },
    {
      name: "continuous-instructions",
      question: "This is the Focus Phase.\n This phase will last 5 minutes.\n The trial will begin at an easy level, and will increase to a level that should not be very difficult.\n Your task will be to focus on keeping the disc in the center of the screen, without letting it drift off center.\n If you lose control of the disc and it hits a wall, the disc will be moved back to the center of the screen and the task will continue.",
      ui: {
        inputType: "markdownMessage",
        allow: ["disableBack"]
      }
    },
    {
      name: "continuous-phase",
      ui: {
        inputType: "stabilityTracker",
        allow: ["disableBack"]
      },
      inputOptions: [
        {
          "@type": "schema:Number",
          "schema:name": "maxOffTargetTime",
          "schema:numberOfItems": 15
        },
        {
          "@type": "schema:Number",
          "schema:name": "numTestTrials",
          "schema:value": 10
        },
        {
          "@type": "schema:Text",
          "schema:name": "taskMode",
          "schema:value": "pseudo_stair"
        },
        {
          "@type": "schema:Number",
          "schema:name": "trackingDims",
          "schema:value": 2
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showScore",
          "schema:value": true
        },
        {
          "@type": "schema:Text",
          "schema:name": "phaseType",
          "schema:value": "focus-phase"
        },
        {
          "@type": "schema:Double",
          "schema:name": "lambdaSlope",
          "schema:value": 20
        },
        {
          "@type": "schema:Text",
          "schema:name": "basisFunc",
          "schema:value": "zeros_1d"
        },
        {
          "@type": "schema:Double",
          "schema:name": "noiseLevel",
          "schema:value": 0
        },
        {
          "@type": "schema:Double",
          "schema:name": "taskLoopRate",
          "schema:value": 0.0167
        },
        {
          "@type": "schema:Double",
          "schema:name": "cyclesPerMin",
          "schema:value": 2
        },
        {
          "@type": "schema:Double",
          "schema:name": "durationMins",
          "schema:value": 5
        },
        {
          "@type": "schema:Number",
          "schema:name": "trialNumber",
          "schema:value": 0
        },
        {
          "@type": "schema:Double",
          "schema:name": "oobDuration",
          "schema:value": 0.2,
        },
        {
          "@type": "schema:Double",
          "schema:name": "initialLambda",
          "schema:value": 0.075
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showPreview",
          "schema:value": true
        },
        {
          "@type": "schema:Number",
          "schema:name": "numPreviewStim",
          "schema:value": 0
        },
        {
          "@type": "schema:Number",
          "schema:name": "previewStepGap",
          "schema:value": 100
        },
        {
          "@type": "schema:Number",
          "schema:name": "dimensionCount",
          "schema:value": 1
        },
        {
          "@type": "schema:Text",
          "schema:name": "userInputType",
          "schema:value": "touch"
        },
        {
          "@type": "schema:Double",
          "schema:name": "maxRad",
          "schema:value": 0.26167
        }
      ]
    }
  ]
}
