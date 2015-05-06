$(document).ready(onReady);

var loggedIn;

function onReady()
{
    loggedIn = false;
    $('.link_home').click(loadPage);
    $('.link_login').click(promptLogin);
    $('.link_logout').click(promptLogout);
    $('#btn_create').click(login);
    $('#btn_login').click(login);
    $('#btn_logout').click(logout);
    loadPage("home");
}

function loadPage(pageName)
{
    switch(pageName)
    {
        case "play":
            loadPageHelper("html/play.html?version=5",playReady,pageName);
            break;
        default: 
            loadPageHelper("html/home.html?version=5", homeReady,pageName);
            break;
    }
}

function loadPageHelper(htmlFile, func, pageName)
{
    $('#page_active').fadeOut(function() {
        $('#page_active').load(htmlFile,function() 
        {
            if(pageName == "play")
            {
                initPlaylist();
            }
            
            $('#page_active').fadeIn(func);
        });
    });
}

function homeReady()
{
    $('.home-tabs a').click(tabClicked);
    $('.search-column').keyup(doSearch);
    $('.search-column').click(expandSearchbar);
    $('#tab_popular').click();
}

var nextSongClicked;
var prevSongClicked;
function playReady()
{
    $('#btn_play').click(togglePlayPause);
    $('#btn_prev').click(prevClicked);
    $('#btn_next').click(nextClicked);
    $('#btn_save').click(toggleSave);
    currentSong = 0;
    playMusic();
}

//  HOME  PAGE FUNCTIONS

function tabClicked()
{
    var tab = $(this).attr('id');

    switch(tab)
    {
        case 'tab_popular':
            if($(this).hasClass('active')) return;
            switchToTab(tab);
            getPlaylists('popular');
            break;

        case 'tab_saved':
            if($(this).hasClass('active')) return;
            if(loggedIn)
            {
                switchToTab(tab);
                getPlaylists('saved');
            }
            else promptLogin();
            break;

        case 'tab_friends':
            if($(this).hasClass('active')) return;
            if(loggedIn)
            {
                switchToTab(tab);
                getPlaylists('friends');
            }
            else promptLogin();
            break;

        case 'tab_search':
            switchToTab(tab);
            if(searchbarId=="div_find")
                searchPlaylists($('#find_query').val());
            else searchSongs($('#create_query').val());
            return;  
    }
}

var MAX_SONGS = 3;
var MAX_ALBUMS = 2;

function searchSongs(query)
{
    $('.content-panel').slideUp(function(){
        $.getJSON( "data/music.json",function(data){

            $('.content-panel').html("");
            if(query != "")
            {
                var songs = data.songs;
                var num_songs = 0;
                var num_albums = 0;
                var albums = [];


                addLabel("SONGS");

                for(var i = 0; i < songs.length; i++)
                {
                    if(songs[i].title.toLowerCase().indexOf(query.toLowerCase()) != -1 
                        && num_songs < MAX_SONGS)
                    {
                        addPanel(songs[i].title, songs[i].artist, [i],
                                    songs[i].title, getUsername());
                        num_songs++;
                    }
                }

                if(num_songs == 0)
                    addLabel("No songs found.");

                addLabel("");
                addLabel("ALBUMS");

                for(var i = 0; i < songs.length; i++)
                {
                    if((songs[i].album.toLowerCase().indexOf(query.toLowerCase()) != -1 ||
                        songs[i].artist.toLowerCase().indexOf(query.toLowerCase()) != -1) 
                        && num_albums < MAX_ALBUMS)
                    {
                        if(num_albums == 0 || (num_albums > 0 && albums[num_albums-1] != songs[i].album))
                        {
                            addPanel(songs[i].album, songs[i].artist, getSongIdsFromAlbum(songs,i), 
                                songs[i].album, getUsername());
                            albums[num_albums] = songs[i].album;
                            num_albums++;
                        }
                    }
                }

                if(num_albums == 0)
                    addLabel("No albums found.");

                $('.content-panel').slideDown();
            }
        });
    });
}

function getSongIdsFromAlbum(songs, i)
{
    var album = songs[i].album;
    var array = [];
    var num_songs = 1;
    
    array[0] = i;
    
    for(var j = i+1; j < songs.length; j++)
    {
        var song = songs[i];
        
        if(song.album == album)
        {
            array[num_songs] = j;
            num_songs++;
        }
        else break;
    }
    
    return array;
}

var MAX_LISTS = 5;

function searchPlaylists(query)
{
    $('.content-panel').slideUp(function(){
        $.getJSON( "data/music.json",function(data){

            $('.content-panel').html("");
            if(query != "")
            {
                var playlists = data.popular;
                var num_lists = 0;
                var lists = [];


                addLabel("PLAYLISTS");

                for(var i = 0; i < playlists.length; i++)
                {
                    if((playlists[i].title.toLowerCase().indexOf(query.toLowerCase()) != -1 ||
                        playlists[i].username.toLowerCase().indexOf(query.toLowerCase()) != -1) 
                        && num_lists < MAX_LISTS)
                    {
                        if(num_lists == 0 || (num_lists > 0 && lists[num_lists-1] != playlists[i].title))
                        {
                            addPanel(playlists[i].title, playlists[i].username, playlists[i].songIds,
                                        playlists[i].title, playlists[i].username);
                            lists[num_lists] = playlists[i].title;
                            num_lists++;
                        }
                    }
                }

                if(num_lists == 0)
                    addLabel("No playlists found.");

                $('.content-panel').slideDown();
            }
        });
    });
}

function promptLogin()
{
    $('#loginModal').foundation('reveal','open');
}

function promptLogout()
{
    $('#logoutModal').foundation('reveal','open');
}

function login()
{
    //  Close modal
    $('#loginModal').foundation('reveal', 'close');
    
    //  Login
    loggedIn = true;

    //  Show username in top right
    $('#li_user > a').text(getUsername());

    //  Show logout button
    $('#li_login').toggle();
    $('#li_user').toggle();

    //  Display alert and set up alert close event
    $('#loginAlertSuccess').slideDown().delay(1000).slideUp();
}

var username;

function getUsername()
{
    if(loggedIn)
        username = $('#username').val();
    else username = "Anonymous";
    
    return username;
}

function playMusic()
{
    $( ".progress > .meter" ).animate({
        width: "+=1%"
      }, 100, function() {
          if($("#btn_play > i").hasClass("fi-pause"))
          {
              var max = $( ".progress" ).width();
              
              if($( ".progress > .meter" ).width() > max || nextSongClicked)
              {
                  nextSong();
                  nextSongClicked = false;
              }
              else if(prevSongClicked)
              {
                  prevSong();
                  prevSongClicked = false;
              }
              playMusic();
          }
      });
}

var currentSong;

function prevClicked()
{
    prevSongClicked = true;
}

function prevSong()
{
    $( ".progress > .meter" ).css("width","0%");
}

function nextClicked()
{
    nextSongClicked = true;
}

function nextSong()
{
    $( ".progress > .meter" ).css("width","0%");
    currentSong++;
    setActiveSongPanel();
}

function setActiveSongPanel()
{
    $('.song_panel.active').removeClass('active');
}

function logout()
{
    //  Close modal
    $('#logoutModal').foundation('reveal', 'close');
    
    //  Logout
    loggedIn = false;

    //  Hide logout button
    $('#li_login').toggle();
    $('#li_user').toggle();

    //  Display alert and set up alert close timer.
    $('#logoutAlertSuccess').slideDown().delay(1000).slideUp();
}

function closeAlert()
{
    $('#alert-box').slideUp();
}

function switchToTab(tab)
{    
    if($('#'+tab).hasClass('active')) return;
    $('.home-tabs a.active').removeClass('active');
    $('#'+tab).addClass('active');
}

var lastClickedTab;

function getPlaylists(src)
{
    lastClickedTab = src;

    $('.content-panel').slideUp(function(){
        $('.content-panel').html("");

        $.getJSON( "data/music.json",function(data){

            var item;
            var array;
            console.log(data);

            switch(lastClickedTab)
            {
                case 'popular':
                    array = data.popular; break;
                case 'saved':
                    array = data.saved; break;
                case 'friends':
                    array = data.friends; break;
                default:
                    alert("uhoh");return;
            }

            for (var i = 0; i < array.length; i++) 
            {
                item = array[i];

                addPanel(item.title,item.username, item.songIds, item.title,item.username);
            };

            $('.content-panel').slideDown();

        });
    });
}

function doSearch()
{
    $('#tab_search').click();
}

var searchbarId;

function expandSearchbar()
{
    searchbarId = $(this).attr('id');

    if(!$(this).hasClass('medium-9'))
    {
        //  If first click
        if($(this).hasClass('medium-6'))
        {
            $('.search-column').removeClass('medium-6');
            $('.search-column').addClass('medium-3');

            $(this).removeClass('medium-3');
            $(this).addClass('medium-9');
        }
        else
        {
            $('.search-column').toggleClass('medium-3');
            $('.search-column').toggleClass('medium-9');
        }
    }
}

function addPanel(title, username, ids, name, author)
{
    $('.content-panel').append(
    '<a class="link-panel" ids="['+ids+']" name="'+name+'" author="'+author+'">'+
        '<div class="row">'+
            '<div class="small-12 columns">'+
                '<div class="panel">'+
                    '<h4>'+title+'</h4>'+
                    '<h6>'+username+'</h6>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</a>'
    );
    
    $('.link-panel').unbind('click');
    $('.link-panel').click(panelClicked);
}

function addLabel(str)
{
    $('.content-panel').append(
        '<div class="row">'+
          '<div class="small-12 columns">'+
            '<h4 style="color: white;">'+str+'</h4>'+
          '</div>'+
        '</div>'
    );
}

var songIds;
var playlistName;
var playlistAuthor;

function panelClicked()
{
    console.log("Panel clicked");
    songIds = $(this).attr('ids');
    playlistName = $(this).attr('name');
    playlistAuthor = $(this).attr('author');
    loadPage("play");
}


//  PLAY PAGE STUFF

var numSongs;

function initPlaylist()
{
    var ids = $.parseJSON(songIds);
    numSongs = ids.length;
    
    $('#current_playlist').text(playlistName);
    $('#current_author').text(playlistAuthor);
    
    $.getJSON('data/music.json', function(data){
        
        $('#row_songs').html("");
        
        var songs = data.songs;
        
        $('#current_title').text(songs[ids[0]].title);
        $('#current_artist').text(songs[ids[0]].artist);
        
        for(var i = 0; i < ids.length; i++)
        {
            var song = songs[ids[i]];
            addSongToPlaylist(song.title, song.artist, i, i==0);
        }
        
    });
}

function togglePlayPause()
{
    $("#btn_play > i").toggleClass("fi-play");
    $("#btn_play > i").toggleClass("fi-pause");
    
    if($("#btn_play > i").hasClass("fi-pause")) playMusic();
}

function toggleSave()
{
    $('#btn_save').toggleClass("success");
    promptReplace();
}

function promptReplace()
{
    $('#saveModal').foundation('reveal','open');
}

function addSongToPlaylist(title, artist, id, active)
{
    var classy = "";
    if(active) classy=" active";
    
    $('#row_songs').append(
                '<div class="small-12 columns">'+
                    '<div class="panel song_panel'+classy+' id='+id+'">'+
                        '<div class="row">'+
                            '<div class="small-11 columns">'+
                                '<h5 class="playlist">'+title+'</h5>'+
                                '<p class="artist">'+artist+'</p>'+
                            '</div>'+
                            '<div class="small-1 columns div_remove">'+
                                '<div class="row collapse">'+
                                    '<div class="small-12 columns">'+
                                        '<a>'+
                                        '<i class="fi-x"></i>'+
                                        '</a>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>');
}