
/* fetch example - delete

fetch('/profile-account-details', { 
method: 'POST', 
body: JSON.stringify({ subjectNo1: courseNo1, subjectNo2: courseNo2, subjectNo3: courseNo3 }) });

*/

// " Replace existing subject-code + course-code pairs with new values and create new pairs if it doesn’t exist."
// what does this mean?^

var tableData = [];	// full or empty list by default?
const port = 3000;

// when search is submitted

	let insertAfter = function(newNode, referenceNode) {
	    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	};

	async function searchSubmitted(){

		// setup

			let queryString = "";
			let subjectValue = document.getElementById("subjectDropDown").value;		// should never be null
			let courseValue = document.getElementById("courseNumber").value;			// optional
			let componentValue = document.getElementById("componentDropdown").value;	// optional

		// setup query string
			queryString += "http://localhost:" + port + "/api/subjects/" + subjectValue;

			// if course value assigned fetch from route #3, else, use route #2 (search by subject only)
				
				if(courseValue){
					
					queryString += "/courses/" + courseValue;

					if(componentValue){
						queryString += "/courseComponents/" + componentValue;
					}
				}
			
		console.log("query string: " + queryString);

		// fetch call with defined query string as param

			let jsonData;

			// fetch("amazon-web-server-address/...") change to after
			let response = await fetch(queryString , {
	 			method: 'GET',
	 			headers: {		// do I need this?
					'Content-Type': 'application/json',
	 			},
	 		})/*.then(response => JSON.parse(response.body)})*/
	 		.catch((error) => { console.error("error", error); });

	 		if(response.ok){
	 			jsonData = await response.json();
	 			console.log(response.text);
	 		}
			
			// render returned object in table
				console.log(jsonData);
				//renderTable(data); not implimented yetx
	};

// object used to map headers corresponding properties
// todo: to ensure we have all of these
	let headerInfo = {
		"Course number" : "catalog_nbr",
		"Subject" : "subject",
		"Days" : "days",
		"Start time" : "start_time",
		"End time" : "end_time",
		"Course component" : "ssr_component",
		"Section": "class_section",
		"Campus": "campus",
		"Description": "catalog_description",
		"Status" : "enrl_stat",
		"Requisites and Constraints": "descr",
		"Instructors" : "instructors",
	};

// render table
	
	let renderTable = function(data){

		let parentContainer = document.getElementById("infoTableContainer");
		let tableObject = document.getElementById("infoTable");	// may or may not esixt, we are creating it in this method
		
		// if table already exists, delete it
			if(tableObject != null){
				while(tableObject.firstChild){
					tableObject.removeChild(tableObject.firstChild)
				}
				tableObject.remove();
			} 

		// generate table and header row ( we will loop through and create info rows )

			let table = document.createElement("div");
			table.id = "infoTable";
			table.className = "";	// todo
			parentContainer.appendChild(table);

			var headerRow = document.createElement("tr");
			headerRow.class = "tableHeaderRow";

			// generate column for every header item and append it to parent 

				for(var column in headerInfo){
					let colElement = document.createElement("td");
					let colText = document.createTextNode(headerInfo[column]);
					colElement.appendChild(colText);
					table.appendChild(colElement); // can we reference table like this?
				}

			// generate column for part of schedule checkbox

				let colElement = document.createElement("td");
				let colText = document.createTextNode("included in active schedule");
				colElement.appendChild(colText);
				table.appendChild(colElement);

			// render row for each course object in data

				for(var courseObj in data ){
					var courseRow = document.createElement("tr");
					courseRow.class = "courseRow";

					// render columns

						for(var column in headerInfo){
							let colElement = document.createElement("td");
							let colText = document.createTextNode(data[courseObj][]);
							colElement.appendChild(colText);
							table.appendChild(colElement);
						}
				}
		 
		 // render shortened list above for list of all selected courses to easily remove and see list
		 // schedule stays the same as they search through courses to add
		 // notify if conficts?
	};


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
