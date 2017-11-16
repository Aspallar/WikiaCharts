function wikiParse(contents) {
    'use strict';

    function replaceClearTemplates(contents) {
        return contents.replace(/{{Clear}}/g, '<div style="clear:both;"></div>');
    }

    function resolveLinks(contents) {
        return contents.replace(/\[\[(.*)\|(.*)\]\]/g, function (match, url, text) {
            return '<a href="http://magicduels.wikia.com/wiki/' + url + '">' + text + "</a>";
        });
    }

    function removeNoInclude(contents) {
        return contents.replace(/<noinclude>.*<\/noinclude>/, '');
    }

    contents = replaceClearTemplates(contents);
    contents = resolveLinks(contents);
    contents = removeNoInclude(contents);

    return contents;
}