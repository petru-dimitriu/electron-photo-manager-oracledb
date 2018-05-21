function loadStatsIntoContents()
{
    getStatsList(getStatsListAsTable);
}

function getStatsListAsTable(rows)
{
    var conts = "<table>"
	conts += "<tr class='searchable'><td><b>Location</b></td><td><b>Year</b></td><td><b>Count</b></td></tr>"

    for (var i = 0; i < rows.length; i ++)
    {
		if (rows[i]['NAME'] == null)
		{
			tableStyle = "style='background-color:#8888ff'";
			if (rows[i]['YEAR'] == null)
			{
				tableStyle = "style='background-color:white; color: black;'";
			}
		}
		else if (rows[i]['YEAR'] == null)
		{
			tableStyle = "style='background-color:#9999ee'";
		}
		else tableStyle = "";
        conts += "<tr " + tableStyle + "><td>" + (rows[i]['NAME'] == null ? '<u>All locations</u>' : rows[i]['NAME']) + "</td> \
        <td>" + (rows[i]['YEAR'] == null ? '<u>All years</u>' : rows[i]['YEAR']) + " \
        <td>" + rows[i]['CNT'] + "</td>\
        </tr>";
    }
    conts += "</table>";
    $("#conts").html(conts);
    $("#incrementalSearchVal").keydown(tableInputKeydown);
}

function getStatsList(callback)
{
    var query = "select name, to_char(date_taken,'yyyy') year, count(*) cnt from photos, locations where photos.location_id = locations.id and location_id is not null and date_taken is not null group by cube(to_char(date_taken,'yyyy'),name)";
    conn.all(query, function(err, rows){
            //console.log(rows);
        callback(rows);
    });
}

function displayStats()
{
    changeMode("stats");
    loadStatsIntoContents();
}