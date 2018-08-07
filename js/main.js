
// Init request
let xhr = new XMLHttpRequest();
xhr.open("GET", "https://www.poznan.pl/featureserver/featureserver.cgi/mpk_przystanki_wgs/", true);
xhr.addEventListener('load', function() {

    // If request status is OK run the program
    if (this.status === 200) {

        // Variable declaration
        var map = L.map('mapid').setView([52.40, 16.94], 12.1),
            json = JSON.parse(this.responseText),
            osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {
                foo: 'bar',
                attribution: '<a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
                }).addTo(map),
            markerGroup = L.layerGroup().addTo(map),
            searchSubmit = document.getElementById("searchsubmit"),
            allSubmit = document.getElementById("allsubmit"),
            busSubmit = document.getElementById("bussubmit"),
            tramSubmit = document.getElementById("tramsubmit"),
            searchBox = document.getElementById("searchbox");


        // Information content in popup after click in stations
        function contentOfPopup (feature, layer) {
            layer.bindPopup(
                '<h3 class="pop">' + feature.properties.a3 + '</h3>' +
                '<span>' + feature.properties.a5 + '<br></span>' +
                '<span>obsługiwane linie: ' + feature.properties.a2 + '</span>'
            );
        };

        // Syles of markers
        function GeojsonMarkerStyle(fillcolor) {
            this.radius = 8;
            this.fillColor = fillcolor;
            this.color = "#000";
            this.weight = 1;
            this.opacity = 1;
            this.fillOpacity = 0.3;
        };

        // Add choiced markers to currently visible layer
        function addMarkersToMap(typeOfTransport){
            markerGroup.clearLayers();
            typeOfTransport.addTo(markerGroup);
        };

        // Manualy selected line of public transport e.g. 12
        function CoustomLine (searchBoxValue, markerGroup){
            L.geoJSON(json, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, new GeojsonMarkerStyle("#6c757d"));
                },
                filter: function (feature) {
                    var lines = feature.properties.a2.replace(' ', '').split(',');
                    if (lines.indexOf(searchBoxValue) != -1) {
                        return true
                    }
                    else {
                        return false
                    };
                },
                onEachFeature: function (feature, layer) {
                    contentOfPopup(feature, layer)
                }
            }).addTo(markerGroup);
        };

        // Selected all lines public transport: bus + tram
        var all = L.geoJSON(json, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, new GeojsonMarkerStyle("#007bff"));
            },
            filter: function (feature) {
                switch (feature.properties.a1) {
                    case '1': return true;
                    case '2': return true;
                }
            },
            onEachFeature: function (feature, layer) {
                contentOfPopup(feature, layer)
            }
        });

        // Selected bus lines public transport
        var bus = L.geoJSON(json, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, new GeojsonMarkerStyle("#dc3545"));
            },
            filter: function (feature) {
                switch (feature.properties.a1) {
                    case '1': return true;
                    case '2': return false;
                }
            },
            onEachFeature: function (feature, layer) {
                contentOfPopup(feature, layer)
            }
        });

        // Selected tram lines public transport
        var tram = L.geoJSON(json, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, new GeojsonMarkerStyle("#28a745"));
            },
            filter: function (feature) {
                switch (feature.properties.a1) {
                    case '1': return false;
                    case '2': return true;
                }
            },
            onEachFeature: function (feature, layer) {
                contentOfPopup(feature, layer)
            }
        });


        // Change event - search one line input field
        searchBox.addEventListener("change", function() {
            markerGroup.clearLayers();
            var searchBox = document.getElementById("searchbox");
            var searchBoxValue = searchBox.value;
            new CoustomLine(searchBoxValue, markerGroup);
        });

        // Click event - all lines button
        allSubmit.addEventListener("click", function() {
            addMarkersToMap(all)
        });

        // Click event - bus lines button
        busSubmit.addEventListener("click", function() {
            addMarkersToMap(bus)
        });

        // Click event - tram lines button
        tramSubmit.addEventListener("click", function() {
            addMarkersToMap(tram)
        });
    }});

// Send request
xhr.send();
