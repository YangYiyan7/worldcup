import { Rule, RuleType } from '@midwayjs/validate';

export class CreateUserDTO {
  @Rule(RuleType.string().min(1).max(100).required())
  name: string;

  @Rule(RuleType.string().email().required())
  email: string;
}

export class UpdateUserDTO {
  @Rule(RuleType.string().min(1).max(100).optional())
  name?: string;

  @Rule(RuleType.string().email().optional())
  email?: string;
}
