
function mouseMoveHandler(event)
{
  if (event.clientY > $(window).height() * (2/5))
  {
    if (currentMode == "photo" && ($("#descriptionBox").css('display') == "none"))
    {
      $("#descriptionBox").show();
    }

    if (event.clientX > $(window).width() * (5/9))
    {
      if (currentMode == "photo" && ($("#descriptionBoxRight").css('display') == "none"))
      {
        $("#descriptionBoxRight").show();
      }
    }
    else
    {
      if (currentMode == "photo" && ($("#descriptionBoxRight").css('display') != "none"))
      {
        $("#descriptionBoxRight").hide();
      }
    }
  }
  else
  {
    if (currentMode == "photo" && ($("#descriptionBox").css('display') != "none"))
    {
      $("#descriptionBox").hide();
    }
  }

}
