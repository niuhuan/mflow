import { javascriptGenerator, Order } from 'blockly/javascript';

javascriptGenerator.forBlock['start_flow'] = function(block) {
  // This block is just a starting point, it generates no code itself.
  // The engine will automatically continue with the next block.
  return '';
};

javascriptGenerator.forBlock['load_account'] = function(block) {
  var accountName = javascriptGenerator.valueToCode(block, 'ACCOUNT_NAME', Order.ATOMIC) || "''";
  var code = `await loadAccount(${accountName});\n`;
  return code;
};

javascriptGenerator.forBlock['save_account'] = function(block) {
  var saveName = javascriptGenerator.valueToCode(block, 'SAVE_NAME', Order.ATOMIC) || "''";
  return `await saveAccount(${saveName});\n`;
};

javascriptGenerator.forBlock['wait_seconds'] = function(block) {
  var seconds = block.getFieldValue('SECONDS');
  return `await wait(${seconds});\n`;
};

javascriptGenerator.forBlock['daily_mission'] = function(block) {
  return 'await dailyMission();\n';
};

javascriptGenerator.forBlock['refresh_stamina'] = function(block) {
  return 'await refreshStamina();\n';
};

javascriptGenerator.forBlock['simulated_universe'] = function(block) {
  return 'await simulatedUniverse();\n';
};

javascriptGenerator.forBlock['farming'] = function(block) {
  return 'await farming();\n';
};

javascriptGenerator.forBlock['close_game'] = function(block) {
  return 'closeGame();\n';
};

javascriptGenerator.forBlock['controls_whileUntil'] = function(block) {
  var argument0 = javascriptGenerator.valueToCode(block, 'BOOL', Order.NONE) || 'false';
  var branch = javascriptGenerator.statementToCode(block, 'DO');
  var code = 'while (' + argument0 + ') {\n' + branch + '}\n';
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
  var OPERATORS: { [key: string]: string } = {
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