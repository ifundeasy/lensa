var fs = require('fs');
var request = require('request');
var dataURL = 'https://script.googleusercontent.com/macros/echo?user_content_key=pUrUZC-7FPSK_GrB3pm8Q5mGUIxUuu8Voiq7e7tjlaxFii9dx1VJ5p1GyJ4KZlbwhjblE_5AQQQqwhSmxp0DcdC7lGF53aRKOJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMWojr9NvTBuBLhyHCd5hHa9mbBlKM16YQSi2nkdvtQoAUd5G4PD67aYvbc23iWjCNLP9mGn44pMwqmvv-vTA9K4uYfoTSOHTPdpnpfsBIIiaVeWFKGO_Q-SssEZ7gXQ8TJ7tWNGxbQ8DRdnBXZ2o5D8f1hwdiTD9jumgOT6jbjNjw3QAaSQXHnA&lib=MweG3CZ2nltVEQK0747HTY7X-6jbQP1ys';
module.exports = function (homedir, callback) {
    var data = new Array();
    var generateNavbar = function (menus) {
        var navbar = [];
        var stack = [["about"]];
        var titleCaseMap = function (str) {
            return str.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            })
        };
        var recursive = function (o) {
            o.i = o.i || 0;
            o.prefix = o.prefix || [];
            for (var n in o.object) {
                var ln = Object.keys(o.object[n]).length;
                var prefix1 = o.prefix.concat(n).join('|').toLowerCase().trim().replace(/[^a-zA-Z0-9\|\-]/g, "");
                var prefix2 = o.prefix.map(titleCaseMap).concat(n).join('|').trim().replace(/[^a-zA-Z0-9\|\-\s]/g, "");
                var names = n.split('-').map(titleCaseMap);
                var tag = names.length > 1 ? names[0] : "";
                names = (names.length > 1 ? names.slice(1) : names).join(" ");
                o.iterate(o.i, names, tag, prefix1, prefix2, ln ? false : true);
                if (ln) recursive({
                    object : o.object[n],
                    iterate : o.iterate,
                    prefix : o.prefix.concat(n),
                    i : o.i + 1
                });
            }
        };
        menus.forEach(function (el) {
            var scope = 'routes|' + [el.type, el.mode + '-' + el.name.toString()].join('|');
            var base = homedir + 'public/app/' + scope.toLowerCase().trim().replace(/[^a-zA-Z0-9\|\-]/g, "");
            stack.push(scope.split('|'));
            base.split('/').forEach(function (r, i, a) {
                if (r) {
                    var dir = a.slice(0, i + 1).join('/');
                    if (!fs.existsSync(dir))fs.mkdirSync(dir);
                }
            });
            fs.writeFileSync(base + '/data.json', JSON.stringify(el));
            if (!fs.existsSync(base + '/page.html')) fs.writeFileSync(base + '/page.html', "");
            if (!fs.existsSync(base + '/script.js')) fs.writeFileSync(base + '/script.js', "");
        });
        recursive({
            object : (function () {
                var navbarObj = {};
                stack.forEach(function (el) {
                    var current = navbarObj;
                    el.forEach(function (e, i) {
                        current[e] = current[e] || {};
                        current = current[e];
                    });
                });
                return navbarObj;
            })(),
            iterate : function (i, name, tag, prefix, titles, is) {
                navbar.push({
                    index : i,
                    name : name,
                    tag : tag,
                    path : prefix,
                    titles : titles,
                    handler : is
                });
            }
        });
        return navbar;
    };
    console.log('> Getting data from gscript..\n');
    request(dataURL, function (e, res, body) {
        if (!e && res.statusCode == 200) {
            try {
                data = generateNavbar(JSON.parse(res.body).apiv2)
            } catch (e) {
                console.error('ERROR!', e, 'generateNavbar', res.body);
            }
            fs.writeFileSync(homedir + 'config/navbar.json', JSON.stringify(data));
            callback(data)
        }
    });
};