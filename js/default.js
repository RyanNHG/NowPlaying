$(document).ready(onReady);

function onReady()
{
    loadPage("home");
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

    $.getJSON( "data/data.json",function(data){

        var item;

        for (var i = 0; i < data.popular_lists.length; i++) 
        {
            item = data.popular_lists[i];

            if(i==data.popular_lists.length-1) 
                addPanel(item.title,item.username, true);
            else 
                addPanel(item.title,item.username, false);
        };

        $('.content-panel').slideDown();

    });
}

function tabClicked()
{
    $('.home-tabs a.tab.active').removeClass('active');
    $(this).addClass('active');
}

function addPanel(title, username, margin)
{
    var style="";
    if(margin) style=' style="margin-bottom:0px;"';


    $('.content-panel').append(
    '<div class="row">'+
        '<div class="small-12 columns">'+
            '<div class="panel"'+style+'>'+
                '<h5>'+title+'</h5>'+
                '<p>'+username+'</p>'+
            '</div>'+
        '</div>'+
    '</div>'
    );
}