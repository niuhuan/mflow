import * as Blockly from 'blockly/core';

Blockly.defineBlocksWithJsonArray([
  {
    "type": "start_flow",
    "message0": "开始",
    "nextStatement": null,
    "colour": 430,
    "tooltip": "流程的开始节点",
    "helpUrl": ""
  },
  {
    "type": "load_account",
    "message0": "载入星铁账号和配置 %1",
    "args0": [
      {
        "type": "input_value",
        "name": "ACCOUNT_NAME",
        "check": "String"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 250,
    "tooltip": "根据账号名称加载一个账号",
    "helpUrl": ""
  },
  {
    "type": "save_account",
    "message0": "保存星铁账号和配置 %1",
    "args0": [
      {
        "type": "input_value",
        "name": "SAVE_NAME",
        "check": "String"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 250,
    "tooltip": "将当前状态保存为指定名称的存档",
    "helpUrl": ""
  },
  {
    "type": "wait_seconds",
    "message0": "等待 %1 %2",
    "args0": [
      {
        "type": "field_number",
        "name": "TIME_VALUE",
        "value": 1,
        "min": 0
      },
      {
        "type": "field_dropdown",
        "name": "TIME_UNIT",
        "options": [
          ["小时", "HOURS"],
          ["分钟", "MINUTES"],
          ["秒", "SECONDS"]
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 80,
    "tooltip": "暂停流程指定的时间",
    "helpUrl": ""
  },
  {
    "type": "daily_mission",
    "message0": "星铁每日任务",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "执行每日任务流程",
    "helpUrl": ""
  },
  {
    "type": "refresh_stamina",
    "message0": "星铁刷体力",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "执行刷体力流程",
    "helpUrl": ""
  },
  {
    "type": "simulated_universe",
    "message0": "星铁模拟宇宙",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "执行模拟宇宙流程",
    "helpUrl": ""
  },
  {
    "type": "farming",
    "message0": "星铁锄大地",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "执行锄大地流程",
    "helpUrl": ""
  },
  {
    "type": "close_game",
    "message0": "关闭星铁",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 250,
    "tooltip": "结束流程",
    "helpUrl": ""
  },
  {
    "type": "controls_whileUntil",
    "message0": "当 %1 时重复执行 %2",
    "args0": [
      {
        "type": "input_value",
        "name": "BOOL",
        "check": "Boolean"
      },
      {
        "type": "input_statement",
        "name": "DO"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "当条件为真时重复执行",
    "helpUrl": ""
  },
  {
    "type": "logic_boolean",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "BOOL",
        "options": [
          ["真", "TRUE"],
          ["假", "FALSE"]
        ]
      }
    ],
    "output": "Boolean",
    "colour": 150,
    "tooltip": "布尔值：真或假",
    "helpUrl": ""
  },
  {
    "type": "logic_operation",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "input_value",
        "name": "A",
        "check": "Boolean"
      },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["且", "AND"],
          ["或", "OR"]
        ]
      },
      {
        "type": "input_value",
        "name": "B",
        "check": "Boolean"
      }
    ],
    "output": "Boolean",
    "colour": 150,
    "tooltip": "逻辑运算：且、或",
    "helpUrl": ""
  },
  {
    "type": "logic_negate",
    "message0": "非 %1",
    "args0": [
      {
        "type": "input_value",
        "name": "BOOL",
        "check": "Boolean"
      }
    ],
    "output": "Boolean",
    "colour": 150,
    "tooltip": "逻辑非运算",
    "helpUrl": ""
  },
  {
    "type": "logic_compare",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "input_value",
        "name": "A",
        "check": null
      },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["=", "EQ"],
          ["≠", "NEQ"],
          ["<", "LT"],
          ["≤", "LTE"],
          [">", "GT"],
          ["≥", "GTE"]
        ]
      },
      {
        "type": "input_value",
        "name": "B",
        "check": null
      }
    ],
    "output": "Boolean",
    "colour": 150,
    "tooltip": "比较两个值",
    "helpUrl": ""
  },
  {
    "type": "custom_function_def",
    "message0": "定义函数 %1 参数 %2 %3",
    "args0": [
      {
        "type": "field_input",
        "name": "FUNC_NAME",
        "text": "myFunc"
      },
      {
        "type": "field_input",
        "name": "PARAMS",
        "text": ""
      },
      {
        "type": "input_statement",
        "name": "DO"
      }
    ],
    "colour": 330,
    "tooltip": "自定义函数定义，可填写参数名，用逗号分隔。",
    "helpUrl": "",
    "nextStatement": null,
    "previousStatement": null
  },
  {
    "type": "custom_function_call",
    "message0": "调用函数 %1 参数 %2",
    "args0": [
      {
        "type": "field_input",
        "name": "FUNC_NAME",
        "text": "myFunc"
      },
      {
        "type": "input_value",
        "name": "ARGS"
      }
    ],
    "colour": 330,
    "tooltip": "调用自定义函数，参数用逗号分隔。",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "custom_parameter",
    "message0": "参数 %1",
    "args0": [
      {
        "type": "field_input",
        "name": "PARAM_NAME",
        "text": "param1"
      }
    ],
    "output": null,
    "colour": 330,
    "tooltip": "引用函数参数",
    "helpUrl": ""
  },
  {
    "type": "math_number",
    "message0": "%1",
    "args0": [
      {
        "type": "field_number",
        "name": "NUM",
        "value": 0
      }
    ],
    "output": "Number",
    "colour": 160,
    "tooltip": "整数数值",
    "helpUrl": ""
  },
  {
    "type": "current_hour_24",
    "message0": "当前时间取小时(24H)",
    "output": "Number",
    "colour": 160,
    "tooltip": "获取当前时间的小时数（24小时制）",
    "helpUrl": ""
  },
  {
    "type": "run_better_gi",
    "message0": "运行BetterGI一条龙",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 30,
    "tooltip": "运行BetterGI一条龙",
    "helpUrl": ""
  },
  {
    "type": "export_gi_account",
    "message0": "导出原神账号 %1",
    "args0": [
      {
        "type": "input_value",
        "name": "ACCOUNT_NAME",
        "check": "String"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 50,
    "tooltip": "导出原神账号",
    "helpUrl": ""
  },
  {
    "type": "import_gi_account",
    "message0": "导入原神账号 %1",
    "args0": [
      {
        "type": "input_value",
        "name": "ACCOUNT_NAME",
        "check": "String"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 50,
    "tooltip": "导入原神账号",
    "helpUrl": ""
  }
]); 