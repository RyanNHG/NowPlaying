/** TO-DO:
 *  - Add friend option
 *  - Alert on add and remove song/friend
 *  - mod modal
 *  - show saved playlists
 *  - show friends
 */  

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
    $('#btn_message').click(sendMessageClicked);
    $('#field_addSong').keyup(addSongChanged);
    $('#field_addSong').focusin(addSongFocusIn);
    $('#field_addSong').focusout(addSongFocusOut);
    $('#panel_info').click(toggleInfo);
    $('#setting_save').click(settingsSaved);
    $('#setting_cancel').click(toggleInfo);
    $('.setting_visibility').click(setVisibility);
    $('#setting_addMods').click(showModModal);
    $('#btn_toggleChat').click(toggleChat);
    $('#current_mods').text($('#current_author').text());
    currentSong = 0;
    playMusic();
}

///////////////////////////////
//  HOME  PAGE FUNCTIONS
///////////////////////////////
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
            else searchSongs($('#create_query').val(),true);
            return;  
    }
}

var MAX_SONGS = 3;
var MAX_ALBUMS = 2;

function searchSongs(query, home)
{
    if(home) panel = '.content-panel';
    else panel = '#row_results';
    
    $(panel).slideUp(function(){
        $.getJSON( "data/music.json",function(data){

            $(panel).html("");
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
                                    songs[i].title, getUsername(),home);
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
                                songs[i].album, getUsername(),home);
                            albums[num_albums] = songs[i].album;
                            num_albums++;
                        }
                    }
                }

                if(num_albums == 0)
                    addLabel("No albums found.");

                $(panel).slideDown();
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
                                        playlists[i].title, playlists[i].username,true);
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

                addPanel(item.title,item.username, item.songIds, item.title,item.username, true);
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

function addPanel(title, username, ids, name, author, home)
{
    if(home) panel = '.content-panel';
    else panel = '#row_results';
    
    $(panel).append(
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
    if(home)
        $('.link-panel').click(panelClicked);
    else
        $('.link-panel').click(addPanelClicked);
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
    songIds = $(this).attr('ids');
    playlistName = $(this).attr('name');
    playlistAuthor = $(this).attr('author');
    loadPage("play");
}


//  PLAY PAGE STUFF

function addPanelClicked()
{
    var ids = $.parseJSON($(this).attr('ids'));
    
    $.getJSON('data/music.json', function(data){
        
        var songs = data.songs;
        
        for(var i = 0; i < ids.length; i++)
        {
            var song = songs[ids[i]];
            addSongToPlaylist(song.title, song.artist, false);
        }
        
    });
    
    $('#field_addSong').val('');
}

function addSongChanged()
{
    if(userIsMod())
    {
        searchSongs($(this).val(),false);
    }
    else $('#field_addSong').val("");
}

function addSongFocusIn()
{
    if(userIsMod())
    {
        $('#dark_panel').slideUp(function(){
            $('#add_panel').slideDown(); 
        });
    }
    else showModError();
}

function showModError()
{
    $('#modAlertError').slideDown().delay(1000).slideUp();
}

function addSongFocusOut()
{
    $('#add_panel').slideUp(function(){
        $('#dark_panel').slideDown(); 
    });
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
    if($("#btn_play > i").hasClass("fi-pause"))
        prevSongClicked = true;
    else prevSong();
}

function prevSong()
{
    $( ".progress > .meter" ).css("width","0%");
    currentSong = (currentSong+numSongs-1)%numSongs;
    setActiveSongPanel();
    
    generateBotMessage(bot_msg_next);
}

function nextClicked()
{
    if($("#btn_play > i").hasClass("fi-pause"))
        nextSongClicked = true;
    else nextSong();
}

function nextSong()
{
    $( ".progress > .meter" ).css("width","0%");
    currentSong = (currentSong+1)%numSongs;
    setActiveSongPanel();
    
    generateBotMessage(bot_msg_next);
}

function setActiveSongPanel()
{
    $('.song_panel.active').removeClass('active');
    $('#song_panel'+currentSong).addClass('active');
    $('#current_title').text($('#song_panel'+currentSong).attr('title'));
    $('#current_artist').text($('#song_panel'+currentSong).attr('artist'));
    $("#row_songs").animate({ scrollTop: $('#song_panel0').parent().height()*currentSong}, 1000);
}

function removeSongPanel()
{
    if(userIsMod())
    {
        var id = $(this).attr('song_id');
        
        numSongs--;
        
        $('#song_panel' + id).remove(); 
    
        if(id < currentSong) 
            currentSong--;
        else if(id == currentSong)
        {
            nextSong();
            currentSong--;
        }
        
        while(id < numSongs + 1)
        {
            console.log(id);
            $('#song_panel'+id+' a').attr("song_id","" + (id - 1));
            $('#song_panel'+id).attr("id","song_panel" + (id - 1));
            id++;
        }
        
        if(numSongs == 0)
        {
            $('#current_title').text('Add a song');
            $('#current_artist').text();
            togglePlayPause();
            $( ".progress > .meter" ).css("width","0%");
        }
    }
    else showModError();
}

var numSongs;

function initPlaylist()
{
    var ids = $.parseJSON(songIds);
    numSongs = 0;
    
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
            addSongToPlaylist(song.title, song.artist, i==0);
        }
        
    });
    
    generateBotMessage(bot_msg_join);
}

function togglePlayPause()
{
    if(numSongs != 0 || $("#btn_play > i").hasClass("fi-pause"))
    {
        $("#btn_play > i").toggleClass("fi-play");
        $("#btn_play > i").toggleClass("fi-pause");
        
        if($("#btn_play > i").hasClass("fi-pause")) playMusic();
        else generateBotMessage(bot_msg_pause);
    }
}

function toggleSave()
{
    if(getUsername() == "Anonymous")
        promptLogin();
    else
    {
        $('#btn_save').toggleClass("active");
        if(oldVersionSaved()) promptReplace();
    }
}

function oldVersionSaved()
{
    return false;
}

function toggleChat()
{
    $('#btn_toggleChat i').toggleClass('fi-arrow-down');
    $('#btn_toggleChat i').toggleClass('fi-arrow-up');
    $('#panel_chat').parent().slideToggle(function () {
        if($('#panel_chat').parent().css("display") != "none")
        {
            $('#row_modInfo').slideUp();
            $('#row_publicInfo').slideUp();
        }
    });
    
}

function promptReplace()
{
    $('#saveModal').foundation('reveal','open');
}

function addSongToPlaylist(title, artist, active)
{
    var classy = "";
    if(active) classy=" active";
    
    $('#row_songs').append(
                '<div class="small-12 columns">'+
                    '<div class="panel song_panel'+classy+'" id="song_panel'+numSongs+'" title="'+title+'" artist="'+artist+'">'+
                        '<div class="row">'+
                            '<div class="small-11 columns">'+
                                '<h5 class="playlist">'+title+'</h5>'+
                                '<p class="artist">'+artist+'</p>'+
                            '</div>'+
                            '<div class="small-1 columns div_remove">'+
                                '<div class="row collapse">'+
                                    '<div class="small-12 columns">'+
                                        '<a song_id='+numSongs+'>'+
                                        '<i class="fi-x"></i>'+
                                        '</a>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>');
                
     $('#song_panel'+numSongs+' a').click(removeSongPanel);
                
     numSongs++;
     
     if(numSongs == 1)
     {
        $('#current_title').text(title);
        $('#current_artist').text(artist);
     }
}

function makeUserMod()
{
    if(!userIsMod())
    {
        $('#current_mods').text($('#current_mods').text()+', '+getUsername());
        sendMessage(bot_msg_modconfirm[0],
                $('#current_author').text());
    }
}

function showModModal()
{
    $('#modModal').foundation('reveal','open');
}

function sendMessageClicked()
{
    if(getUsername() == "Anonymous")
        promptLogin();
    else
    {
        sendMessage($('#field_message').val(),getUsername());
        
        if($('#field_message').val().indexOf("mod") > -1)
            makeUserMod();
            
        $('#field_message').val("");
    }
}

var bot_names = ["Maria","Bob","Ryan","Adam","Matt","Trace"];
var bot_msg_pause = ["Oh no! I loved %song%", 
                    "Play it! Please?", 
                    "%user%, you're killing my vibe!"];
var bot_msg_next = ["Sweet! %song% is where it's at!", 
                    "I'm so sick of this song...",
                    "Alright, changing things up!"];
var bot_msg_add = ["Good choice, %user%!",
                    "I don't think I've heard this before.",
                    "Cool song!"];
var bot_msg_remove = ["Why'd you remove that???", 
                      "I was looking forward to that one!", 
                      "I never liked that song, anyway..."];
var bot_msg_join = ["Hey, %user%!", 
                    "What's up, %user%?", 
                    "Welcome to the jam sesh, %user%!"];
var bot_msg_modconfirm = ["Hey %user%, you're a mod now!"];

function generateBotMessage(array)
{
    var rand_message = Math.floor(Math.random()*array.length);
    var rand_sender = Math.floor(Math.random()*bot_names.length);
    
    sendMessage(array[rand_message],bot_names[rand_sender]);
}

function sendMessage(message,sender)
{
    var colorClass = 'blue_sender';
    if(sender == getUsername()) colorClass = "purple_sender";
    message = ''+message;
    message = (message.replace('%user%', getUsername())).replace('%song%', $('#current_title').text());
    
    $('#row_chatarea').append(
        '<div class="small-12 columns newMessage">'+
          '<div class="message '+colorClass+'">'+
            '<h6><strong>'+sender+': </strong></h6>'+
            '<p>'+message+'</p>'+
            '<hr>'+
          '</div>'+
        '</div>'
    );
    
    $('.newMessage').fadeIn(function () 
    {
        $('.newMessage').removeClass('newMessage');    
    });
    
    $("#row_chatarea").animate({ scrollTop: $('#row_chatarea')[0].scrollHeight}, 1000);
    
}

//  Info panel
function toggleInfo()
{
    if($('#row_publicInfo').css('display') == 'none' &&
        $('#row_modInfo').css('display') == 'none')
    {
        if(userIsMod())
        {
            $('#setting_playlist').val($('#current_playlist').text());
            $('#setting_description').val($('#current_description').text());
            $('#setting_modlist').val($('#current_mods').text());
            $('#row_modInfo').slideDown();
        }
        else
        {
            $('#row_publicInfo').slideDown();
        }
        toggleChat();
    }
    else
    {
        $('#row_modInfo').slideUp();
        $('#row_publicInfo').slideUp();
        toggleChat();
    }
}

function settingsSaved()
{
    if($('#setting_playlist').val() != "")
    {
        $('#current_playlist').text($('#setting_playlist').val());
        $('#current_description').text($('#setting_description').val());
        $('#current_visibilityLabel').text($('#setting_visibilityLabel').text());
        
        $('.btn_visibility').removeClass('active');
        
        if($('#setting_public').hasClass('active'))
            $('#btn_public').addClass('active');
        else if($('#setting_friendsOnly').hasClass('active'))
            $('#btn_friendsOnly').addClass('active');
        else if($('#setting_private').hasClass('active'))
            $('#btn_private').addClass('active');
            
        $('#current_mods').text($('#setting_modlist').val());
        
        toggleChat();
        $('#settingsAlertSuccess').slideDown().delay(1000).slideUp();
    }
    else $('#settingsAlertError').slideDown().delay(1000).slideUp();
}

function setVisibility()
{

    $('.setting_visibility').removeClass('active');
    $(this).addClass('active');
    
    if($('#setting_public').hasClass('active'))
        $('#setting_visibilityLabel').text('Public');
    else if($('#setting_friendsOnly').hasClass('active'))
        $('#setting_visibilityLabel').text('Friends Only');
    else if($('#setting_private').hasClass('active'))
        $('#setting_visibilityLabel').text('Private');
}

function userIsMod()
{
    return ($('#current_mods').text().indexOf(getUsername()) > -1);
}