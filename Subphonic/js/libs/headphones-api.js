if($.cookie('username_headphones') != null){
    var usernameHead = $.cookie('username_headphones');
    var passwordHead = $.cookie('password_headphones');
    var urlHead = $.cookie('server_headphones');
    var apikeyHead = $.cookie('apikey_headphones');
    var baseURLHead;
    
    if(urlHead.indexOf('http:\/\/',0)>=0){
        baseURLHead = urlHead.substring(0,7)+usernameHead+':'+passwordHead+'@'+urlHead.substring(7,urlHead.length)+'/api?apikey='+apikeyHead;
    }else if (urlHead.indexOf('https:\/\/',0)>=0){
        baseURLHead = urlHead.substring(0,8)+usernameHead+':'+passwordHead+'@'+urlHead.substring(8,urlHead.length)+'/api?apikey='+apikeyHead;
    }else{
        baseURLHead = usernameHead+':'+passwordHead+'@'+urlHead+'/api?apikey='+apikeyHead;
    }
}

var versionHead;
var missingAlbums = [];

function getIndexHead(refresh,artistid) {
    hideButtonArtistHead();
    if (refresh) {
        $('#HeadphonesArtistContainer').empty();
    }
    var content = $('#HeadphonesArtistContainer').html();
    if (content === "") {
        showLoad();
        $.ajax({
            url: baseURLHead,
            type: 'GET',
            dataType: 'jsonp',
            data : {
                cmd : 'getIndex'
            },     
            success: function (data) {  
                hideLoad();
                $.each(data, function (i, artist) {
                    if (artist.ArtistName !== undefined) {
                        var html = "";
                        html += '<li id=\"' + artist.ArtistID + '\" class=\"item\">';
                        html += '<span>' + artist.ArtistName + '</span>';
                        html += '</li>';
                        $(html).appendTo("#HeadphonesArtistContainer");
                    }
                });
                $('#artist_filter_head').liveFilter({
                    defaultText: language['search']
                });
                $('#'+artistid).click();
            }
        });
    }
}

function getArtistHead(id) {
    showLoad();
    $('#action_removeAllWantedHeadphone').hide();
    $.ajax({
        url: baseURLHead,
        type: 'GET',
        dataType: 'jsonp',
        data: { 
            cmd : 'getArtist',
            id : id
        },
        success: function (data) {
            hideLoad();
            emptyAllHead();
            missingAlbums = [];
            var albumhtml;
            var header = generateAlbumHeaderHTMLHead();
            $('#AlbumHeaderHead').html(header);
            
            $.each(data.albums, function (i, album) {
                if(album.Status == 'Skipped'){
                    missingAlbums.push(album.AlbumID);
                }
                albumhtml = generateAlbumHTMLHead(album.Status, album.AlbumID, album.ArtistID, album.AlbumTitle, album.ArtistName,album.AlbumASIN,album.Type,album.ReleaseDate);
                $('#AlbumRowsHead').append(albumhtml);
            });
            updateCssContainerHead();
            $('#haveTrackHead').empty();
            $('#haveTrackHead').append(language['haveTrack']+data.artist[0].HaveTracks+'/'+data.artist[0].TotalTracks);
            $('#haveTrackHead').show();
            $('#action_refreshArtistsHeadphone').show();
            
            if(data.artist[0].Status == 'Active'){
                $('#action_pauseArtistHeadphone').show();
                $('#action_resumeArtistHeadphone').hide();
            }else{
                $('#action_resumeArtistHeadphone').show();
                $('#action_pauseArtistHeadphone').hide();
            }
            $('#action_delArtistHeadphone').show();
            
            if(missingAlbums.length>0){
                $('#action_wantMissingHeadphone').show();
            }
        }
    });
}

function getAlbumHead(id) {
    showLoad();
    $.ajax({
        url: baseURLHead,
        type: 'GET',
        dataType: 'jsonp',
        data: { 
            cmd : 'getAlbum',
            id : id
        },
        success: function (data) {
            hideLoad();
            emptyAllHead();
            var albumhtml;
            var header = generateSongHeaderHTML();
            $('#SongHeaderHead').html(header);
            
            $.each(data.tracks, function (i, track) {
                m = Math.floor((track.TrackDuration/1000) / 60),
                s = Math.floor((track.TrackDuration/1000) % 60);
                m = (m < 10 ? '0' : '') + m; 
                s = (s < 10 ? '0' : '') + s;
                songhtml = generateSongHTMLHead(track.Location, track.ArtistID, track.TrackNumber, track.TrackTitle, track.ArtistName, track.AlbumTitle, track.AlbumASIN, m, s);
                $('#SongRowsHead').append(songhtml);
            });
            
            updateCssContainerHead();
        }
    });
}


function wantAlbum(id,parentid){
    showLoad();
    $.ajax({
        url: baseURLHead,
        type: 'GET',
        dataType: 'jsonp',
        data: { 
            cmd : 'queueAlbum',
            id : id
        },
        timeout : 10000,
        error  : function(a,error){
            alert('Error : '+ error);
            hideLoad();
            if($('#headphonesSystem li.selected').html() != null){
                $('#headphonesSystem li.selected').click();
            }else{
                if($('#HeadphonesArtistContainer li.selected').html() != null){
                    $('#HeadphonesArtistContainer li.selected').click();
                }else{
                    if(parentid){
                        getArtistHead(parentid)
                    }
                }
            }
        },
        success: function (data) {
            hideLoad();
            if($('#headphonesSystem li.selected').html() != null){
                $('#headphonesSystem li.selected').click();
            }else{
                if($('#HeadphonesArtistContainer li.selected').html() != null){
                    $('#HeadphonesArtistContainer li.selected').click();
                }else{
                    if(parentid){
                        getArtistHead(parentid)
                    }
                }
            }
        }
    });
}

function searchHead(name) {
    showLoad();
    hideButtonArtistHead();
    emptyAllHead();
    name=name.replace(/ /g,'%20');
    /*$.ajax({
        url: '/apps/subphonic/templates/req.php',
        type: 'POST',
        dataType: 'json',
        data: { 
            u: usernameHead, 
            p: passwordHead,
            r : baseURLHead+'&cmd=findAlbum&name='+name
        },
        success: function (data) {
            hideLoad();
 
            var albumhtml;
            var header = generateSearchHeaderHTMLHead();
            $('#AlbumHeaderHead').html(header);
            
            $.each(data, function (i, album) {
                if (i % 2 === 0) {
                    rowcolor = 'even';
                } else {
                    rowcolor = 'odd';
                }
                albumhtml = generateSearchHTMLHead(rowcolor, album.albumid,album.id,album.title, album.uniquename,album.score,album.albumurl)
                $('#AlbumRowsHead').append(albumhtml);
            });
            
            updateCssContainerHead();
        }
    });*/
    
    showLoad();
    $.ajax({
        url: baseURLHead,
        type: 'GET',
        dataType: 'jsonp',
        data: { 
            cmd : 'findArtist',
            name : name
        },
        success: function (data) {
            hideLoad();
            var artisthtml;
            var header = generateArtistHeaderHTMLHead();
            $('#ArtistHeaderHead').html(header);
            
            $.each(data, function (i, artist) {
                if (i % 2 === 0) {
                    rowcolor = 'even';
                } else {
                    rowcolor = 'odd';
                }
                artisthtml = generateArtistHTMLHead(rowcolor, artist.id, artist.uniquename,artist.score,artist.url)
                $('#ArtistRowsHead').append(artisthtml);
            });
            
            $('a[rel="external"]').click(function() {
                window.open($(this).attr('href'));
                return false;
            });
            updateCssContainerHead();
        }
    });
}


function addArtist(id,albumid){
    if($('#'+id).length > 0){
        $('#'+id).click();
    }else{
        showLoad();
        hideButtonArtistHead();
        $.ajax({
            url: baseURLHead,
            type: 'GET',
            dataType: 'jsonp',
            data: { 
                cmd : 'addArtist',
                id : id
            },
            timeout : 10000,
            error  : function(a,error){
                alert('Error : '+ error);
                hideLoad();
                if(albumid){
                //wantAlbum(albumid,id);  
                }else{
                    getIndexHead(true,id);
                }
            },
            success: function (data) {
                hideLoad();
                if(albumid){
                //wantAlbum(albumid,id);  
                }else{
                    getIndexHead(true,id);
                }
            }
        });
    }
}


function getHistory(){
    showLoad();
    hideButtonArtistHead();
    emptyAllHead();
    $.ajax({
        url: baseURLHead,
        type: 'GET',
        dataType: 'jsonp',
        data: { 
            cmd : 'getHistory'
        },
        success: function (data) {
            hideLoad();
            var albumhtml;
            var header = generateHistoryHeaderHTMLHead();
            $('#HistoryHeaderHead').html(header);
            
            $.each(data, function (i, album) {
                if (i % 2 === 0) {
                    rowcolor = 'even';
                } else {
                    rowcolor = 'odd';
                }
                albumhtml = generateHistoryHTMLHead(rowcolor,album.Title, album.FolderName,album.DateAdded,album.Status);
                $('#HistoryRowsHead').append(albumhtml);
            });
            updateCssContainerHead();
        }
    });
}

function getLogs(){
    $('#ArtistRowsHead').append('<center>Not implemented in the API headphones (maybe soon)</center>');
    updateCssContainerHead();
/*showLoad();
    hideButtonArtistHead();
    emptyAllHead();
    $.ajax({
        url: baseURLHead,
        type: 'GET',
        dataType: 'jsonp',
        data: { 
            cmd : 'getLogs'
        },
        success: function (data) {
            hideLoad();
            
            updateCssContainerHead();
        }
    });*/
}

function getWanted(){
    showLoad();
    hideButtonArtistHead();
    emptyAllHead();
    $.ajax({
        url: baseURLHead,
        type: 'GET',
        dataType: 'jsonp',
        data: { 
            cmd : 'getWanted'
        },
        success: function (data) {
            hideLoad();
            var albumhtml;
            var header = generateWantUpHeaderHTMLHead();
            $('#WantUpHeaderHead').html(header);
            $.each(data, function (i, album) {
                if (i % 2 === 0) {
                    rowcolor = 'even';
                } else {
                    rowcolor = 'odd';
                }
                albumhtml = generateWantUpHTMLHead(rowcolor,album.AlbumID,album.AlbumTitle, album.ArtistName,album.DateAdded,album.ReleaseDate,album.Type,album.Status)
                $('#WantUpRowsHead').append(albumhtml);
            });
            updateCssContainerHead();
            $('#action_removeAllWantedHeadphone').show();
        }
    });
}

function getUpcoming(){
    showLoad();
    hideButtonArtistHead();
    emptyAllHead();
    $.ajax({
        url: baseURLHead,
        type: 'GET',
        dataType: 'jsonp',
        data: { 
            cmd : 'getUpcoming'
        },
        success: function (data) {
            hideLoad();
            var albumhtml;
            var header = generateWantUpHeaderHTMLHead();
            $('#WantUpHeaderHead').html(header);
            
            $.each(data, function (i, album) {
                if (i % 2 === 0) {
                    rowcolor = 'even';
                } else {
                    rowcolor = 'odd';
                }
                albumhtml = generateWantUpHTMLHead(rowcolor,album.AlbumID,album.AlbumTitle, album.ArtistName,album.DateAdded,album.ReleaseDate,album.Type,album.Status)
                $('#WantUpRowsHead').append(albumhtml);
            });
            updateCssContainerHead();
            
        }
    });
}

function removeWant(id){
    showLoad();
    $.ajax({
        url: baseURLHead,
        type: 'GET',
        dataType: 'jsonp',
        data: { 
            cmd : 'unqueueAlbum',
            id : id
        },
        timeout : 10000,
        error  : function(a,error){
            alert('Error : '+ error);
            hideLoad();
            if($('#headphonesSystem li.selected').html() != null){
                $('#headphonesSystem li.selected').click();
            }
            if($('#HeadphonesArtistContainer li.selected').html() != null){
                $('#HeadphonesArtistContainer li.selected').click();
            }
        },
        success: function (data) {
            hideLoad();
            if($('#headphonesSystem li.selected').html() != null){
                $('#headphonesSystem li.selected').click();
            }
            if($('#HeadphonesArtistContainer li.selected').html() != null){
                $('#HeadphonesArtistContainer li.selected').click();
            }
        }
    });
}

function getHeadVersion(appendto){
    if(versionHead){
        appendto.append(versionHead);
    }else{
        $.ajax({
            url: baseURLHead,
            type: 'GET',
            dataType: 'jsonp',
            data: { 
                cmd : 'getVersion'
            },
            timeout : 10000,
            error  : function(a,error){
                alert('Error : '+ error);
                hideLoad();
            },
            success: function (data) {
                versionHead = '<div style=\"font-size : 0.7em;\"><br/>Version :<br/>'+data.current_version;
                versionHead += '<br/>Latest :<br/>'+data.latest_version+'</div>';
                appendto.append(versionHead);
            }
        });
    }
}

function forceProcess(){
    $.ajax({
        url: baseURLHead,
        type: 'GET',
        dataType: 'jsonp',
        data: { 
            cmd : 'forceProcess'
        },
        timeout : 10000,
        error  : function(a,error){
            alert('Error : '+ error);
            hideLoad(); 
        },
        success: function (data) {
            
        }
    });
}

function forceSearch(){
    $.ajax({
        url: baseURLHead,
        type: 'GET',
        dataType: 'jsonp',
        data: { 
            cmd : 'forceSearch'
        },
        timeout : 10000,
        error  : function(a,error){
            alert('Error : '+ error);
            hideLoad(); 
        },
        success: function (data) {
            
        }
    });
}


function refreshArtist(id){
    if(id){
        showLoad();
        $.ajax({
            url: baseURLHead,
            type: 'GET',
            dataType: 'jsonp',
            data: { 
                cmd : 'refreshArtist',
                id : id
            },
            timeout : 10000,
            error  : function(a,error){
                alert('Error : '+ error);
                hideLoad(); 
                getArtistHead(id);
            },
            success: function (data) {
                hideLoad();
                getArtistHead(id);
            }
        });
    }
}

function pauseArtist(id){
    if(id){
        showLoad();
        $.ajax({
            url: baseURLHead,
            type: 'GET',
            dataType: 'jsonp',
            data: { 
                cmd : 'pauseArtist',
                id : id
            },
            timeout : 10000,
            error  : function(a,error){
                alert('Error : '+ error);
                hideLoad(); 
                getArtistHead(id);
            },
            success: function (data) {
                hideLoad();
                getArtistHead(id);
            }
        });
    }
}

function resumeArtist(id){
    if(id){
        showLoad();
        $.ajax({
            url: baseURLHead,
            type: 'GET',
            dataType: 'jsonp',
            data: { 
                cmd : 'resumeArtist',
                id : id
            },
            timeout : 10000,
            error  : function(a,error){
                alert('Error : '+ error);
                hideLoad(); 
                getArtistHead(id);
            },
            success: function (data) {
                hideLoad();
                getArtistHead(id);
            }
        });
    }
}

function deleteArtist(id){
    if(id){
        var question = confirm(language['areYouSureArtist']);
        if(question){
            showLoad();
            $.ajax({
                url: baseURLHead,
                type: 'GET',
                dataType: 'jsonp',
                data: { 
                    cmd : 'delArtist',
                    id : id
                },
                timeout : 10000,
                error  : function(a,error){
                    alert('Error : '+ error);
                    hideLoad();
                    emptyAllHead();
                    getIndexHead(true);
                },
                success: function (data) {
                    hideLoad();
                    emptyAllHead();
                    getIndexHead(true);
                }
            });
        }
    }
}

function getMissingAlbum(parentid){
    $.each(missingAlbums, function (i, missingAlbum) {
        wantAlbum(missingAlbum,parentid);
    });
}

function removeAllWanted(){
    if($('#headphonesSystem li.selected').attr("id")=='getWanted'){
        unwantedAlbum = $('#WantUpRowsHead tr:first')
        while(unwantedAlbum.attr("childid")){
            removeWant(unwantedAlbum.attr("childid"));
            unwantedAlbum = unwantedAlbum.next();
        }
    }
}


function addSearchArtist(name){
    searchHead(name);
    $('#liTabHeadphones').click();
}
