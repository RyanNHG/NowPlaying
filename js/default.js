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
            loadPageHelper("html/play.html?version=3",playReady,pageName);
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

function playReady()
{
    //$(document).foundation('slider', 'reflow');


    $('#btn_play').click(togglePlayPause);
    $('#btn_save').click(toggleSave);
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
                        addPanel(songs[i].title, songs[i].artist, false);
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
                        if(num_albums == 0 || (num_albums > 1 && albums[i-1] != songs[i].album))
                        {
                            addPanel(songs[i].album, songs[i].artist, false);
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
                        if(num_lists == 0 || (num_lists > 1 && lists[i-1] != playlists[i].title))
                        {
                            addPanel(playlists[i].title, playlists[i].username, false);
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

function getUsername()
{
    return $('#username').val();
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

                if(i==array.length-1) 
                    addPanel(item.title,item.username, true);
                else 
                    addPanel(item.title,item.username, false);
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

function addPanel(title, username, lastPanel)
{
    var style="";
    if(lastPanel) style = ' style="margin-bottom:0px;"';

    $('.content-panel').append(
    '<a class="link-panel">'+
        '<div class="row">'+
            '<div class="small-12 columns">'+
                '<div class="panel"'+style+'>'+
                    '<h4>'+title+'</h4>'+
                    '<h6>'+username+'</h6>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</a>'
    );

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


function panelClicked()
{
    loadPage("play");
}


//  PLAY PAGE STUFF

function togglePlayPause()
{
    $("#btn_play > i").toggleClass("fi-play");
    $("#btn_play > i").toggleClass("fi-pause");
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