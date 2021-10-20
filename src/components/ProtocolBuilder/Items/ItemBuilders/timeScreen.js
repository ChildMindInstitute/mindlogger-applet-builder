export const timeScreen = {
	"name": "time_screen",
	"question": "How would you like to log behaviors for?",
	"description": "",
	"ui": {
		"allow": [],
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
				"name": "No time Limit",
				"value": 0,
			},
			{
				"name": "5 minutes",
				"value": 5,
            },
			{
				"name": "10 minutes",
				"value": 10,
            },
			{
				"name": "15 minutes",
				"value": 15,
			}
		]
  },
  "allowEdit": false
}
