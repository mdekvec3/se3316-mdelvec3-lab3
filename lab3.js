// Marcus Del Vecchio SE3316 Lab3 Front-End Javscript

// initializations and global variables

		var tableData = [];	// full or empty list by default?
		const port = 3000;

		init();
		var activeScheduleCoursePairs = {};	// key value pairs of active schedule
		var activeScheduleData = {};
		var pendingAddToSchedule = []; // array of schedule objects (append to scheduleData under specfic schedule when "add to schedule" button is clicked)
		var scheduleData = [] 	// array of ALL schedules and their corresponding courses (with ENTIRE course objects)
		var scheduleDataObject = {};	// object of ALL schedules and their corresponding courses (with ENTIRE course objects LABELED BY SCHEDULE NAME SO INFO CAN BE ACCESSED)
	
// init function calls - needs to be async so we can await for fuctions to assign global variables

	async function init(){
		await updateScheduleData();
		renderSchedulePreview(scheduleData);
	}

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
	 		}
			
			// render returned object in table
				console.log(jsonData);
				renderTable(jsonData);
	};

// object used to map headers corresponding properties
// todo: to ensure we have all of these
	let headerInfo = {
		"Course number" : "catalog_nbr",
		"Class Name": "className",
		"Subject" : "subject",
		"Description": "catalog_description",
		
		// below are part of course_iunfo object
		/*"Days" : "days",
		"Class Number" : "class_nbr",
		"Start time" : "start_time",
		"End time" : "end_time",
		"Course component" : "ssr_component",
		"Section": "class_section",
		"Campus": "campus",
		"Instructors" : "instructors",
		"Status" : "enrl_stat",
		"Requisites and Constraints": "descr",
		*/
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

			let table = document.createElement("table");
			table.id = "infoTable";
			table.className = "";	// todo
			parentContainer.appendChild(table);

			var headerRow = document.createElement("tr");
			headerRow.class = "tableHeaderRow";

		// generate column for every header item and append it to parent 

			for(var column in headerInfo){
				let colElement = document.createElement("td");
				let colText = document.createTextNode(column);
				colElement.appendChild(colText);
				headerRow.appendChild(colElement);
			}

			// generate column for part of schedule checkbox

				let colElement = document.createElement("td");
				let colText = document.createTextNode("included in active schedule");
				colElement.appendChild(colText);
				headerRow.appendChild(colElement);

			// append header row to table
				table.appendChild(headerRow);


			// render row for each course object in data

				for(var courseObj in data ){

					var courseRow = document.createElement("tr");
					courseRow.class = "courseRow";

					// render columns

						for(var column in headerInfo){
							let colElement = document.createElement("td");
							
							// check if part of course_info object bc then extra route has to be added to access property
							//debugging: console.log(column);

							// todo doesnt work for some reason - removed broken columns for now 
							/*if(column != "Class Name" && column != "Subject" && column != "Description" && column != "Course number" ){
								let text = "" + data[courseObj]["course_info"][0][headerInfo[column]];
								let colText = document.createTextNode(text);
							}
							else{
								let colText = document.createTextNode(data[courseObj][headerInfo[column]]);
							}
							*/
							
							let colText = document.createTextNode(data[courseObj][headerInfo[column]]);
							// debugging: console.log(data[courseObj][headerInfo[column]]);
							
							colElement.appendChild(colText);
							courseRow.appendChild(colElement);	
						}

					// and finally add checkbox column for each row
						
						let colElement = document.createElement("td");
						let colCheckBox = document.createElement('input');
						colCheckBox.type = "checkbox";
						colCheckBox.name = "included in schedule";	// do anything? label?
						colCheckBox.id = "rowCheckBox";		// getting this value will be difficult but probs can be done through parent row
						
						colCheckBox.addEventListener( 'change', function() {
    						
    						if(this.checked) {
        						// append this course to the the pendingAddToSchedule array
        						pendingAddToSchedule.push(courseObj);

    						}else {
        						// remove this course from the pendingAddToSchedule array
        						try{
    								pendingAddToSchedule = pendingAddToSchedule.filter(x => x != courseObj); // todo verify this works
    							}catch(err){
        							console.log("error: pending schedule list broken; schedule not included in array"); // should never happen
        						}
    						}
							});

						colElement.appendChild(colCheckBox);
						courseRow.appendChild(colElement);

					// append course row to table
						table.appendChild(courseRow);
				}
	};

// create schedule based on selected courses  and provoding schedule name - ( todo add fucntionality where you can re search and keep selected courses)

	async function createSchedule(){

		let scheduleName = document.getElementById("scheduleName").value;
		let queryString = 'http://localhost:3000/api/schedules/' + scheduleName;

		// fetch and put the object to the API w schedule name
			// todo change route 
			let response = await fetch(queryString, {
		 			method: 'POST',
		 			headers: {		// do I need this?
						'Content-Type': 'application/json',
		 			},
		 		})
		 		.catch((error) => { console.error("error", error); });

		 		if(response.ok){
		 			console.log("schedule create success");
		 		}else{
		 			alert("schedule create failed: a schedule already exists with the provided name");
		 		}

		// update global scedules object and active scedule course list
			updateScheduleData();
			renderSchedulePreview();
	};

// render schedule preview data into table
// todo should be re run if schedules are changed; function passing data to this fucnction need to be re run as well
	
	function renderSchedulePreview (scheduleData){

		let parentContainer = document.getElementById("scheduleSelectContainer");
		let table = document.getElementById("schedulePreviewTable");

		// check if schedule preview already exists, if so, delete it
			
			if(table != null){
				while(parentContainer.firstChild){
					parentContainer.removeChild(parentContainer.firstChild)
				}
			} 
		
		let data = scheduleData;

		table = document.createElement("table");	// create another tbale inside current column
		table.id = "schedulePreviewTable"

		let row = document.createElement("tr");

		let col1 = document.createElement("td");
		let col2 = document.createElement("td");
		col2.id = "infoColumn"; // give column 2 an id so we can append data to it


		row.appendChild(col1);
		row.appendChild(col2);
		table.appendChild(row);
		parentContainer.appendChild(table);

		let scheduleDropdown = document.createElement('select');
		scheduleDropdown.id = "activeScheduleDropdown";
		scheduleDropdown.onChange = fillScheduleInfo();
		col1.appendChild(scheduleDropdown);
		scheduleDropdown.onChange = function() { renderScheduleDropDownInfo() };

		// generating dropdown options for each schedule name 

			for(var schedule in scheduleDataObject){
				let childOption = document.createElement("option");
				let optionLabel = document.createTextNode(schedule);
				childOption.appendChild(optionLabel);
				scheduleDropdown.appendChild(childOption);
			}

			var ActiveScheduleLabel = document.createTextNode("Active Schedule ");
			col1.insertBefore(ActiveScheduleLabel, scheduleDropdown);

			// generating info column - run once at beginning and also run during dropwdown onchange 
				renderScheduleDropDownInfo();

		// create button outside of table nested in column that adds selected schedules to avctive schedule
			
			let addToScheduleButton = document.createElement("button");

			// labels
				
				let buttonText = document.createTextNode("Add");
				addToScheduleButton.appendChild(buttonText);
				let buttonLabel = document.createTextNode("Add Currently Selected Courses to Active Schedule");
				parentContainer.appendChild(addToScheduleButton);
				parentContainer.insertBefore(buttonLabel, addToScheduleButton);

			// functionality

				addToScheduleButton.onclick = function() { submitAddToSchedule() };	//note if we just set it as the inside function it is always called and breaks
	};

// when different schedule is selected from drop down change corresponding schedule info
	
	let renderScheduleDropDownInfo = function(){

		let activeSchedule = document.getElementById("activeScheduleDropdown").value

		// get the ACTIVE schedule object 
		activeScheduleData = scheduleDataObject[activeSchedule];
		console.log(scheduleDataObject);
		console.log(activeScheduleData);

		//activeScheduleCoursePairs = scheduleDataToPairs(activeScheduleData);
		console.log(activeScheduleData);
		console.log(activeScheduleCoursePairs);
		
		console.log("dropdown onchange");
		
		let infoColumn = document.getElementById("infoColumn");

		// generate nodes
		
			for(let subject in activeScheduleCoursePairs){
				let infoText = document.createTextNode(subject + ", " + activeScheduleCoursePairs[subject]);
				infoColumn.appendChild(infoText);
			}
	}


// add pendingAddToSchedule object courses to scheduleData object courses and then filter to ensure no duplicates. Then put to data 
		
	let submitAddToSchedule = function(){

		for(var course in pendingAddToSchedule){
			if (!scheduleData.includes(course)){
				scheduleData.appendChild(course);
			}
		}

		// put to storage
			let activeSchedule = document.getElementById("activeScheduleDropdown").value;
			putScheduleData(activeSchedule);
	}

// render schedule course list into table
	
	function fillScheduleInfo(){
		let value = document.getElementById("scheduleDropdown");

		// fetch schedule courses from api

		// for each course add course name to data 
	}

 // put data to schedule and update schedule preview

	 async function putScheduleData(scheduleName){

	 	//note schedule name is passed and global 'scheduleData' object is put to it. 'scheduleData' is updated before entering.

	 	let schedule = scheduleName;

	 	// converting the schedule data (of schedule info objects) to just the subject - course code pairs of the contained courses
	 	
	 		let scheduleDataPairs = scheduleDataToPairs(scheduleData);

	 	//fetch("amazon-web-server-address/...") change to after
	 	/*let response = await fetch("http://localhost:3000/api/schedules/" + scheduleName, {
 			method: 'PUT',
 			headers: {		// do I need this?
				'Content-Type': 'application/json',
 			},
 			body: JSON.stringify(scheduleDataPairs),
	 	})
	 	.catch((error) => {
	 		console.error("error", error)
	 	});

	 	if(response.ok){
	 			jsonResponse = await response.json();
	 			console.log(jsonResponse)
 		}else{
 			console.log("put failed");
 		}*/
 		console.log("put attempted");

	 	//update schedule preview w key value pairs just put into the sotage
	 		renderSchedulePreview(scheduleDataPairs); 	

	 };

 // convert schedule array pendingAddToSchedule to array of subject code - course code pairs so we can put
 	
 	let scheduleDataToPairs = function(data){

 		let scheduleDataPairs = {};
 	
 		for(var course in data){
 			scheduleDataPairs[course.subject] = course.catalog_nbr;
 		}

 		return scheduleDataPairs;
 	}

// get the schedule data and assign it to scheduleData

	async function updateScheduleData(){

		let queryString = "http://localhost:" + port + "/api/scheduleInfo";

		// fetch data 

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
		 			console.log("update schedule info success");
		 		}else{
		 			console.log("schedule get failed");
		 		}

 		// update scheduleData array and scheduleDataObject object

 			scheduleDataObject = jsonData;	// note this is actually a JS object
			scheduleData = [];

 			for(var element in jsonData){
 				scheduleData.push(jsonData[element]);
 			}
	}

// 


	
//} 
/*
	let activeScheduleCoursePairs;
	let pendingAddToSchedule;
	let scheduleData;
	let scheduleDataObject;

init();
*/

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
