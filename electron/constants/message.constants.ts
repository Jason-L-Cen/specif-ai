export const APP_MESSAGES = {
  BLOCKED_REASON:
    "提示词包含违反安全策略的恶意内容。",
  RESPONSE_NOT_PROCESSES:
    "处理响应时出错，请重试。如果问题持续存在，请联系支持人员。",

  QUIT_DIALOG: {
    TITLE: (processCount: number, _isPlural: boolean) =>
      `${processCount} 个任务正在运行`,
    MESSAGE: (_isPlural: boolean) =>
      "当前仍有尚未完成的任务。",
    DETAIL: (processListText: string) =>
      `正在运行的任务：\n${processListText}\n\n现在退出可能会停止这些任务，并丢失尚未保存的进度。`,
    BUTTONS: {
      CANCEL: "取消",
      QUIT_ANYWAY: "仍然退出",
    },
  },
};
import type { ZodErrorMap } from 'zod';

export const ZH_ERROR_MAP: ZodErrorMap = (issue) => {
  const types: Record<string, string> = { string: '文本', number: '数字', boolean: '布尔值', date: '日期', array: '列表', object: '对象', null: '空值', undefined: '未填写' };
  let message = '输入无效，请检查填写内容';
  switch (issue.code) {
    case 'invalid_type':
      message = issue.received === 'undefined' ? '此项不能为空' : `数据类型不正确，应为${types[issue.expected] || issue.expected}`;
      break;
    case 'invalid_literal': message = `值必须为 ${String(issue.expected)}`; break;
    case 'unrecognized_keys': message = `存在不支持的字段：${issue.keys.join('、')}`; break;
    case 'invalid_union': message = '输入不符合任何允许的格式'; break;
    case 'invalid_union_discriminator': message = '请选择有效的类型'; break;
    case 'invalid_enum_value': message = '请从允许的选项中选择有效值'; break;
    case 'invalid_arguments': message = '函数参数无效'; break;
    case 'invalid_return_type': message = '函数返回值类型无效'; break;
    case 'invalid_date': message = '日期无效'; break;
    case 'invalid_string':
      message = issue.validation === 'email' ? '请输入有效的电子邮箱地址'
        : issue.validation === 'url' ? '请输入有效的 URL'
        : issue.validation === 'uuid' ? '请输入有效的 UUID'
        : issue.validation === 'datetime' ? '请输入有效的日期时间'
        : issue.validation === 'ip' ? '请输入有效的 IP 地址'
        : '文本格式无效';
      break;
    case 'too_small':
    case 'too_big': {
      const small = issue.code === 'too_small';
      const limit = small ? issue.minimum : issue.maximum;
      const subject = issue.type === 'string' ? '文本长度' : issue.type === 'array' ? '列表项数' : issue.type === 'set' ? '集合项数' : issue.type === 'date' ? '日期时间戳' : '数值';
      const relation = issue.exact ? '必须为' : small ? (issue.inclusive ? '不能小于' : '必须大于') : (issue.inclusive ? '不能大于' : '必须小于');
      message = `${subject}${relation} ${String(limit)}`;
      break;
    }
    case 'invalid_intersection_types': message = '组合字段的校验结果不一致'; break;
    case 'not_multiple_of': message = `数值必须是 ${issue.multipleOf} 的整数倍`; break;
    case 'not_finite': message = '请输入有限数字'; break;
  }
  return { message };
};
