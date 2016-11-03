angular.module('starter.constants',[])
 
.constant('SURVEY_FIELD_TYPE', {
  MultipleChoice: 'multiple',
  CheckBox: 'checkbox',
  Gps: 'gps',
  Picture: 'picture',
  Text: 'text',
  Paragraph: 'paragraph',
  Dropdown: 'dropdown',
  Scale: 'scale'
})
.constant('API',{
	Domain: 'https://surveyserver.herokuapp.com'
})