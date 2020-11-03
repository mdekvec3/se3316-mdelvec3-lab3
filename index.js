// create index.js file inside express directory (directory with express installed; has package.json and package-lock.json files after init)

// loading the express module - it returns a function, so we set it to a functino to call later
  const express = require('express');
  const bodyParser = require('body-parser');
  const timetable = require("./Lab3-timetable-data.json");
  //const cors = require('cors')

// setting up data storage
  var fs = require('fs');
  var readFile = fs.readFileSync('data.json');
  var data = JSON.parse(readFile);  // sync wait for file to load before moving on; we want this unless reading and writing
  
// set the function output to a constant called app
  const app = express();

// This will ensure that the body-parser will run before our route, which ensures that our route can then access the parsed HTTP POST body              
// configuring express to use body-parser as middle-ware. 
  app.use(express.json());  // for parsing application/json objects passed in POST bodies
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  //app.use(cors);


app.get('/', (req, res) => {
  res.send('Hello World From epxress.js');
  return;
});

// seperate method that is just for courses? not w descriptions
// make all into one method? optional params handled within?

// test method
app.get('/api/test', (req, res) => {
  
  var response = [];
  var RepeatedCourseCodeArray = [];
  var courseComponentArray = [];

  // get array of obejcts that repeat course codes    
    for(var i in timetable){
      for(var j in timetable){
        if(timetable[i].subject == timetable[j].subject && timetable[i].catalog_nbr == timetable[j].catalog_nbr && timetable[j].course_info[0].ssr_component != timetable[i].course_info[0].ssr_component){
          RepeatedCourseCodeArray.push(timetable[j].catalog_nbr);
          RepeatedCourseCodeArray.push(timetable[i].catalog_nbr);
        }
      }
    }
   
  // return the subject array 
    console.log("response sent");
    res.send(RepeatedCourseCodeArray);
    return;
});

//returns just a subject list
app.get('/api/subjects-without-descriptions', (req, res) => {
  
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
    return;
});

// #1
// get all available subject with their descriptions
app.get('/api/subjects', (req, res) => {
  
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
    return;
});

// #2
app.get('/api/subjects/:subject/courses', (req, res) => {

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
    return;
});

// #3
// get timetable entry for specified subject code, course code and course component (optional) 
app.get('/api/subjects/:subject/courses/:course/courseComponents/:courseComponent?', (req, res) => {

  let objectArray = [];

  // track if subject and cour match anything so error can be sent

    let subjectExixts = false;
    let courseNumberExists = false;

  // if specified we can quickly just return that course component - don't compare course code though bc they won't match
    
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
    return;
});


// #4
// save schedule under schedule name, return error if already exists
app.post('/api/schedules/:scheduleName', async (req, res) => {
    
    // if schedule name already exists 

      if(data[req.params.scheduleName]){
        res.status(403).send("The specified resource name already exists");
      }

    // else add subject to list

      data[req.params.scheduleName] = {};
      var dataJSON = JSON.stringify(data, null, 2);
      fs.writeFileSync('data.json', dataJSON, () => console.log("POST request resouce written to file"));
      res.send("success");
});

/* data looks like:

data = {
  schedule1: {subjectCode: courseCode, 
              subjectCode2: courseCode2, 
              subjectCode3: courseCode3
              },
  schedule2: {subjectCode: courseCode, 
              subjectCode2: courseCode2, 
              subjectCode3: courseCode3
              },
  schedule3: {subjectCode: courseCode, 
              subjectCode2: courseCode2, 
              subjectCode3: courseCode3
              },
}

*/

// #5
// save a list of subject code course code pairs to an existing schedule
app.put('/api/schedules/:scheduleName', (req, res) => {
    
    // validate that subject code - course code pairs are valid? or do in front end 
      const body = req.body;
      console.log(body);
      const scheduleName = req.params.scheduleName;

    // if schedule name doesn't exists 

      if(!data[req.params.scheduleName]){
        res.status(403).send("The specified resource doesn't exist");
      }

    // else add body to existing resource

      // body is an {...} object
      data[scheduleName] = body;
      var dataJSON = JSON.stringify(data, null, 2);
      fs.writeFileSync('data.json', dataJSON, () => console.log("resource updated"));
      res.send("resource updated"); 
});

// #6
// get a list of subject code - course code pairs from a given schedule
 
  app.get('/api/schedules/:scheduleName', (req, res) => {

    console.log("getting schedule");
    const scheduleName = req.params.scheduleName;

    // if schedule name doesn't exists 

        if(!data[req.params.scheduleName]){
          res.status(403).send("The specified resource doesn't exist");
        }

    // else return the object

        res.send(data[scheduleName]);
  });

// #7
// delete schedule with a given namem

  app.delete('/api/schedules/:scheduleName', (req, res) => {

    console.log("deleting schedule");
    const scheduleName = req.params.scheduleName;

    // if schedule name doesn't exists 

        if(!data[req.params.scheduleName]){
          res.status(403).send("The specified resource doesn't exist");
        }

    // else delete the resource

        delete data[scheduleName];
        var dataJSON = JSON.stringify(data, null, 2);
        fs.writeFileSync('data.json', dataJSON);
        res.send("resource deleted");
  });

// #8
// todo better formatting for specifying scheduleList?
   
    app.get('/api/schedulesList', (req, res) => {

      console.log("getting schedules");
      let scheduleList = {};

      for(var schedule in data){
        scheduleList[schedule] = Object.keys(data[schedule]).length;
      }

      console.log(scheduleList);

      // else return the object

          res.send(scheduleList);
    });

// #9
// fine if this matches GET route '/api/schedules/' bc this is a different verb - delete
  
  app.delete('/api/schedules', (req, res) => {

    console.log("deleting schedules");
    let deletedScheduleList = data;

    // deleteing all the schedules (setting obejct to empty)
        var emptyObj = {};
        var dataJSON = JSON.stringify(emptyObj, null, 2);
        fs.writeFileSync('data.json', dataJSON);
        res.send(deletedScheduleList);
  });

// not tested
// (route #10) front-end #2 - search by subject (but return info object, not just course list)
app.get('/api/subjects/:subject', (req, res) => {

  var coursesInSubject = [];

  // loop thorugh JSON object and find subjects 

    for(var obj in timetable){
      
      // only add courses if subject matches one specified

        if(timetable[obj].subject == req.params.subject) {

          // check if array already includes schedule info, if not, push it   
            
            if (!coursesInSubject.includes(timetable[obj])){  // not sure if .includes works for objects in arrays
                coursesInSubject.push(timetable[obj]);
              }
        }
    }

  // if subject code doesnt exist; length of array is zero
    if(coursesInSubject.length == 0){
      console.log("empty");
      res.status(404).send("The specified course could not be found")
    }

  // return the subject array
    console.log("response sent");
    res.send(coursesInSubject);
    return;
});

// getting all schedules with corresponding course code pairs
// todo better formatting for specifying scheduleList?
   
    app.get('/api/scheduleInfo', (req, res) => {

      console.log("getting schedules");
      let scheduleList = {};

      for(var schedule in data){
        scheduleList[schedule] = data[schedule];
      }

      console.log(scheduleList);

      // else return the object

          res.send(scheduleList);
    });

// Port
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log("listening on port " + port));

let JSdata = [];