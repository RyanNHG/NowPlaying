$(document).ready(onReady);

var currentSubreddit;

function onReady()
{
    //  Add link functionality
    $('.link_start').click(function(){
        setNav('#nav_start');
        showPage('#page_start');
    });
    $('.link_home').click(function(){
        setNav('#nav_home');
        showPage('#page_home');
    });

    //  Add tab functionality
    $('.tab_popular').click(function(){
        setTab('#tab_popular');
        showSection('#section_popular');
    });
    $('.tab_saved').click(function(){
        setTab('#tab_saved');
        showSection('#section_saved');
    });
    $('.tab_friends').click(function(){
        setTab('#tab_friends');
        showSection('#section_friends');
    });
    $('.tab_settings').click(function(){
        setTab('#tab_settings');
        showSection('#section_settings');
    });

    //  Show home page
    $('#page_start').addClass('activePage');
    $('#page_start').fadeIn();

    //  Set default tab
    $('#section_popular').addClass('activeSection');
    $('#section_popular').fadeIn();

}

function setNav(nav)
{

    $('.toggle-topbar > a').trigger( "click" );
    if($(nav).hasClass('active')) return;

    $('nav > section > ul > li').removeClass('active');
    $(nav).addClass('active');

}

function setTab(tab)
{
    if($(tab).hasClass('active')) return;

    $('.tab').removeClass('active');
    $(tab).addClass('active');
}

function showPage(page)
{
    if($(page).hasClass('activePage')) return;

    $('.activePage').slideUp(400, function()
        {
            $(page).slideDown();
            $('.activePage').removeClass('activePage');
            $(page).addClass('activePage');
        }
    );
}

function showSection(section)
{
    if($(section).hasClass('activeSection')) return;

    $('.activeSection').slideUp(400, function()
        {
            $(section).slideDown();
            $('.activeSection').removeClass('activeSection');
            $(section).addClass('activeSection');
        }
    );
}

function loadSubreddit(subreddit)
{
    $('.reddit_content').html("");

    currentSubreddit = subreddit;
    var url = "http://api.reddit.com/r/" + subreddit;

    $.getJSON(url, function(data){

        $.each( data.data.children, function( key, val ) {
            var is_self = val.data.is_self;
            var title = val.data.title;
            var author = val.data.author;
            var url = val.data.url;
            var domain = val.data.domain;
            var selftext = val.data.selftext;

            if(is_self)
            {
                $('.reddit_content').append(''+
                '<div class="panel" style="padding: 0px;">'+
                    '<div class="row">' +
                        '<div class="small-12 columns">' +
                            '<div style="padding: 1.25rem;">' +
                                '<h3>'+title+'</h3>' +
                                '<p style="color: gray; margin-bottom: 0px;">'+author+'</p>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<hr>' +
                    '<div class="row">' +
                        '<div class="small-12 columns">' +
                            '<div style="padding: 1.25rem;">' +
                                '<p>'+selftext+'</p>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
                );
            }
            else if(domain.indexOf("i.imgur") > -1)
            {
                $('.reddit_content').append(''+
                '<div class="panel" style="padding: 0px;">'+
                    '<div class="row">' +
                        '<div class="small-12 columns">' +
                            '<div style="padding: 1.25rem;">' +
                                '<h3>'+title+'</h3>' +
                                '<p style="color: gray; margin-bottom: 0px;">'+author+'</p>' +
                            '</div>' +
                            '<a href='+url+' target="_blank" >' +
                                '<div style="width: 100%; height: 250px;">' +
                                    '<div style="height: 100%; background-size: cover; -moz-background-size: cover;' +
                                    ' -webkit-background-size: cover; background-position: center; background-image: url('+url+');">' +
                                    '</div>' +
                                '</div>' +
                            '</a>' + 
                        '</div>' +
                    '</div>' +
                '</div>'
                );
            }
            else
            {
                $('.reddit_content').append(''+
                '<div class="panel" style="padding: 0px;">'+
                    '<div class="row">' +
                        '<div class="small-12 columns">' +
                            '<div style="padding: 1.25rem;">' +
                                '<h3>'+title+'</h3>' +
                                '<p style="color: gray; margin-bottom: 0px;">'+author+'</p>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<hr>' +
                    '<div class="row">' +
                        '<div class="small-12 columns">' +
                            '<div style="padding: 1.25rem;">' +
                                '<a href='+url+' target="_blank">'+url+'</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
                );
            }
        });

    });

    $('.reddit_image').click(function(){
        console.log("URL");
        /*
        url = $(this).attr('data-url');
        $('#modal_img').attr('src',url);
        */
    });
}
