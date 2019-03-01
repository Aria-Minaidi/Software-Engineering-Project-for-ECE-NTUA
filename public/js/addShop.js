$(document).ready(function(){
    console.log("we are ok!");
    var token = localStorage.getItem("token")
    if (token == null){
        alert("You must be logged in to add new shop")
        //$(location).attr("href", "/login");

    }    
});

var xcord,ycord;
//map starts
var map= L.map('shop_map',{center:[37.918084, 23.707027], zoom: 10});
    googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{maxZoom: 20,subdomains:['mt0','mt1','mt2','mt3']}).addTo(map);

var petrolIcon = L.icon({
    iconUrl: '/static/pictures/1170466.svg',
    iconSize:     [30, 35],
    iconAnchor:   [15, 35],
    popupAnchor:  [-5, -36]
});

// click event
map.on('click', onMapClick);

var markers = [];

// Script for adding marker on map click
function onMapClick(e) {

  var geojsonFeature = {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "Point",
      "coordinates": [e.latlng.lat, e.latlng.lng],
    }
  }
  if (markers.length > 0) {
    map.removeLayer(markers.pop());
  }
  var marker;

  L.geoJson(geojsonFeature, {

    pointToLayer: function(feature, latlng) {

      marker = L.marker(e.latlng, {

        title: "lat"+e.latlng.lat+",lng"+e.latlng.lng,
        alt: "lat"+e.latlng.lat+",lng"+e.latlng.lng,
        riseOnHover: true,
        draggable: true,
        icon: petrolIcon
      });
      markers.push(marker)
      xcord = e.latlng.lat;
      ycord = e.latlng.lng;
      return marker;
    }
  }).addTo(map);

}
//map ends

var counter = 0;
$("#cell_add_button").click(function(event){
    event.preventDefault();
    
    var cell = document.getElementById("container");
    var input = document.createElement("input");
    input.type = "text";
    input.id = "shop_tags";
    input.name = "shop_tags";
    var br = document.createElement("br");
    cell.appendChild(input);
    cell.appendChild(br);
    counter++;
})

$("#cell_remove_button").click(function(event){
    event.preventDefault();

    if(counter != 0)
    {
        var cell =  document.getElementById("container");
        var flag = true;
        while(flag)
        {
            if(cell.lastChild.nodeName.toLowerCase() == "br")
            {
                cell.removeChild(cell.lastChild);
            }
            else if(cell.lastChild.nodeName.toLowerCase() == "input")
            {
                cell.removeChild(cell.lastChild);
                counter--;
                flag = false;
            }
        } 
    }
    else
    {
        alert("You haven't add any extra tag_cell")
    }
   
})

$("#shop_form").submit(function(event){
    event.preventDefault();
    var Data = {
        name : $("#shop_name").val(),
        address : $("#shop_addr").val(),
        lng : xcord,
        lat : ycord
    }

    var x = document.forms["shop_form"];
    var tag = "";
    var cnt = counter;
    
    for(var i=0;i <x.elements.length;i++)
    {
        if(x.elements[i].id == "shop_tags")
        {
            if(x.elements[i].value.trim() != ""){
                if(cnt == 0)
                {
                    tag += x.elements[i].value.trim() ;
                }
                else
                {
                    tag += x.elements[i].value.trim() + ",";
                    cnt--;
                }  
            }
            else{
                cnt--;
            }       
        }      
    }
    Data.tags = tag

    var token = localStorage.getItem("token")
    if (token == null){
        alert("You must be logged in to add new shop")
        $(location).attr("href", "/login");

    }
    else{
        $.ajax({
            url: "/observatory/api/shops",
            method: "POST",
            data: Data,
            headers: {
                "X-OBSERVATORY-AUTH" : token
            },
    
            success: function(data,status){
                var x = document.getElementById("snackbar");
                x.innerHTML = "Shop Added!"
                x.className = "show";
                // After 3 seconds, remove the show class from DIV
                setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);

            },
            error: function(data,status){
                if (data.status == 403){
                    localStorage.removeItem("token")
                    alert("You must be logged in to add new shop")
                    $(location).attr("href", "/login");

                }
                try {
                    data  = $.parseJSON(data.responseText)
                } catch (e) {
                    data = {message: "An error occured!"}
                }
                var x = document.getElementById("snackbar");
                if (data.message){
                    x.innerHTML = data.message
                }
                else{
                    x.innerHTML = "Wrong Input!"
                }
                x.className = "show";
          
                // After 3 seconds, remove the show class from DIV
                setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
            }    
        })
    }
    
    
    return false;
})