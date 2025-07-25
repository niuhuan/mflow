import { javascriptGenerator, Order } from 'blockly/javascript';

javascriptGenerator.forBlock['start_flow'] = function(block) {
  // This block is just a starting point, it generates no code itself.
  // The engine will automatically continue with the next block.
  return '';
};

javascriptGenerator.forBlock['load_account'] = function(block) {
  var accountName = javascriptGenerator.valueToCode(block, 'ACCOUNT_NAME', Order.ATOMIC) || "''";
  var code = `await window.loadAccount(${accountName});\n`;
  return code;
};

javascriptGenerator.forBlock['save_account'] = function(block) {
  var saveName = javascriptGenerator.valueToCode(block, 'SAVE_NAME', Order.ATOMIC) || "''";
  return `await window.saveAccount(${saveName});\n`;
};

javascriptGenerator.forBlock['wait_seconds'] = function(block) {
  var timeValue = block.getFieldValue('TIME_VALUE');
  var timeUnit = block.getFieldValue('TIME_UNIT');
  return `await window.wait(${timeValue}, '${timeUnit}');\n`;
};

javascriptGenerator.forBlock['daily_mission'] = function(block) {
  return 'await window.dailyMission();\n';
};

javascriptGenerator.forBlock['refresh_stamina'] = function(block) {
  return 'await window.refreshStamina();\n';
};

javascriptGenerator.forBlock['simulated_universe'] = function(block) {
  return 'await window.simulatedUniverse();\n';
};

javascriptGenerator.forBlock['farming'] = function(block) {
  return 'await window.farming();\n';
};

javascriptGenerator.forBlock['close_game'] = function(block) {
  return 'await window.closeGame();\n';
};

javascriptGenerator.forBlock['controls_whileUntil'] = function(block) {
  var argument0 = javascriptGenerator.valueToCode(block, 'BOOL', Order.NONE) || 'false';
  var branch = javascriptGenerator.statementToCode(block, 'DO');
  var code = 'while (' + argument0 + ') {\n' + branch + '}\n';
  return code;
};

javascriptGenerator.forBlock['controls_if'] = function(block) {
  var n = 0;
  var code = '', branchCode, conditionCode;
  do {
    conditionCode = javascriptGenerator.valueToCode(block, 'IF' + n, Order.NONE) || 'false';
    branchCode = javascriptGenerator.statementToCode(block, 'DO' + n);
    code += (n == 0 ? 'if (' : 'else if (') + conditionCode + ') {\n' + branchCode + '}\n';
    n++;
  } while (block.getInput('IF' + n));
  return code;
};

javascriptGenerator.forBlock['controls_if_else'] = function(block) {
  var conditionCode = javascriptGenerator.valueToCode(block, 'IF0', Order.NONE) || 'false';
  var thenCode = javascriptGenerator.statementToCode(block, 'DO0');
  var elseCode = javascriptGenerator.statementToCode(block, 'ELSE');
  var code = 'if (' + conditionCode + ') {\n' + thenCode + '} else {\n' + elseCode + '}\n';
  return code;
};

javascriptGenerator.forBlock['logic_boolean'] = function(block) {
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Order.ATOMIC];
};

javascriptGenerator.forBlock['logic_operation'] = function(block) {
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? Order.LOGICAL_AND : Order.LOGICAL_OR;
  var argument0 = javascriptGenerator.valueToCode(block, 'A', order) || 'false';
  var argument1 = javascriptGenerator.valueToCode(block, 'B', order) || 'false';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

javascriptGenerator.forBlock['logic_negate'] = function(block) {
  var argument0 = javascriptGenerator.valueToCode(block, 'BOOL', Order.LOGICAL_NOT) || 'false';
  var code = '!' + argument0;
  return [code, Order.LOGICAL_NOT];
};

javascriptGenerator.forBlock['logic_compare'] = function(block) {
  // : { [key: string]: string }
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')] || '==';
  var order = Order.RELATIONAL;
  var argument0 = javascriptGenerator.valueToCode(block, 'A', order) || '0';
  var argument1 = javascriptGenerator.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

javascriptGenerator.forBlock['custom_function_def'] = function(block) {
  var funcName = block.getFieldValue('FUNC_NAME') || 'myFunc';
  var params = block.getFieldValue('PARAMS') || '';
  var branch = javascriptGenerator.statementToCode(block, 'DO');
  var code = `async function ${funcName}(${params}) {\n${branch}}\n`;
  return code;
};

javascriptGenerator.forBlock['custom_function_call'] = function(block) {
  var funcName = block.getFieldValue('FUNC_NAME') || 'myFunc';
  var args = javascriptGenerator.valueToCode(block, 'ARGS', Order.NONE) || '';
  var code = `await ${funcName}(${args});\n`;
  return code;
};

javascriptGenerator.forBlock['custom_parameter'] = function(block) {
  var paramName = block.getFieldValue('PARAM_NAME') || 'param1';
  return [paramName, Order.ATOMIC];
}; 

javascriptGenerator.forBlock['run_better_gi'] = function(block) {
  return 'await window.runBetterGi();\n';
};

javascriptGenerator.forBlock['run_better_gi_by_config'] = function(block) {
  var configName = javascriptGenerator.valueToCode(block, 'CONFIG_NAME', Order.ATOMIC) || "'配置文件'";
  return `await window.runBetterGiByConfig(${configName});\n`;
};

javascriptGenerator.forBlock['close_gi'] = function(block) {
  return 'await window.closeGi();\n';
};

javascriptGenerator.forBlock['export_gi_account'] = function(block) {
  var accountName = javascriptGenerator.valueToCode(block, 'ACCOUNT_NAME', Order.ATOMIC) || "''";
  return `await window.exportGiAccount(${accountName});\n`;
};

javascriptGenerator.forBlock['import_gi_account'] = function(block) {
  var accountName = javascriptGenerator.valueToCode(block, 'ACCOUNT_NAME', Order.ATOMIC) || "''";
  return `await window.importGiAccount(${accountName});\n`;
};

javascriptGenerator.forBlock['math_number'] = function(block) {
  var code = String(block.getFieldValue('NUM'));
  return [code, Order.ATOMIC];
};

javascriptGenerator.forBlock['current_hour_24'] = function(block) {
  var code = 'new Date().getHours()';
  return [code, Order.ATOMIC];
};

javascriptGenerator.forBlock['current_time_minus_4h_day_of_week'] = function(block) {
  var code = '(function() { var date = new Date(); date.setTime(date.getTime() - 4 * 60 * 60 * 1000); return date.getDay(); })()';
  return [code, Order.ATOMIC];
};

javascriptGenerator.forBlock['wait_until_time'] = function(block) {
  var hour = block.getFieldValue('HOUR');
  var minute = block.getFieldValue('MINUTE');
  return `await window.waitUntilTime(${hour}, ${minute});\n`;
};

javascriptGenerator.forBlock['print_variable'] = function(block) {
  var value = javascriptGenerator.valueToCode(block, 'VALUE', Order.NONE) || "''";
  return `window.log('打印变量: ' + ${value});\n`;
};

javascriptGenerator.forBlock['run_zzzod'] = function(block) {
  return 'await window.runZzzod();\n';
};

javascriptGenerator.forBlock['run_better_gi_scheduler'] = function(block) {
  var groups = javascriptGenerator.valueToCode(block, 'GROUPS', Order.ATOMIC) || "''";
  return `await window.runBetterGiScheduler(${groups});\n`;
};
