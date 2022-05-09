
export default {
  name: "Flanker_360",
  activityType: "FLANKER",
  description: "This activity contains Flanker item.",
  items: [
    {
      name: "vsr-instructions",
      question: "## General Instructions\n\n\n You will see arrows presented at the center of the screen that point either to the left ‘<’ or right ‘>’.\n Press the left button if the arrow is pointing to the left ‘<’ or press the right button if the arrow is pointing to the right ‘>’.\n These arrows will appear in the center of a line of other items. Sometimes, these other items will be arrows pointing in the same direction, e.g.. ‘> > > > >’, or in the opposite direction, e.g. ‘< < > < <’.\n Your job is to respond to the central arrow, no matter what direction the other arrows are pointing.\n For example, you would press the left button for both ‘< < < < <’, and ‘> > < > >’ because the middle arrow points to the left.\n Finally, in some trials dashes ‘ - ’ will appear beside the central arrow.\n Again, respond only to the direction of the central arrow. Please respond as quickly and accurately as possible.",
      description: "Instructions for the Visual Stimulus Response widget",
      ui: {
        inputType: "markdown-message",
        allow: ["disableBack"]
      }
    },
    {
      name: "practice-instructions",
      question: "## Instructions\n\nNow you will have a chance to practice the task before moving on to the test phase.\nRemember to respond only to the central arrow\n",
      description: "Instructions for the Practice Phase",
      ui: {
        inputType: "markdown-message",
        allow: ["disableBack"]
      }
    },
    {
      name: "trial",
      question: "",
      description: "Flanker practice",
      ui: {
        inputType: "visual-stimulus-response",
        allow: ["disableBack"]
      },
      inputOptions: [
        {
          "@type": "schema:ItemList",
          "schema:name": "trials",
          "schema:numberOfItems": 6,
          "schema:itemListElement": [
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "<<<<<",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "<<><<",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": ">><>>",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": ">>>>>",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "--<--",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "-->--",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            }
          ]
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showFixation",
          "schema:value": true
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showFeedback",
          "schema:value": true
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showResults",
          "schema:value": true
        },
        {
          "@type": "schema:Text",
          "schema:name": "samplingMethod",
          "schema:value": "randomize-order"
        },
        {
          "@type": "schema:Text",
          "schema:name": "nextButton",
          "schema:value": "OK",
        },
        {
          "@type": "schema:Number",
          "schema:name": "sampleSize",
          "schema:value": 5
        },
        {
          "@type": "schema:Number",
          "schema:name": "trialDuration",
          "schema:value": 3000
        },
        {
          "@type": "schema:Number",
          "schema:name": "minimumAccuracy",
          "schema:value": 75
        },
        {
          "@type": "schema:Number",
          "schema:name": "maxRetryCount",
          "schema:value": 3
        },
        {
          "@type": "schema:Number",
          "schema:name": "blockIndex",
          "schema:value": 0
        }
      ]
    },
    {
      name: "test-instructions",
      question: "## Test Instructions\n\nGood job on the practice blocks.\nYou can now move on to the test blocks.\nYou will do the same task as in the practice, responding to the direction of the central arrow.\nYou will complete 3 blocks, each about 3-5 minutes long.\nYou will have  a short break in between these blocks\n",
      description: "Instructions for the Practice Phase",
      ui: {
        inputType: "markdown-message",
        allow: ["disableBack"]
      }
    },
    {
      name: "test1",
      question: "",
      description: "Flanker practice",
      ui: {
        inputType: "visual-stimulus-response",
        allow: ["disableBack"]
      },
      inputOptions: [
        {
          "@type": "schema:ItemList",
          "schema:name": "trials",
          "schema:numberOfItems": 12,
          "schema:itemListElement": [
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "<<<<<",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "<<><<",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": ">><>>",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": ">>>>>",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "--<--",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "-->--",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "<<<<<",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "<<><<",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": ">><>>",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": ">>>>>",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "--<--",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "-->--",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            }
          ]
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showFixation",
          "schema:value": true
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showFeedback",
          "schema:value": false
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showResults",
          "schema:value": true
        },
        {
          "@type": "schema:Text",
          "schema:name": "samplingMethod",
          "schema:value": "randomize-order"
        },
        {
          "@type": "schema:Text",
          "schema:name": "nextButton",
          "schema:value": "Continue",
        },
        {
          "@type": "schema:Number",
          "schema:name": "sampleSize",
          "schema:value": 10
        },
        {
          "@type": "schema:Number",
          "schema:name": "trialDuration",
          "schema:value": 3000
        },
        {
          "@type": "schema:Number",
          "schema:name": "blockIndex",
          "schema:value": 1
        }
      ]
    },
    {
      name: "next-instructions",
      question: "## Instructions\nPress the Next button to start next block.",
      description: "Instructions for the Practice Phase",
      options: {options: []},
      ui: {
        inputType: "markdown-message",
        allow: ["disableBack"]
      }
    },
    {
      name: "test2",
      question: "",
      description: "Flanker practice",
      ui: {
        inputType: "visual-stimulus-response",
        allow: ["disableBack"]
      },
      inputOptions: [
        {
          "@type": "schema:ItemList",
          "schema:name": "trials",
          "schema:numberOfItems": 12,
          "schema:itemListElement": [
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "<<<<<",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "<<><<",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": ">><>>",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": ">>>>>",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "--<--",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "-->--",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "<<<<<",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "<<><<",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": ">><>>",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": ">>>>>",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "--<--",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "-->--",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            }
          ]
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showFixation",
          "schema:value": true
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showFeedback",
          "schema:value": false
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showResults",
          "schema:value": true
        },
        {
          "@type": "schema:Text",
          "schema:name": "samplingMethod",
          "schema:value": "randomize-order"
        },
        {
          "@type": "schema:Text",
          "schema:name": "nextButton",
          "schema:value": "Continue",
        },
        {
          "@type": "schema:Number",
          "schema:name": "sampleSize",
          "schema:value": 10
        },
        {
          "@type": "schema:Number",
          "schema:name": "trialDuration",
          "schema:value": 3000
        },
        {
          "@type": "schema:Number",
          "schema:name": "blockIndex",
          "schema:value": 2
        }
      ]
    },
    {
      name: "next-instructions",
      question: "## Instructions\nPress the Next button to start next block.",
      description: "Instructions for the Practice Phase",
      options: {options: []},
      ui: {
        inputType: "markdown-message",
        allow: ["disableBack"]
      }
    },
    {
      name: "test3",
      question: "",
      description: "Flanker practice",
      ui: {
        inputType: "visual-stimulus-response",
        allow: ["disableBack"]
      },
      inputOptions: [
        {
          "@type": "schema:ItemList",
          "schema:name": "trials",
          "schema:numberOfItems": 12,
          "schema:itemListElement": [
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "<<<<<",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "<<><<",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": ">><>>",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": ">>>>>",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "--<--",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "-->--",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "<<<<<",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "<<><<",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": ">><>>",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": ">>>>>",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "--<--",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 0
            },
            {
              "@type": "schema:Property",
              "schema:name": "q1",
              "schema:image": "-->--",
              "responseOptions": {
                "@type": "xsd:anyURI",
                "choices": [
                  {
                    "schema:name": "<",
                    "schema:value": 0
                  },
                  {
                    "schema:name": ">",
                    "schema:value": 1
                  }
                ]
              },
              "schema:value": 1
            }
          ]
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showFixation",
          "schema:value": true
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showFeedback",
          "schema:value": false
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "showResults",
          "schema:value": true
        },
        {
          "@type": "schema:Text",
          "schema:name": "samplingMethod",
          "schema:value": "randomize-order"
        },
        {
          "@type": "schema:Text",
          "schema:name": "nextButton",
          "schema:value": "Finish",
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "lastScreen",
          "schema:value": true
        },
        {
          "@type": "schema:Number",
          "schema:name": "sampleSize",
          "schema:value": 10
        },
        {
          "@type": "schema:Number",
          "schema:name": "trialDuration",
          "schema:value": 3000
        },
        {
          "@type": "schema:Number",
          "schema:name": "blockIndex",
          "schema:value": 3
        }
      ]
    },
  ]
}
