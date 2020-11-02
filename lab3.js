
/* fetch example - delete

fetch('/profile-account-details', { 
method: 'POST', 
body: JSON.stringify({ subjectNo1: courseNo1, subjectNo2: courseNo2, subjectNo3: courseNo3 }) });

*/

// " Replace existing subject-code + course-code pairs with new values and create new pairs if it doesn’t exist."
// what does this mean?^

var tableData = []	// full or empty list by default?
const port = 3000;
// when search is submitted

	let searchSubmitted = function(){

		// setup

			let queryString = "";
			let subjectValue = document.getElementById("subjectDropDown").value;		// should never be null
			let courseValue = document.getElementById("courseNumber").value;			// optional
			let componentValue = document.getElementById("componentDropdown").value;	// optional

		// setup query string
			
			queryString += "localhost:" + port + "/api/subjects/" + subjectValue;

			// if course value assigned fetch from route #3, else, use route #2 (search by subject only)
				
				if(courseValue){
					
					queryString += "/courses/" + courseValue;

					if(componentValue){
						queryString += "/courseComponents/" + componentValue;
					}
				}
			
		console.log("query string: " + queryString);

		// fetch call with defined query string as param

			// fetch("amazon-web-server-address/...") change to after
			fetch(queryString , {
 			method: 'GET',
 			headers: {		// do I need this?
				'Content-Type': 'application/json',
 			},
 			// body removed; don't need?
	 		}).then(response => response.json())	// "body.json() is a function that reads the response stream to completion and parses the response as json"
	 		.then(data => { console.log("success: " + data + "response: " + response) })
	 		.catch((error) => {
	 		console.error("error", error)
	 		});

			// render returned object in table
			console.log(data);
			//renderTable(data);
	};

// render table
	
	let renderTable = function(data){
		 /* 4 columns: 	course number (catalog_nbr),
						subject (subject)
						course info (course_info) - > put details into string or make seperate columns?
							days (days)
							start time (start_time)
							end time (end_time)
							course component (ssr_component)
							section (class_section)
							campus (campus)

						description (catalog_description)

						column for select / add to schedule button ?
		 */

		 // render shortened list above for list of all selected courses to easily remove and see list
		 // schedule stays the same as they search through courses to add
		 // notify if conficts?
	}

// render schedule data into table
	
	let renderSchedule = function(scheduleData){
		
		let data = scheduleData;

		// assume html table (row and column elements) already exist 
		// we just need to replace them based on times by getting elemts by id

		// push 
	};

/* Promise Notes:
 *
 * Promises allow you to use an asynchronous method, get the final value, and queue up “next steps” that you want to 
 * run on the eventually-returned value, in the form of .then()s;
 *
 * If the promise is rejected, the return value passes through any .thens and is picked up by the .catch
 *
 * Each promise object will have a then function that can take two arguments, a success handler and an error handler
 * The success or the error handler in the then function will be called only once, after the asynchronous task finishes.
 * The then function will also return a promise, to allow chaining multiple calls -> but more organized than "callback hell"
 */


 // post data to schedule and update schedule preview

	 let postData = function(newDataObject, scheduleName){

	 	//note data must be passed in object format

	 	let data = newDataObject;
	 	let schedule = scheduleName;

	 	//fetch("amazon-web-server-address/...") change to after

	 	fetch("http://localhost:3000/api/schedules/" + scheduleName, {
 			method: 'PUT',
 			headers: {		// do I need this?
				'Content-Type': 'application/json',
 			},
 			body: JSON.stringify(data),
	 	})
	 	.then(response => response.json())	// "body.json() is a function that reads the response stream to completion and parses the response as json"
	 	.then(data => { console.log("success: " + data + "response: " + response) })
	 	.catch((error) => {
	 		console.error("error", error)
	 	});

	 	// todo: update schedule prewview w data JUST PUT into schedule
	 		// setSchedule(data);
	 };

// update schdule preview object
	
	let setSchedulePreview = function(scheduleData){

		// todo fix/figure out logic with drop down

		// let scheduleName = (schedule name passed)
		// let scheduleData = (schdule course list data passed)

		// append table
		// append columns (2)
		// append tr
			// append td
			// append td

			// append td1 data (schedule drop down)
				// add onChange="setSchedulePreview()" to schedule name drop down (re render THIS function)

			// append td2 data (schedule items)
	};


/*	Table Format:

<table>
	<col>
	<col>
	<col>
	<col>
	
	<tr>
		<td>
		</td>

		<td>
		</td>
		
		<td>
		</td>
	</tr>

	<tr>
		...

*/

/* sample data obejct

"catalog_nbr": "3350B",
    "subject": "SE",
    "className": "SOFTWARE ENGINEERING DESIGN I",
    "course_info": [
      {
        "class_nbr": 4489,
        "start_time": "10:30 AM",
        "descrlong": "Prerequisite(s): SE 2203A/B, SE 3352A/B.\nCorequisite(s): SE 3351A/B, SE 3353A/B.",
        "end_time": "11:30 AM",
        "campus": "Main",
        "facility_ID": "ACEB-1450",
        "days": [
          "W"
        ],
        "instructors": [],
        "class_section": "001",
        "ssr_component": "LEC",
        "enrl_stat": "Not full",
        "descr": "RESTRICTED TO YR 3 SOFTWARE ENGINEERING STUDENTS AND YR 2 SOFTWARE/HBA STUDENTS."
      }
    ],
    "catalog_description": "Design and implementation of a large group project illustrating the design concepts being taught and promoting team interaction in a professional setting. \n\nAntirequisite(s): Computer Science 3307A/B/Y.\n\nExtra Information: 1 lecture hour, 3 tutorial/laboratory hours."
  },
*/
