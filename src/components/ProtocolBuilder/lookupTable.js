export const sampleLookupTable = [
  {
    "tScore": 10,
    "rawScore": "10",
    "age": "15",
    "sex": "M"
  },
  {
    "tScore": 15,
    "rawScore": "20",
    "age": "",
    "sex": "F"
  },
  {
    "tScore": 12,
    "rawScore": "25",
    "age": "15",
    "sex": ""
  },
  {
    "tScore": 1,
    "rawScore": "10-20",
    "age": "15",
    "sex": "F"
  },
  {
    "tScore": 9,
    "rawScore": "15-25",
    "age": "15",
    "sex": ""
  },
  {
    "tScore": 8,
    "rawScore": "60-70",
    "age": "15-20",
    "sex": ""
  },
  {
    "tScore": 7,
    "rawScore": "10",
    "age": "15",
    "sex": ""
  },
  {
    "tScore": 90,
    "rawScore": "60-70",
    "age": "5-15",
    "sex": "F"
  }
];

export const ageScreen = {
	"name": "age_screen",
	"question": "How old are you?",
	"description": "",
	"ui": {
		"allow": [],
		"inputType": "text"
	},
	"options": {
		"requiredValue": true
  },
  "allowEdit": false
};

export const genderScreen = {
	"name": "gender_screen",
	"question": "How do you describe yourself?",
	"description": "",
	"ui": {
		"allow": [
			"auto_advance"
		],
		"inputType": "radio"
	},
	"multipleChoice": false,
	"scoring": false,
	"valueType": "http://www.w3.org/2001/XMLSchema#anyURI",
	"options": {
		"isMultipleChoice": false,
		"hasScoreValue": false,
		"nextOptionImage": "",
		"nextOptionName": "",
		"options": [
			{
				"image": false,
				"name": "Male",
				"value": 0,
				"score": false
			},
			{
				"image": false,
				"name": "Female",
				"value": 1,
				"score": false
			}
		]
  },
  "allowEdit": false
}
