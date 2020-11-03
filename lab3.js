// Marcus Del Vecchio SE3316 Lab3 Front-End Javscript

// initializations and global variables

		var tableData = [];	// full or empty list by default?
		const port = 3000;

		init();
		var activeScheduleCoursePairs = {};	// key value pairs of active schedule
		var activeScheduleData = {};
		var masterActiveSchedule;	// active schdule tracker for when re regenerate drop down in renderSchedulePreview and meed old value
		var pendingAddToSchedule = {};
		// changed to object of key value pairs of all courses to add to the schedule
		 // array of schedule objects (append to scheduleData under specfic schedule when "add to schedule" button is clicked)
		var scheduleData = [] 	// array of ALL schedules and their corresponding courses (with ENTIRE course objects)
		var scheduleDataObject = {};	// NVM THIS IS OBJECT OF OBJECTS OF KEY VALUE PAIRS object of ALL schedules and their corresponding courses (with ENTIRE course objects LABELED BY SCHEDULE NAME SO INFO CAN BE ACCESSED)
	
// init function calls - needs to be async so we can await for fuctions to assign global variables

	async function init(){
		await updateScheduleData();
		renderSchedulePreview();
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
			queryString += "https://ec2-52-204-102-166.compute-1.amazonaws.com:" + port + "/api/subjects/" + subjectValue;

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
				//console.log(jsonData);
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
				let colText = document.createTextNode("add to active schedule");
				colElement.appendChild(colText);
				headerRow.appendChild(colElement);

			// append header row to table
				table.appendChild(headerRow);


			// render row for each course object in data

				for(var courseObj in data){

					console.log(data);
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
						
						// associate key value with the checkbox
							var obj = {}
							var key = data[courseObj].subject;
							var value = data[courseObj].catalog_nbr;
							obj[key] = value;
							colCheckBox.keyValue = obj;



						colCheckBox.addEventListener( 'change', function() {
    					
    					// convert course info in data object to subject value pair

    						//let courseKeyValue = data[courseObj].subject + ", " + data[courseObj].catalog_nbr;

    						if(this.checked) {
    							
        						// append this course to the the pendingAddToSchedule array of key values
        						for(var key in this.keyValue){
        							console.log(key);
        							console.log(colCheckBox.keyValue[key]);

        							// note keys and values reversed bc subjects arent unique and are overriding
        							//pendingAddToSchedule[key] = colCheckBox.keyValue[key];
        							pendingAddToSchedule[colCheckBox.keyValue[key]] = key;
        						}
        						console.log(pendingAddToSchedule);
        						
    						}else {
        						// remove this course from the pendingAddToSchedule array
        						try{
        							for(var key1 in pendingAddToSchedule){
    									for(var key in this.keyValue){
	    									if(key1 == this.keyValue[key]){
	    										delete pendingAddToSchedule[key1];
	    										console.log("deleted");
	    										console.log(pendingAddToSchedule);
	    									}
    									}
    								}
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

// flip pendingAddToSchedule keybvalues back?


// create schedule based on selected courses  and provoding schedule name - ( todo add fucntionality where you can re search and keep selected courses)

	async function createSchedule(){

		let scheduleName = document.getElementById("scheduleName").value;
		//let queryString = 'http://localhost:3000/api/schedules/' + scheduleName;
		let queryString ='https://ec2-52-204-102-166.compute-1.amazonaws.com:3000/api/schedules/' + scheduleName;

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
	
	function renderSchedulePreview(){

		let parentContainer = document.getElementById("scheduleSelectContainer");
		let table = document.getElementById("schedulePreviewTable");
		let dropDownCol = document.getElementById("dropdownColumn");

		// check if schedule preview already exists, if so, delete it
			
			if(dropDownCol != null){
				while(dropDownCol.firstChild){
					dropDownCol.removeChild(dropDownCol.firstChild)
				}
			} 

			if(table != null){
				while(parentContainer.firstChild){
					parentContainer.removeChild(parentContainer.firstChild)
				}
			} 
		
		table = document.createElement("table");	// create another tbale inside current column
		table.id = "schedulePreviewTable"

		let row = document.createElement("tr");

		let col1 = document.createElement("td");
		col1.id = "dropdownColumn";
		let col2 = document.createElement("td");
		col2.id = "infoColumn"; // give column 2 an id so we can append data to it


		row.appendChild(col1);
		row.appendChild(col2);
		table.appendChild(row);
		parentContainer.appendChild(table);

		let scheduleDropdown = document.createElement('select');
		scheduleDropdown.id = "activeScheduleDropdown";
		scheduleDropdown.value = masterActiveSchedule;
		scheduleDropdown.onchange = function(){ renderScheduleDropDownInfo() };
		col1.appendChild(scheduleDropdown);

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
		let infoColumn = document.getElementById("infoColumn");

		console.log("active scedule: " + activeSchedule);

		// check if info already exists, if so, delete it

			if(infoColumn.firstChild){
				while(infoColumn.firstChild){
					infoColumn.removeChild(infoColumn.firstChild)
				}
			} 

		// get the ACTIVE schedule object and generate nodes 

			activeScheduleData = scheduleDataObject[activeSchedule];	

			if(true){
				for(let subject in activeScheduleData){
					let infoText = document.createTextNode("[" + subject + "-" + activeScheduleData[subject] + "]");
					infoColumn.appendChild(infoText);
				}
			}else{
				// todo check if empty
				let infoText = document.createTextNode("no assigned courses");
				infoColumn.appendChild(infoText);
			}
	}


// add pendingAddToSchedule object courses to scheduleDataObject object courses and then filter to ensure no duplicates. Then put to data 
		
	let submitAddToSchedule = function(){
	
	// remember key values are flipped in 'pendingAddToSchedule' so keys are all unique

		let activeSchedule = document.getElementById("activeScheduleDropdown").value
		console.log(pendingAddToSchedule);
		//console.log(scheduleDataObject);

		for(var course in pendingAddToSchedule){
			var subject = pendingAddToSchedule[course];

			for(var course1 in scheduleDataObject[activeSchedule]){
				var subject1 =  scheduleDataObject[activeSchedule][course1];

				if(!(subject == subject1 && course == course1)){
					console.log("key pair appended");
					scheduleDataObject[activeSchedule][course] = pendingAddToSchedule[course];
					console.log(scheduleDataObject[activeSchedule]);
				}
			}
		}

		// put to storage
			//putScheduleData(activeSchedule);
			putScheduleData();
	}

 // put data to schedule and update schedule preview

	 async function putScheduleData(){

	 	//note schedule name is passed and global 'scheduleData' object is put to it. 'scheduleData' is updated before entering.

	 	let schedule = document.getElementById("activeScheduleDropdown").value;
	 	let putData = scheduleDataObject[schedule];
	 

	 	//fetch("amazon-web-server-address/...") change to after
	 	let response = await fetch("https://ec2-52-204-102-166.compute-1.amazonaws.com:3000/api/schedules/" + schedule {
 			method: 'PUT',
 			headers: {		// do I need this?
				'Content-Type': 'application/json',
 			},
 			body: JSON.stringify(putData),
	 	})
	 	.catch((error) => {
	 		console.error("error", error)
	 	});

	 	if(response.ok){
	 			console.log("put successful");
 		}else{
 			console.log("put failed");
 		}

	 	//update schedule preview w key value pairs just put into the sotage
	 		masterActiveSchedule = schedule;
	 		renderSchedulePreview(); 	

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

		let queryString = "https://ec2-52-204-102-166.compute-1.amazonaws.com:" + port + "/api/scheduleInfo";

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
			console.log(scheduleDataObject);

 			for(var element in jsonData){
 				scheduleData.push(jsonData[element]);
 			}
	}


