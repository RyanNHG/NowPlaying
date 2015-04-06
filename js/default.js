$(document).ready(onReady);

var loggedIn;

function onReady()
{
    loggedIn = false;
    loadPage("home");
    $('.link_login').click(promptLogin);
    $('#btn_login').click(login);
    $('#btn_logout').click(logout);
}

function loadPage(pageName)
{
    switch(pageName)
    {
        case "home":
            loadPageHelper("html/home.html",homeReady,pageName);
            break;
        default: 
            loadPageHelper("html/home.html", homeReady,pageName);
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
    $('.home-tabs a.tab').click(tabClicked);
    $('.search-column').keyup(searchBarClicked);
    $('#tab_popular').click();
}

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
            search($('#create_query').val() + " " + $('#find_query').val());
            return;  
    }
}

function search(query)
{
    $('.content-panel').slideUp(function(){
        $('.content-panel').html("");
        if(query != " ")
        {
            addPanel(query,"Artist",true);
            $('.content-panel').slideDown();
        }
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
    $('#loginModal').foundation('reveal', 'close');
    loggedIn = true;
    $('.link_login').text("Maria");
    $('.link_login').unbind( "click" );
    $('.link_login').click(promptLogout);
    $('#loginAlertSuccess').slideDown();
    $('#loginAlertSuccess .close').click(closeLoginAlert);
}

function logout()
{
    $('#logoutModal').foundation('reveal', 'close');
    loggedIn = false;
    $('.link_login').text("Login");
    $('.link_login').unbind( "click" );
    $('.link_login').click(promptLogin);
    $('#logoutAlertSuccess').slideDown();
    $('#logoutAlertSuccess .close').click(closeLoginAlert);
}

function closeLoginAlert()
{
    $('#loginAlertSuccess').slideUp();
}

function switchToTab(tab)
{    
    if($('#'+tab).hasClass('active')) return;
    $('.home-tabs a.tab.active').removeClass('active');
    $('#'+tab).addClass('active');
}

var lastClickedTab;

function getPlaylists(src)
{
    lastClickedTab = src;

    $('.content-panel').slideUp(function(){
        $('.content-panel').html("");

        $.getJSON( "data/data2.json",function(data){

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

function searchBarClicked()
{
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

    $('#tab_search').click();
}

function addPanel(title, username, lastPanel)
{
    var style="";
    if(lastPanel) style=' style="margin-bottom:0px;"';


    $('.content-panel').append(
    '<div class="row">'+
        '<div class="small-12 columns">'+
            '<div class="panel"'+style+'>'+
                '<h4>'+title+'</h4>'+
                '<h6>'+username+'</h6>'+
            '</div>'+
        '</div>'+
    '</div>'
    );
}