function loadSearch()
{
  $("#conts").html (`
    Search through photos. Any field can be left blank. <br>

    Part of file name: <br/>
    <input style = 'width:90%' id = "filename" type = "text" placeholder = "(none)"> <br/>
    Rating: <br/>
    <select style = 'width:90%' id = "rating">
      <option>any</option>
      <option>1</option>
      <option>2</option>
      <option>3</option>
      <option>4</option>
      <option>5</option>
    </select><br>
    Part of one album name, if any:<br/>
    <input style = 'width:90%' id = "album" type = "text" placeholder = "(none)"> <br/>
    Parts of people's names, comma-separated:<br/>
    <input style = 'width:90%' id = "people" type = "text" placeholder = "(none)"> <br/>
    <a style='font-size:150%' href = "javascript:performSearchClick()">Search</a> <br>
    <a href="javascript:performSearchClick(true)">Display SQL</a>
  `);
}

function performSearchClick(display)
{
  var filename = $("#filename").val();
  var rating = $("#rating").val();
  var album = $("#album").val();
  var people = $("#people").val();
  var sql = getSqlFromSerachArgs(new SearchArguments(filename, rating, album, people));
  if (display == true)
    alert(sql);
  else
    displayPhotos(null, null, sql);
}

function SearchArguments(filename, rating, album, people)
{
  this.filename = filename;
  this.rating = rating;
  this.album = album;
  this.people = people;
}

function getSqlFromSerachArgs(searchArgs)
{
  var query = "SELECT * FROM photos WHERE ";
  var and = false;
  if (searchArgs.filename != '')
  {
    query += "path LIKE '%" + searchArgs.filename + "%'";
    and = true;
  }
  if (searchArgs.rating != 'any')
  {
    if (and)
      query += " AND ";
    query += "rating=" + searchArgs.rating + " ";
    and = true;
  }
  if (searchArgs.album != '')
  {
    if (and)
      query += " AND ";
    query += `album IN (SELECT id FROM albums WHERE title LIKE '%` + searchArgs.album + `%')`;
    and = true;
  }
  if (searchArgs.people != '')
  {
    console.log(searchArgs.people);
    var people = searchArgs.people.split(",");
    if (and)
      query += " AND ";
    for (var i = 0; i<people.length; i++)
    {
      query += "EXISTS (SELECT peopleInPhotos.person_id FROM peopleInPhotos WHERE photo_id = photos.id AND person_id IN (SELECT id FROM people WHERE name LIKE '%" + people[i] + "%'))";
      if (i < people.length-1)
        query += " AND ";
    }
    and = true;
  }
  if (and == false) // nothing added
    query += " TRUE ";
  return query;
}
