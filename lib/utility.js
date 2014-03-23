var clean = function(string) {
  string = string.replace(/^[^0-9A-Za-z]+/g, '');
  string = string.replace(/[^0-9A-Za-z]+$/g, '');
  return string;
};

var addWordToEndOfOffsetList = function(wordsWithOffsets, word) {
  var lastWord = wordsWithOffsets.pop();
  lastWord['word'] += word;
  wordsWithOffsets.push(lastWord);
  return wordsWithOffsets;
};

var explodeHtml = function(html) {
  var words = html.split(/( |&nbsp;|<|>|\t|\n|\r|;|\.)/i);
  var offset = 0;
  var wordsWithOffsets = [];
  var index = 0;
  for(var i=0 ; i<words.length ; i++) {
    var word = words[i];
    if(word === '') continue;
    if(word === '<') {
      wordsWithOffsets[index] = { word: word, offset: offset };
    } else if(word === '>' || word === '.' || word === ';' || /^\s+$/.test(word)) {
      wordsWithOffsets = addWordToEndOfOffsetList(wordsWithOffsets, word);
    } else {
      if(wordsWithOffsets[index] === undefined) {
        wordsWithOffsets[index] = { word: word, offset: offset };
      } else {
        wordsWithOffsets = addWordToEndOfOffsetList(wordsWithOffsets, word);
      }
      index += 1;
    }
    offset += word.length;
  }
  return wordsWithOffsets;
};

var isStopTag = function(tag) {
  tag = tag.toLowerCase();
  if(tag[0] === '/') tag = tag.substring(1);
  if(tag === 'p' || tag == 'td' || tag == 'tr' || tag == 'table' ||
     tag == 'hr' || tag == 'ul' || tag == 'li') {
    return true;
  }
  return false;
}

var removeTagsFromElements = function(wordsWithOffsets) {
  var withinTag = false;
  var finalWords = [];
  var match = null;
  for(var i=0 ; i<wordsWithOffsets.length ; i++) {
    var word = wordsWithOffsets[i]['word'].trim();

    if(withinTag) {
      // ...tag>
      if(match = word.match(/^(.*)>$/im)) {
        withinTag = false;
      }
      continue;
    }

    // <tag>
    if(match = word.match(/^<(\/?.*[a-z0-9-]\/?)>$/im)) {
      word = match[1];
      if(isStopTag(word)) finalWords.push(null);
      continue;
    }

    // <tag...
    if(match = word.match(/^<([a-z0-9!].*)$/im)) {
      word = match[1];
      if(isStopTag(word)) finalWords.push(null);
      withinTag = true;
      continue;
    }

    finalWords.push(wordsWithOffsets[i]);
  }
  finalWords.push(null);
  return finalWords;
};

module.exports = {
  clean: clean,
  addWordToEndOfOffsetList: addWordToEndOfOffsetList,
  explodeHtml: explodeHtml,
  isStopTag: isStopTag,
  removeTagsFromElements: removeTagsFromElements
};