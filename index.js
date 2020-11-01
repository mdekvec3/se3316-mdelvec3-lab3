// create index.js file inside express directory (directory with express installed; has package.json and package-lock.json files after init)

// loading the express module - it returns a function, so we set it to a functino to call later
const express = require('express');
const timetable = require("./Lab3-timetable-data.json");

// set the function output to a constant called app
const app = express();

/*  implimenting endpoints that respond to http 'get' request - add new routes with app.get(), thanks to express
* method takes 2 arguments:
*   1. path or URL of endpoint
* 2. callback funciton (AKA "route handler" ) that will be called when we have an http GET rquest to said endpoint
*     callback function has 2 arguments:
*       1. request object
*       2. response object
*/
app.get('/', (req, res) => {
  res.send('Hello World From epxress.js');
});


// seperate method that is just for courses? not w descriptions
// make all into one method? optional params handled within?

// #1
// get all available subject with their descriptions
app.get('/subjects', (req, res) => {
  
  var subjectArray = [];

  // loop through objects to get all subjects 
    
    for(var obj in timetable){

      // add the subject to the subject array if not already added
        
        if (!subjectArray.includes(timetable[obj].subject)){
            subjectArray.push(timetable[obj].subject + ": " + timetable[obj].catalog_description);
          }
    }
  // return the subject array 
    console.log("response sent");
    res.send(subjectArray);
});

//returns just a subject list
app.get('/subjects-without-descriptions', (req, res) => {
  
  var subjectArray = [];

  // loop through objects to get all subjects 
    
    for(var obj in timetable){

      // add the subject to the subject array if not already added
        
        if (!subjectArray.includes(timetable[obj].subject)){
            subjectArray.push(timetable[obj].subject);
          }
    }
  // return the subject array 
    console.log("response sent");
    res.send(subjectArray);
});

app.get('/test', (req, res) => {
  
  var response = [];
  var RepeatedCourseCodeArray = [];
  var courseComponentArray = [];

  // get array of obejcts that repeat course codes    
    for(var i in timetable){
      for(var j in timetable){
        if(timetable[i].subject == timetable[j].subject && timetable[i].catalog_nbr == timetable[j].catalog_nbr && timetable[j].course_info[0].ssr_component != timetable[i].course_info[0].ssr_component){
          console.log(timetable[i].catalog_nbr + " And " +  timetable[j].catalog_nbr );
          RepeatedCourseCodeArray.push(timetable[j].catalog_nbr);
          RepeatedCourseCodeArray.push(timetable[i].catalog_nbr);
        }
      }
    }
   
  // return the subject array 
    console.log("response sent");
    res.send(RepeatedCourseCodeArray);
});



app.get('/subjects/:subject/courses', (req, res) => {

  var coursesInSubject = [];

  // loop thorugh JSON object and find subjects 

    for(var obj in timetable){
      
      // only add courses if subject matches one specified

        if(timetable[obj].subject == req.params.subject) {

          // check if array already includes catalog (course) number    // might break cuz " " + ... willl never match ...
            
            if (!coursesInSubject.includes(timetable[obj].catalog_nbr)){
                coursesInSubject.push(timetable[obj].catalog_nbr);
              }
        }
    }

  // if subject code doesnt exist; length of array is zero
    if(coursesInSubject.length == 0){
      res.status(404).send("The specified course could not be found")
    }

  // return the subject array 
    console.log("response sent");
    res.send(coursesInSubject);
});

let getCourseInfoValue = function(propertyVal){
  let course_info = this.course_info;

  for(var arrayItem in course_info) {
    
    for(var property in arrayItem ){

      // if the property matches the one passed in, return said property's value
      if(property + "" == propertyVal){
        return course_info[arrayItem].property;
      }
    }
  }

}

// get timetable entry for specified subject code 
app.get('/subjects/:subject/courses/:course/courseComponents/:courseComponent?', (req, res) => {

  let objectArray = [];

  // track if subject and cour match anything so error can be sent

    let subjectExixts = false;
    let courseNumberExists = false;

  // if specified we can quickly just return that course component
    
    if(req.params.courseComponent){
      
      for(var obj in timetable){
        
        if(timetable[obj].course_info[0].ssr_component == req.params.courseComponent){
          
          if(timetable[obj].subject == req.params.subject && timetable[obj].catalog_nbr == req.params.course){
            
            console.log("response sent via quick exit; course component matched exactly");
            objectArray.push(timetable[obj]);
            res.send(objectArray);
          }
        }
      }
      // send response error; specified course component didnt match
    }
    else{
      console.log("course component null");
    }
   
  // else if the course component was not passed return all components - so slice the course code and loop for matches

    let objCourseNum;
    let courseNum;

    for(var obj in timetable){
      
      // remove letter from course code to compare components
        
        objCourseNum = ("" + timetable[obj].catalog_nbr).slice(0, -1);
        courseNum = ("" + req.params.course).slice(0, -1); 

      // check every time if subject and course 

        if(timetable[obj].subject == req.params.subject){
          subjectExixts = true;
        }

        if((timetable[obj].catalog_nbr) == req.params.course){
          courseNumberExists = true;
        }

        // only add courses if subject and course nbr (exactly) matches ones specified
          
          if((timetable[obj].subject == req.params.subject) && (objCourseNum == courseNum)){
            
            // check if array already includes catalog (course) number (with letter at end)
              
              if (!objectArray.includes(timetable[obj])){
                  objectArray.push(timetable[obj]);
              }
              else{
                console.log("aleardy included");
              }
          }
          else{
            console.log("not all match");
          }
    }
  
  // if array nothing matched, check if course or subject didn't match
    
    if(objectArray.length == 0) {

      if(!subjectExixts && !courseNumberExists){
        res.status(404).send("The specified subject and course number could not be found");
      }
      if(!subjectExixts){
        res.status(404).send("The specified subject could not be found");
      }
      if(!courseNumberExists){
        res.status(404).send("The specified course number could not be found");
      }
    }
  
  // return the subject array 
    console.log("response sent");
    res.send(objectArray);
});

app.listen(3000, () => console.log("listening on port 3000"));

//app.post()
//app.post()
//app.delete()
let JSdata = [];