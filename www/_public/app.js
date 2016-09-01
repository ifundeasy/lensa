$(function () {
    //var url = 'https://io.speakmessenger.net';
    var url = 'https://io.dev.speakmessenger.net';
    var toTitleCase = function (str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };
    var trim = function (str) {
        return str.toString().toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, "");
    };
    var states, page, navbar = $('#navbar'), restify = $('#restify'), container = $('#page');
    //
    App.host = 'https://io.speakmessenger.net';
    App.host = 'https://io.dev.speakmessenger.net';
    App.navbar = window.navbar;
    App.navbar.forEach(function(nb, i, navbars){
        var parent = navbar, child;
        var titles = nb.titles.split('|');
        var tag, text = titles.slice(-1)[0];
        if (text.split('-').length > 1) {
            tag = text.split('-')[0];
            text = text.split('-').pop();
        } else {
            text = toTitleCase(text);
        }
        //if (!stateIdx && stateIdx < nb.index)
        if (nb.index !== 0) {
            var ul, path = nb.path.split('|').slice(0, -1).join('|');
            parent = parent.find('li[path="'+ path +'"]');
            child = $(
                '<li class="nav-item" path="' + nb.path + '" ptitle="'+ nb.titles +'">' +
                    '<a href="#' + nb.path.replace(/\|/g, '/') + '" class="nav-link">' +
                        '<span class="title">' + text + '</span>' +
                    '</a>' +
                '</li>'
            );
            ul = parent.find('ul.sub-menu');
            if (!parent.find('ul.sub-menu').length) {
                ul = $('<ul class="sub-menu"></ul>');
                parent.append(ul);
                parent.find('a:first-child').attr('href', 'javascript:;');
                parent.find('a:first-child').addClass('nav-toggle');
                parent.find('a:first-child').append('<span class="arrow"></span>');
            }
            ul.append(child);
        } else {
            child = $(
                '<li class="nav-item" path="'+ nb.path +'" ptitle="'+ nb.titles +'">' +
                    '<a href="#' + nb.path.replace(/\|/g, '/') + '" class="nav-link">' +
                        '<span class="icon-tumbnailer">'+ nb.name[0].toUpperCase() +'</span>' +
                        '<span class="title">'+ nb.name +'</span>' +
                    '</a>' +
                '</li>'
            );
            parent.append(child);
        }
        if (tag) child.children('a').append('<span class="badge badge-success">' + tag[0] + '</span>')
    });
    restify.hide();
    restify.load('/app/console/page.html');
    navbar.find('li>a[href!="javascript:;"]').on('click', function(){
        var superParent = navbar.find('li[path="'+ $(this).parent().attr('path').split('|')[0] +'"]');
        var parent = $(this).parent();
        var ptitle = parent.attr('ptitle');
        var ptitles = ptitle.split('|');
        var path = parent.attr('path');
        var paths = path.split('|');
        var url = '/app/' + parent.attr('path') + '/page.html';
        $('#breadcrumb').html("");
        ptitles.forEach(function (p, i, all) {
            var text = p.split('-'), tag;
            if (p.split('-').length > 1) {
                tag = text[0];
                text.shift();
            }
            var li =  $('<li><a href="/">'+ text +'</a></li>');
            var a = li.find('a');
            if (i < ptitles.length-1) {
                li.append('<i class="fa fa-circle"></i>');
                a.attr('opennavbar', paths.slice(0, i+1).join('/'));
                a.attr('href', 'javascript:;');
                a.on('click', function(){
                    var open = $(this).attr('opennavbar').replace('/', '|');
                    var opens = open.split('|');
                    var li = navbar.find('li[path="'+ open +'"]');
                    if (opens.length > 1) {
                        opens.forEach(function(o,i){
                            li = navbar.find('li[path="'+ opens.slice(0, i+1).join('|') +'"]');
                            if (!li.hasClass('open')) li.children('a').click();
                        })
                    } else {
                        if (!li.hasClass('open')) li.children('a').click();
                    }
                });
            } else {
                a.attr('href', '#' + paths.join('/'));
            }
            $('#breadcrumb').append(li)
        });
        navbar.find('li').removeClass('active');
        navbar.find('li span.selected').remove();
        superParent.addClass('active');
        superParent.children('a').append('<span class="selected"></span>');
        parent.addClass('active');
        if (container.attr('page') !== url) {
            container.attr('page', url);
            container.load(url);
        }
    });
    if (window.location.hash.substr(1)) {
        var hash = window.location.hash.substr(1);
        states = hash.replace(/\//g, '|').split('|');
        page = states.slice(-1)[0];
    } else {
        states = App.navbar.slice(0).sort(function(a, b){
            return b.index - a.index
        })[0].path.split('|');
    }
    states = states.slice(0, -1);
    states.forEach(function(state, i){
        navbar.find('li[path="'+ states.slice(0, i+1).join('|') +'"]>a').click();
    });
    if (page) navbar.find('li[path="' + states.concat(page).join('|') + '"]>a').click();
    //
    window.navbar = undefined;
});