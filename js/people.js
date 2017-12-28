
function displayPeople()
{
	changeMode("people");
	loadPeopleIntoContents();
}

function loadPeopleIntoContents()
{
	getPeopleList(getPeopleListAsTable);
}

function getPeopleListAsTable(rows)
{
	var conts = "<table> \
	<tr id='insertRow'><td colspan='2'>\
  <input id='incrementalSearchVal' style='width:100%;' placeholder = 'Type here to search or insert new person.'> \
	</tr>";

	for (var i = 0; i < rows.length; i ++)
	{
		conts += "<tr class='searchable'><td>" + rows[i]['NAME'] + "</td> \
		<td style='min-width:350px'> <a href='javascript:displayPhotosWithPerson(\"" + rows[i]['NAME'] +"\")'>View</a> \
		<a href='javascript:removePersonClick(" + rows[i]['ID'] + ")'>Remove</a> </td>\
		</tr>";
	}
	conts += "</table>";
	$("#conts").html(conts);
	$("#incrementalSearchVal").keydown(tableInputKeydown);
}

function tableInputKeydown(event)
{
	if (event.which == 13)
	{
		var newPersonName = $('#incrementalSearchVal').val();
		insertPerson(newPersonName,
			function(err)
		{
			if (err == null) {
				loadPeopleIntoContents();
				notify('Person ' + newPersonName + ' added');
			}
			else {
				notify('Person ' + newPersonName + ' not added. ' + err);
				setTimeout(function() { notify(''); }, 5000);
			}
		});
	}
	else
		incrementalSearchTable();
}

function incrementalSearchTable()
{
	var searchval = $("#incrementalSearchVal").val();
	var tableRows = $(".searchable");
	for (var i=0;i<=tableRows.length;i++)
	{
		if ($(tableRows[i]).text().search(searchval) == -1)
			$(tableRows[i]).css("display","none");
		else
		{
			if ($(tableRows[i]).prop('tagName') == "TR")
				$(tableRows[i]).css("display","table-row");
			else if ($(tableRows[i]).prop('tagName') == "SPAN")
				$(tableRows[i]).css("display","inline");
		}
	}

}

function removePersonClick(id)
{
	removePerson(id,
		function(err){
			if (err == null)
			{
				notify("Person removed.");
				loadPeopleIntoContents();
			}
			else
			{
				notify("Person not removed.");
			}
		});
}

function displayPhotosWithPerson (person)
{
	displayPhotos(null, null, getSqlFromSerachArgs(new SearchArguments("", "any", "", person,"")));
}

function displayPhotosWithLocation (location)
{
	displayPhotos(null, null, getSqlFromSerachArgs(new SearchArguments("", "any", "", "", location)));
}


function getPeopleList(callback)
{
	var query = "SELECT * FROM people";
	conn.all(query, function(err, rows){
			//console.log(rows);
		callback(rows);
	});
}
