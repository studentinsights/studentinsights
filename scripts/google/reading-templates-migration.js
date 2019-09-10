/* --- TARGET PATHS ------------------------------------------------------------------------ */
var PATHS = {}; 

/* --- DEFINITIONS --------------------------------------------------------------- */
// see scripts/google/conditionalFormatting.js
var thresholdDefs = [{"columnKey":"K / FALL / F&P Level English","thresholds":{"benchmark":"A"},"insightsAssessmentKey":"f_and_p_english","grade":"KF","period":"FALL"},{"columnKey":"K / WINTER / F&P Level English","thresholds":{"benchmark":"C","risk":"A"},"insightsAssessmentKey":"f_and_p_english","grade":"KF","period":"WINTER"},{"columnKey":"1 / WINTER / F&P Level English","thresholds":{"benchmark":"G","risk":"D"},"insightsAssessmentKey":"f_and_p_english","grade":"1","period":"WINTER"},{"columnKey":"2 / SPRING / F&P Level English","thresholds":{"benchmark":"J"},"insightsAssessmentKey":"f_and_p_english","grade":"2","period":"SPRING"},{"columnKey":"3 / WINTER / F&P Level English","thresholds":{"benchmark":"O","risk":"M"},"insightsAssessmentKey":"f_and_p_english","grade":"3","period":"WINTER"},{"columnKey":"3 / SPRING / F&P Level English","thresholds":{"benchmark":"P"},"insightsAssessmentKey":"f_and_p_english","grade":"3","period":"SPRING"},{"columnKey":"K / FALL / F&P Level Spanish","thresholds":{"benchmark":"A"},"insightsAssessmentKey":"f_and_p_spanish","grade":"KF","period":"FALL"},{"columnKey":"K / WINTER / F&P Level Spanish","thresholds":{"benchmark":"C","risk":"A"},"insightsAssessmentKey":"f_and_p_spanish","grade":"KF","period":"WINTER"},{"columnKey":"1 / WINTER / F&P Level Spanish","thresholds":{"benchmark":"G","risk":"D"},"insightsAssessmentKey":"f_and_p_spanish","grade":"1","period":"WINTER"},{"columnKey":"2 / SPRING / F&P Level Spanish","thresholds":{"benchmark":"J"},"insightsAssessmentKey":"f_and_p_spanish","grade":"2","period":"SPRING"},{"columnKey":"3 / WINTER / F&P Level Spanish","thresholds":{"benchmark":"O","risk":"M"},"insightsAssessmentKey":"f_and_p_spanish","grade":"3","period":"WINTER"},{"columnKey":"3 / SPRING / F&P Level Spanish","thresholds":{"benchmark":"P"},"insightsAssessmentKey":"f_and_p_spanish","grade":"3","period":"SPRING"},{"columnKey":"K / FALL / FSF","thresholds":{"benchmark":18,"risk":7},"insightsAssessmentKey":"dibels_fsf","grade":"KF","period":"FALL"},{"columnKey":"K / WINTER / FSF","thresholds":{"benchmark":44,"risk":31},"insightsAssessmentKey":"dibels_fsf","grade":"KF","period":"WINTER"},{"columnKey":"K / FALL / LNF","thresholds":{"benchmark":22,"risk":10},"insightsAssessmentKey":"dibels_lnf","grade":"KF","period":"FALL"},{"columnKey":"K / WINTER / LNF","thresholds":{"benchmark":42,"risk":19},"insightsAssessmentKey":"dibels_lnf","grade":"KF","period":"WINTER"},{"columnKey":"K / SPRING / LNF","thresholds":{"benchmark":52,"risk":38},"insightsAssessmentKey":"dibels_lnf","grade":"KF","period":"SPRING"},{"columnKey":"1 / FALL / LNF","thresholds":{"benchmark":50,"risk":36},"insightsAssessmentKey":"dibels_lnf","grade":"1","period":"FALL"},{"columnKey":"K / WINTER / PSF","thresholds":{"benchmark":27,"risk":11},"insightsAssessmentKey":"dibels_psf","grade":"KF","period":"WINTER"},{"columnKey":"K / SPRING / PSF","thresholds":{"benchmark":45,"risk":30},"insightsAssessmentKey":"dibels_psf","grade":"KF","period":"SPRING"},{"columnKey":"1 / FALL / PSF","thresholds":{"benchmark":45,"risk":30},"insightsAssessmentKey":"dibels_psf","grade":"1","period":"FALL"},{"columnKey":"K / WINTER / NWF CLS","thresholds":{"benchmark":27,"risk":12},"insightsAssessmentKey":"dibels_nwf_cls","grade":"KF","period":"WINTER"},{"columnKey":"K / SPRING / NWF CLS","thresholds":{"benchmark":37,"risk":27},"insightsAssessmentKey":"dibels_nwf_cls","grade":"KF","period":"SPRING"},{"columnKey":"1 / FALL / NWF CLS","thresholds":{"benchmark":33,"risk":19},"insightsAssessmentKey":"dibels_nwf_cls","grade":"1","period":"FALL"},{"columnKey":"1 / WINTER / NWF CLS","thresholds":{"benchmark":50,"risk":30},"insightsAssessmentKey":"dibels_nwf_cls","grade":"1","period":"WINTER"},{"columnKey":"2 / FALL / NWF CLS","thresholds":{"benchmark":62,"risk":45},"insightsAssessmentKey":"dibels_nwf_cls","grade":"2","period":"FALL"},{"columnKey":"1 / SPRING / NWF CLS","thresholds":{"benchmark":78,"risk":42},"insightsAssessmentKey":"dibels_nwf_cls","grade":"1","period":"SPRING"},{"columnKey":"K / SPRING / NWF WWR","thresholds":{"benchmark":4,"risk":0},"insightsAssessmentKey":"dibels_nwf_wwr","grade":"K","period":"SPRING"},{"columnKey":"1 / FALL / NWF WWR","thresholds":{"benchmark":4,"risk":1},"insightsAssessmentKey":"dibels_nwf_wwr","grade":"1","period":"FALL"},{"columnKey":"1 / WINTER / NWF WWR","thresholds":{"benchmark":12,"risk":5},"insightsAssessmentKey":"dibels_nwf_wwr","grade":"1","period":"WINTER"},{"columnKey":"1 / SPRING / NWF WWR","thresholds":{"benchmark":18,"risk":9},"insightsAssessmentKey":"dibels_nwf_wwr","grade":"1","period":"SPRING"},{"columnKey":"2 / FALL / NWF WWR","thresholds":{"benchmark":18,"risk":9},"insightsAssessmentKey":"dibels_nwf_wwr","grade":"2","period":"FALL"},{"columnKey":"1 / WINTER / DORF WPM","thresholds":{"benchmark":30,"risk":18},"insightsAssessmentKey":"dibels_dorf_wpm","grade":"1","period":"WINTER"},{"columnKey":"1 / SPRING / DORF WPM","thresholds":{"benchmark":63,"risk":36},"insightsAssessmentKey":"dibels_dorf_wpm","grade":"1","period":"SPRING"},{"columnKey":"2 / FALL / DORF WPM","thresholds":{"benchmark":68,"risk":46},"insightsAssessmentKey":"dibels_dorf_wpm","grade":"2","period":"FALL"},{"columnKey":"2 / WINTER / DORF WPM","thresholds":{"benchmark":84,"risk":67},"insightsAssessmentKey":"dibels_dorf_wpm","grade":"2","period":"WINTER"},{"columnKey":"2 / SPRING / DORF WPM","thresholds":{"benchmark":100,"risk":82},"insightsAssessmentKey":"dibels_dorf_wpm","grade":"2","period":"SPRING"},{"columnKey":"3 / FALL / DORF WPM","thresholds":{"benchmark":93,"risk":72},"insightsAssessmentKey":"dibels_dorf_wpm","grade":"3","period":"FALL"},{"columnKey":"3 / WINTER / DORF WPM","thresholds":{"benchmark":108,"risk":88},"insightsAssessmentKey":"dibels_dorf_wpm","grade":"3","period":"WINTER"},{"columnKey":"3 / SPRING / DORF WPM","thresholds":{"benchmark":123,"risk":100},"insightsAssessmentKey":"dibels_dorf_wpm","grade":"3","period":"SPRING"},{"columnKey":"1 / WINTER / DORF ACC","thresholds":{"benchmark":85,"risk":73},"insightsAssessmentKey":"dibels_dorf_acc","grade":"1","period":"WINTER"},{"columnKey":"1 / SPRING / DORF ACC","thresholds":{"benchmark":92,"risk":84},"insightsAssessmentKey":"dibels_dorf_acc","grade":"1","period":"SPRING"},{"columnKey":"2 / FALL / DORF ACC","thresholds":{"benchmark":93,"risk":84},"insightsAssessmentKey":"dibels_dorf_acc","grade":"2","period":"FALL"},{"columnKey":"2 / WINTER / DORF ACC","thresholds":{"benchmark":95,"risk":91},"insightsAssessmentKey":"dibels_dorf_acc","grade":"2","period":"WINTER"},{"columnKey":"2 / SPRING / DORF ACC","thresholds":{"benchmark":97,"risk":93},"insightsAssessmentKey":"dibels_dorf_acc","grade":"2","period":"SPRING"},{"columnKey":"3 / FALL / DORF ACC","thresholds":{"benchmark":96,"risk":91},"insightsAssessmentKey":"dibels_dorf_acc","grade":"3","period":"FALL"},{"columnKey":"3 / WINTER / DORF ACC","thresholds":{"benchmark":97,"risk":93},"insightsAssessmentKey":"dibels_dorf_acc","grade":"3","period":"WINTER"},{"columnKey":"3 / SPRING / DORF ACC","thresholds":{"benchmark":98,"risk":95},"insightsAssessmentKey":"dibels_dorf_acc","grade":"3","period":"SPRING"}];

// see readingData.js
var ORDERED_F_AND_P_ENGLISH_LEVELS = {
  'NR': 50,
  'AA': 80,
  'A': 110,
  'B': 120,
  'C': 130,
  'D': 150,
  'E': 160,
  'F': 170,
  'G': 180,
  'H': 190,
  'I': 200,
  'J': 210,
  'K': 220,
  'L': 230,
  'M': 240,
  'N': 250,
  'O': 260,
  'P': 270,
  'Q': 280,
  'R': 290,
  'S': 300,
  'T': 310,
  'U': 320,
  'V': 330,
  'W': 340,
  'X': 350,
  'Y': 360,
  'Z': 370,
  'Z+': 380
};

var GOOGLE_SHEETS_COLORS = {
  LOW: '#F4C7C3',
  MID: '#FCE8B2',
  HIGH: '#B7E1CD'
};


/* --- SCOPING -------------------------------------------------------------------------- */
function scope() {
  // var files = getFilesInAllFolders(PATHS.READING_FOLDER_2018_2019);
  
  Logger.log(JSON.stringify(files.map(function(file) {
    var spreadsheet = SpreadsheetApp.openById(file.getId());
    var sheets = spreadsheet.getSheets();

    return [
      file.getName(),
      sheets.map(function(sheet) { return sheet.getName(); }).sort(),
      file.getUrl()
     ];
  }), null, 2));
}
 
/* --- MIGRATIONS, active --------------------------------------------------------------- */
function applyConditionalFormattingToAll() {
  throw new Error('careful! review the code first in case things have changed');
  var files = getFilesInAllFolders(PATHS.PRODUCTION_READING_FOLDER_2018_2019);
  Logger.log('  files.length=' + files.length);
  forEachSheet(files, function(sheet) {
    Logger.log("\n\n\n----------------------------");
    applyNumberFormattingToSheet(sheet);
    applyConditionalFormattingToSheet(sheet);
  });
  Logger.log('ALL Done.');
}

function applyNumberFormattingToSheet(sheet) {
  Logger.log('applyNumberFormatting, sheet.getName=' + sheet.getName());
  var columnKeys = thresholdDefs
    .map(function(thresholdDef) { return thresholdDef.columnKey; })
    .filter(function(columnKey) { return (columnKey.indexOf(' ACC') !== -1); });
  Logger.log('  columnKeys.length=' + columnKeys.length);
  
  var columnIndexes = getColumnIndexesFor(sheet, columnKeys);
  Logger.log('  columnIndexes.length=' + columnIndexes.length);
  
  columnIndexes.forEach(function(columnIndex) {
    var range = sheet.getRange(3, 1+columnIndex, 1000);
    range.setNumberFormat('0%');
    Logger.log('  setNumberFormat for range=' + range.getA1Notation());
  });
}

function applyConditionalFormattingToSheet(sheet, options) {
  Logger.log('applyConditionalFormattingToSheet, sheet.getName=' + sheet.getName());
  
  var newRules = [];
  var sortedThresholdDefs = thresholdDefs.sort(function(a, b) { return a.columnKey.localeCompare(b.columnKey); });
  Logger.log('  processsing ' + sortedThresholdDefs.length + ' threshold defs...');
  sortedThresholdDefs.forEach(function(thresholdDef) {
    var rules = rulesFromThresholdDef(sheet, thresholdDef);
    newRules = newRules.concat(rules);
  });

  if (options && options.debug) {
    Logger.log('  translated to ' + newRules.length + ' rules');
  
    Logger.log("\n\n\n\n");
    Logger.log('new:');
    Logger.log(JSON.stringify(newRules.map(ruleJson)));
  
    var oldRules = sheet.getConditionalFormatRules();
    Logger.log("\n\n\\n\n");
    Logger.log('old:');
    Logger.log(JSON.stringify(oldRules.map(ruleJson)));
  }

  Logger.log('applying ' + newRules.length + 'rules...');
  sheet.setConditionalFormatRules(newRules);
  Logger.log('applied.');
}

function rulesFromThresholdDef(sheet, thresholdDef) {
  Logger.log('Starting for ' + thresholdDef.columnKey + '...');

  // find column, create range describing it
  var columnIndex = getColumnIndexesFor(sheet, [thresholdDef.columnKey])[0];
  if (!columnIndex) {
    // Logger.log('  skipping, no columnIndex...');
    return [];
  }
  var range = sheet.getRange(3, 1+columnIndex, 1000);
  Logger.log('  range=' + range.getA1Notation());
  
  var rules = [];
  
  // ORF accuracy: map percentages from [0-100] in insights to [0-1.0] in sheets
  // F&P, these are letters so need to do something a bit different
  if (thresholdDef.insightsAssessmentKey === 'dibels_dorf_acc') {
    rules = createRulesForNumericThresholds(range, {
      risk: thresholdDef.thresholds.risk && (thresholdDef.thresholds.risk / 100),
      benchmark: thresholdDef.thresholds.benchmark && (thresholdDef.thresholds.benchmark / 100)
     });
  } else if (['f_and_p_english', 'f_and_p_spanish'].indexOf(thresholdDef.insightsAssessmentKey) !== -1) {
    rules = createRulesForFandP(range, thresholdDef.thresholds);
  } else {
    rules = createRulesForNumericThresholds(range, thresholdDef.thresholds);
  }
  
  Logger.log('  set ' + rules.length + ' rules');
  return rules;
}


function createRulesForFandP(range, thresholds) {
  var rules = [];

  // eval order matters
  // can't just do same as UI because of type constraints, so this manually expands
  if (thresholds.risk !== undefined) {
    rules = rules.concat(expandRulesFor(range, GOOGLE_SHEETS_COLORS.LOW, 'NR', thresholds.risk));
  }
  
  if (thresholds.benchmark !== undefined) {
    rules = rules.concat(expandRulesFor(range, GOOGLE_SHEETS_COLORS.HIGH, thresholds.benchmark, 'Z+'));
  }

  if (thresholds.risk !== undefined&& thresholds.benchmark !== undefined) {
    rules = rules.concat(expandRulesFor(range, GOOGLE_SHEETS_COLORS.MID, thresholds.risk, thresholds.benchmark, {exclusive: true}));
  }
  
  return rules;
}

function expandRulesFor(range, color, start, end, options) {
  var keys = Object.keys(ORDERED_F_AND_P_ENGLISH_LEVELS).filter(function(key) {
    return (options && options.exclusive)
      ? ORDERED_F_AND_P_ENGLISH_LEVELS[key] > ORDERED_F_AND_P_ENGLISH_LEVELS[start] && ORDERED_F_AND_P_ENGLISH_LEVELS[key] < ORDERED_F_AND_P_ENGLISH_LEVELS[end]
      : ORDERED_F_AND_P_ENGLISH_LEVELS[key] >= ORDERED_F_AND_P_ENGLISH_LEVELS[start] && ORDERED_F_AND_P_ENGLISH_LEVELS[key] <= ORDERED_F_AND_P_ENGLISH_LEVELS[end];
  });
  return keys.map(function(key) {
    return SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(key)
      .setBackground(color)
      .setRanges([range])
      .build();
  });
}
   

function createRulesForNumericThresholds(range, thresholds) {
  var rules = [];
  
  // eval order matters
  if (thresholds.risk !== undefined) {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
                 .whenNumberLessThanOrEqualTo(thresholds.risk)
                 .setBackground(GOOGLE_SHEETS_COLORS.LOW)
                 .setRanges([range])
                 .build());
  }
  if (thresholds.benchmark !== undefined) {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
                 .whenNumberGreaterThanOrEqualTo(thresholds.benchmark)
                 .setBackground(GOOGLE_SHEETS_COLORS.HIGH)
                 .setRanges([range])
                 .build());
  }
  if (thresholds.risk !== undefined && thresholds.benchmark !== undefined) {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
                 .whenNumberBetween(thresholds.risk, thresholds.benchmark)
                 .setBackground(GOOGLE_SHEETS_COLORS.MID)
                 .setRanges([range])
               .build());
  } 
  return rules;
}


/* --- HELPERS --------------------------------------------------------------- */
function getColumnIndexesFor(sheet, columnKeys) {
  var headerKeys = sheet.getRange('1:1').getValues()[0];
  var targetHeaderKeys = headerKeys.filter(function(key) {
    return columnKeys.indexOf(key) !== -1;
  });
  var columnIndexes = targetHeaderKeys.map(function(key) {
    return headerKeys.indexOf(key);
  });
  return columnIndexes;
}
 
function getFilesInAllFolders(folderId) {
  Logger.log('getFilesInAllFolders(' + folderId + ')');
  var files = [];
  var folder = DriveApp.getFolderById(folderId);
  
  // files in folder
  var filesI = folder.getFiles();
  while(filesI.hasNext()) {
    files.push(filesI.next());
  }

  // sub folders
  var foldersI = folder.getFolders();
  while(foldersI.hasNext()) {
    var nextFolderId = foldersI.next().getId();
    files = files.concat(getFilesInAllFolders(nextFolderId));
  }

  return files;
}

function ruleJson(rule) {
  var ranges = rule.getRanges().map(function(range) { return range.getA1Notation() });
  
  var booleanCondition = rule.getBooleanCondition();
  if (booleanCondition !== null) {
    return {
      type: 'boolean',
      ranges: ranges,
      getBackground: booleanCondition.getBackground(),
      getBold: booleanCondition.getBold(),
      getCriteriaType: booleanCondition.getCriteriaType(),
      getCriteriaValues: booleanCondition.getCriteriaValues(),
      getFontColor: booleanCondition.getFontColor(),
      getItalic: booleanCondition.getItalic(),
      getStrikethrough: booleanCondition.getStrikethrough(),
      getUnderline: booleanCondition.getUnderline()
    };
  }
  
  var gradientCondition = rule.getGradientCondition();
  if (gradientCondition !== null) {
    return {
      type: 'gradient',
      ranges: ranges,
      getMaxColor: gradientCondition.getMaxColor(),
      getMaxType: gradientCondition.getMaxType(),
      getMaxValue: gradientCondition.getMaxValue(),
      getMidColor: gradientCondition.getMidColor(),
      getMidType: gradientCondition.getMidType(),
      getMidValue: gradientCondition.getMidValue(),
      getMinColor: gradientCondition.getMinColor(),
      getMinType: gradientCondition.getMinType(),
      getMinValue: gradientCondition.getMinValue()
    };
  }
  
  return {
    type: 'unknown',
    ranges: ranges
  };
 }

function forEachSheet(files, fn) {
  files.forEach(function(file) {
    var spreadsheet = SpreadsheetApp.openById(file.getId());
    var sheets = spreadsheet.getSheets();
    sheets.forEach(function(sheet) {
      fn(sheet, {file: file, spreadsheet: spreadsheet});
    });
  });
}


/* --- MIGRATIONS, deprecated or no longer needed ------------------------------------------------------------ */
function DEPRECATED_patchFSF() {
  throw new Error('deprecated, careful!');
  Logger.log('Starting patchFSF...');
  var files = getFilesInAllFolders(PATHS.PRODUCTION_READING_FOLDER_2018_2019);
  Logger.log('  files.length=' + files.length);
  forEachSheet(files, function(sheet) {
    function read(notation) {
      return sheet.getRange(notation).getValue();
    }

    if (read('A2') !== 'Kindergarten students') return;
    if (read('D3') !== 'FSF') return;
    if (read('E3') !== 'LNF') return;
    if (read('E1') !== 'K / FALL / LNF') return;
    if (read('D1') !== '') return;
    
    sheet.getRange('D1').setValue('K / FALL / FSF');
    Logger.log('  patched ' + sheet.getName());
  });
  Logger.log('Done.');
}

function DANGEROUS_clearConditionalFormatting() {
  throw new Error('deprecated, careful!');
  var sheetId = '...';
  var spreadsheet = SpreadsheetApp.openById(sheetId);
  var sheets = spreadsheet.getSheets();
  sheets.forEach(function(sheet) {
    sheet.clearConditionalFormatRules();
  });
}
