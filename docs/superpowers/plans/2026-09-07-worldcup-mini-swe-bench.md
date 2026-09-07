# worldcup 迷你 SWE-bench（5 bug + jest 打分）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 worldcup 仓库造 5 个"可评测 agent 解决率"的 bug 实例，并交付纯 Node 的 jest 打分脚本与文件布局；最后 push 到用户 GitHub。

**Architecture:** 以 `main`（基线全绿）为"正确态"。每个 bug 建独立分支 `bug/wc-00N` = main + 仅一处注入的缺陷。打分不依赖 Docker：judge 把 `bench/problems/wc-00N/tests/` 的 FAIL_TO_PASS 测试拷进工作树，跑目标 jest，按 FAIL_TO_PASS 与 PASS_TO_PASS 判定 resolved。agent 经 `bench/agent/` 预留钩子接入。

**Tech Stack:** Node 24, jest/ts-jest, next/jest(jsdom), git。后端起于 `backend/`，前端起于 `frontend/`。

## Global Constraints
- 工作目录：`/Users/yangyiyan/worldcup-bench`（worldcup 完整 clone，当前在 main）。
- 基线 main 必须保持全绿：backend `7/7`（`backend/src/service/__tests__/UserService.test.ts`），frontend `4/4`（`frontend/src/components/__tests__/UserList.test.tsx`）。
- 每个 bug 分支只能含一处缺陷；不得改动现有测试文件（现有测试文件作为该 bug 的 PASS_TO_PASS）。
- FAIL_TO_PASS 测试文件放 `bench/problems/wc-00N/tests/`，**不进分支、不提交到 src**，打分时注入。
- 任何改动 agent 可见的仓库内容一律不含参考答案。
- 端到端命令一律在对应 package 目录（`backend/` 或 `frontend/`）内执行 jest。
- 参考修复 `reference.patch` 仅内部红/绿自验用。
- 全部提交到 git；最后按设计推 GitHub（用户已授权直接推）。
- 日期锚点：2026-09-07。

---

### Task 0: 基线修复并提交（已完成，供对照）
已提交 `ee7a04a`。改动：backend 加 `@types/jest`、ts-jest `isolatedModules`；frontend 加 `ts-node`、`jest-environment-jsdom`、修复 `setupFilesAfterEnv` 笔误、`UserList.tsx` 重构为带 loading 的 client 组件。
验证命令：
- `cd backend && npx jest` → 7 passed
- `cd frontend && npx jest` → 4 passed

---

### Task 1: 造 wc-001 —— 后端 update() 邮箱唯一性失效
**Files:**
- 分支：`bug/wc-001`（从 main 创建）
- 改 bug：`backend/src/service/UserService.ts`（remove update() 内 email 唯一性 guard）
- 提测(FAIL_TO_PASS)：`bench/problems/wc-001/tests/UpdateUserEmailUniqueness.test.ts`
- 描述：`bench/problems/wc-001/problem.md`
- 参考：`bench/problems/wc-001/reference.patch`
- 元数据：`bench/problems/wc-001/meta.json`

**Interfaces:**
- Consumes: main 上当前 `update()`（含 email 唯一性 guard 与 'User not found' throw）。
- Produces: 分支 `bug/wc-001`；FAIL_TO_PASS 测试名 `wc-001 update rejects changing email to one used by another user`。

- [ ] **Step 1: 从 main 建 bug 分支并注入 bug**

```bash
cd /Users/yangyiyan/worldcup-bench
git checkout -b bug/wc-001
```
编辑 `backend/src/service/UserService.ts`，把 `update()` 里这段「email 变更时查重」的 guard **删除**：
```ts
    if (updateUserDTO.email && updateUserDTO.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDTO.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }
```
改为直接 `Object.assign(user, updateUserDTO);`（去重被破坏）。

- [ ] **Step 2: 写 FAIL_TO_PASS 测试**
创建 `bench/problems/wc-001/tests/UpdateUserEmailUniqueness.test.ts`：
```ts
import { UserService } from '../../../../../backend/src/service/UserService';

const mockUserModel: any = {
  find: jest.fn(), findOneBy: jest.fn(), create: jest.fn(),
  save: jest.fn(), remove: jest.fn(), count: jest.fn(),
};

describe('wc-001 update email uniqueness', () => {
  let svc: UserService;
  beforeEach(() => {
    jest.clearAllMocks();
    svc = new UserService();
    svc.userModel = mockUserModel;
  });

  it('rejects changing email to one used by another user', async () => {
    mockUserModel.findOneBy
      .mockResolvedValueOnce({ id: 1, name: 'A', email: 'a@x.com' })   // findById(1)
      .mockResolvedValueOnce({ id: 2, name: 'B', email: 'b@x.com' });  // findByEmail(b@x.com)
    await expect(svc.update(1, { email: 'b@x.com' }))
      .rejects.toThrow('User with this email already exists');
    expect(mockUserModel.save).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: 临时把测试放入 backend 并验证红**
```bash
cp bench/problems/wc-001/tests/UpdateUserEmailUniqueness.test.ts backend/src/service/__tests__/
cd backend && npx jest UpdateUserEmailUniqueness 2>&1 | tail -5
```
Expected: FAIL（update 不再抛错，`expect(...).rejects` 收到 undefined）。然后删回该临时文件。

- [ ] **Step 4: 生成并验证 reference.patch 使绿**
记录 `git diff main -- backend/src/service/UserService.ts` 的反向 diff 存为 `bench/problems/wc-001/reference.patch`；apply 后重跑 FAIL_TO_PASS 应 PASS，且 `npx jest src/service/__tests__/UserService.test.ts` 仍 7/7。
恢复 bug 状态：`git checkout .` 后重新 `git diff main` 存在即 bug 状态在分支上。

- [ ] **Step 5: 写 problem.md / meta.json 并提交**

`bench/problems/wc-001/problem.md`：
```markdown
# wc-001: 更新用户时可把邮箱改成已被他人占用

## 现象
用户通过 PUT /api/users/:id 修改资料时，若把 email 改成**另一个用户已占用**的地址，接口不报错、允许保存，导致系统里出现重复邮箱。

## 期望
把 email 改成已被其他用户占用的地址时，应抛出 "User with this email already exists"，拒绝本次修改，且不应发生保存。

## 范围
只涉及后端用户服务里的更新逻辑。
```
`bench/problems/wc-001/meta.json`：
```json
{
  "id": "wc-001",
  "repo": "backend",
  "branch": "bug/wc-001",
  "source_files": ["backend/src/service/UserService.ts"],
  "pass_to_pass": ["backend/src/service/__tests__/UserService.test.ts"],
  "fail_to_pass": ["bench/problems/wc-001/tests/UpdateUserEmailUniqueness.test.ts"]
}
```
```bash
git add bench/problems/wc-001
git commit -m "wc-001: seed backend bug - update() loses email uniqueness guard"
```

---

### Task 2: 造 wc-002 —— 后端 update() 未找到用户不抛错
**Files:** 同上布局，换 wc-002。
- 分支：`bug/wc-002`
- 改 bug：`backend/src/service/UserService.ts` `update()`：把
```ts
    if (!user) {
      throw new Error('User not found');
    }
```
改为静默（删除 throw，`update` 遇到不存在 id 时直接 `return;`）。

**FAIL_TO_PASS** `bench/problems/wc-002/tests/UpdateUserNotFound.test.ts`：
```ts
import { UserService } from '../../../../../backend/src/service/UserService';
const mockUserModel: any = { find: jest.fn(), findOneBy: jest.fn(), create: jest.fn(), save: jest.fn(), remove: jest.fn(), count: jest.fn() };
describe('wc-002 update not found', () => {
  let svc: UserService;
  beforeEach(() => { jest.clearAllMocks(); svc = new UserService(); svc.userModel = mockUserModel; });
  it('throws User not found when id does not exist', async () => {
    mockUserModel.findOneBy.mockResolvedValue(null);
    await expect(svc.update(999, { name: 'x' })).rejects.toThrow('User not found');
  });
});
```
红/绿验证同 Task 1 Step3-4（red on bug，绿 after reference 恢复 throw）。
`problem.md`：更新不存在的用户 id 时接口不报错(静默返回)，期望抛 "User not found"。
`meta.json`：id wc-002，repo backend，branch bug/wc-002，pass=UserService.test.ts，fail=UpdateUserNotFound.test.ts。

```bash
git checkout main && git checkout -b bug/wc-002   # 注入后
git add bench/problems/wc-002
git commit -m "wc-002: seed backend bug - update() silent on missing user"
```

---

### Task 3: 造 wc-003 —— 后端 findAll() 空列表返回 null
**Files:** 布局同前，wc-003。
- 分支：`bug/wc-003`
- 改 bug：`backend/src/service/UserService.ts` `findAll()`：
```ts
  async findAll(): Promise<User[]> {
    return await this.userModel.find();
  }
```
改为（空时返回 null）：
```ts
  async findAll(): Promise<User[]> {
    const users = await this.userModel.find();
    return users.length ? users : (null as unknown as User[]);
  }
```

**FAIL_TO_PASS** `bench/problems/wc-003/tests/FindAllEmpty.test.ts`：
```ts
import { UserService } from '../../../../../backend/src/service/UserService';
const mockUserModel: any = { find: jest.fn(), findOneBy: jest.fn(), create: jest.fn(), save: jest.fn(), remove: jest.fn(), count: jest.fn() };
describe('wc-003 findAll empty', () => {
  let svc: UserService;
  beforeEach(() => { jest.clearAllMocks(); svc = new UserService(); svc.userModel = mockUserModel; });
  it('returns an empty array (not null) when no users', async () => {
    mockUserModel.find.mockResolvedValue([]);
    const result = await svc.findAll();
    expect(result).toEqual([]);
  });
});
```
红/绿验证同前（红：返回 null；reference 恢复后绿）。
`problem.md`：无用户时 GET 用户列表返回 null 而非空数组，期望始终返回空数组 `[]`。
`meta.json`：wc-003 / backend / bug/wc-003 / pass=UserService.test.ts / fail=FindAllEmpty.test.ts。
```bash
git add bench/problems/wc-003 && git commit -m "wc-003: seed backend bug - findAll() returns null when empty"
```

---

### Task 4: 造 wc-004 —— 前端 fetchUsers() 丢失 success 校验
**Files:** 布局同前，wc-004，repo=frontend。
- 分支：`bug/wc-004`
- 改 bug：`frontend/src/api/users.ts` `fetchUsers()`：把成功分支里这段
```ts
  const result: ApiResponse<User[]> = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch users');
  }
  return result.data;
```
改成 **跳过 success 校验**，直接 `return result.data;`（保留 response.ok 检查）。

**FAIL_TO_PASS** `bench/problems/wc-004/tests/FetchUsersSuccess.test.ts`：
```ts
import { fetchUsers } from '../../../../../frontend/src/api/users';

describe('wc-004 fetchUsers checks success flag', () => {
  beforeEach(() => { global.fetch = jest.fn() as any; });
  it('throws when payload success is false', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, message: 'boom', data: null }),
    });
    await expect(fetchUsers()).rejects.toThrow('boom');
  });
});
```
红/绿验证同前（bug 分支运行 jest 该文件需临时放 `frontend/src/api/__tests__/`；见 Task 6 judge 统一注入路径约定：后端注入 `backend/src/service/__tests__/`，前端注入 `frontend/src/api/__tests__/` 与 `frontend/src/hooks/__tests__/`）。reference 恢复 `if(!result.success) throw` 后绿。回归：`cd frontend && npx jest src/components/__tests__/UserList.test.tsx` 仍 4/4。
`problem.md`：后端返回 `success:false` 时前端仍把 data 当成功处理，期望抛错。
`meta.json`：wc-004 / frontend / bug/wc-004 / pass=`frontend/src/components/__tests__/UserList.test.tsx` / fail=`FetchUsersSuccess.test.ts`。

---

### Task 5: 造 wc-005 —— 前端 useApi execute 吞异常
**Files:** 布局同前，wc-005，repo=frontend。
- 分支：`bug/wc-005`
- 改 bug：`frontend/src/hooks/useApi.ts` `execute`：catch 里删掉 `throw error;`（只 setError/onError，不再上抛）。

**FAIL_TO_PASS** `bench/problems/wc-005/tests/UseApiRethrow.test.tsx`：
```tsx
import { renderHook, act } from '@testing-library/react';
import { useApi } from '../../../../../frontend/src/hooks/useApi';

describe('wc-005 useApi.execute rethrows', () => {
  it('rejects when the api function rejects', async () => {
    const failing = async () => { throw new Error('nope'); };
    const { result } = renderHook(() => useApi(failing));
    await act(async () => {
      await expect(result.current.execute()).rejects.toThrow('nope');
    });
  });
});
```
红/绿验证同前（bug 分支上该 expect(...).rejects 收到 undefined 而 FAIL；reference 恢复 `throw error;` 后绿）。回归 UserList.test.tsx 4/4。
`problem.md`：调用 execute 时若内部函数抛错，错误不向调用方抛出，期望在设置 error 的同时重新抛出，调用方可用 try/catch 感知。
`meta.json`：wc-005 / frontend / bug/wc-005 / pass=UserList.test.tsx / fail=UseApiRethrow.test.tsx。

---

### Task 6: 实现打分 harness
**Files:**
- Create: `bench/lib/judge.mjs`
- Create: `bench/lib/eval.mjs`
- Create: `bench/agent/run-agent.example.mjs`
- Create: `bench/README.md`

**Interfaces:**
- `judge.mjs` 导出 `async judge({ workdir, packageDir, failTests, passTests }) -> { resolved, reason, failResults }`；把 `bench/problems/<id>/tests/*.test.ts` 复制到 packageDir 的注入目录后，用 `npx jest <failTests...> <passTests...>` 解析。
- 注入目录约定：后端 package 注入 `backend/src/service/__tests__/`；前端 fail 测试若以 `hooks/` 或 `api/` 目标命名的文件，注入 `frontend/src/hooks/__tests__/` 或 `frontend/src/api/__tests__/`。judge 依 meta.json 决定注入目录。
- `eval.mjs` 顶层 CLI：`node bench/lib/eval.mjs wc-001 <agentOutputDirOrPatch>` → 打印 resolved。
- 占位 agent：`run-agent.example.mjs <problem.md> <repoWorktree>` 打印"AGENT_PLACEHOLDER"（留接口，后续接入）。

- [ ] **Step 1: judge.mjs**

```js
// bench/lib/judge.mjs
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, '../..');

export function injectDirFor(packageDir) {
  if (packageDir === 'backend') return 'backend/src/service/__tests__';
  if (packageDir === 'frontend-hooks') return 'frontend/src/hooks/__tests__';
  if (packageDir === 'frontend-api') return 'frontend/src/api/__tests__';
  throw new Error('unknown package: ' + packageDir);
}

export async function judge({ repoDir, packageDir, failFile, passFiles }) {
  const pkg = packageDir === 'backend' ? 'backend' : 'frontend';
  const destDir = join(repoDir, injectDirFor(packageDir));
  mkdirSync(destDir, { recursive: true });
  cpSync(failFile, join(destDir, join('..', '..', '..').length ? basename(failFile) : 'x'));
  // 上面为示意；实际用 copyFileSync 到 destDir/basename
  ...
}
```
（end 处提供最终完整实现，见 Step 3。）

- [ ] **Step 2: 从 main 建立干净快照跑 judge 端到端脚本**
省略——见 Step 3 完整实现后统一验证。

- [ ] **Step 3: 完整实现 judge.mjs（见下）并自测**

```js
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, '../..');

const INJECT = {
  backend: 'backend/src/service/__tests__',
  'frontend-api': 'frontend/src/api/__tests__',
  'frontend-hooks': 'frontend/src/hooks/__tests__',
};

export async function judge({ repoDir, injectKey, failFile, passFiles }) {
  if (!INJECT[injectKey]) throw new Error('unknown injectKey: ' + injectKey);
  const pkg = injectKey === 'backend' ? 'backend' : 'frontend';
  const pkgDir = join(repoDir, pkg);
  const dest = join(pkgDir, INJECT[injectKey]);
  mkdirSync(dest, { recursive: true });
  const copied = join(dest, basename(failFile));
  copyFileSync(failFile, copied);
  try {
    const specs = [copied, ...passFiles.map((f) => join(pkgDir, f))];
    execFileSync('npx', ['jest', ...specs, '--runInBand'], {
      cwd: pkgDir, stdio: 'pipe', encoding: 'utf-8',
    });
    return { resolved: true, reason: null };
  } catch (err) {
    return { resolved: false, reason: String(err.stdout || err.message).slice(0, 800) };
  } finally {
    rmSync(copied, { force: true });
  }
}
```
- [ ] **Step 4: eval.mjs CLI**

```js
// bench/lib/eval.mjs
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, judge } from './judge.mjs';
import { execFileSync } from 'node:child_process';

const [id] = process.argv.slice(2);
const meta = JSON.parse(readFileSync(join(ROOT, 'bench/problems', id, 'meta.json'), 'utf-8'));
const failFile = join(ROOT, 'bench/problems', id, 'tests',
  basenameOf(meta.fail_to_pass[0])); // meta.fail_to_pass 存测试文件名
```
（完整实现以「从 main 复制出临时工作树 → checkout bug/<id> → 应用 agent patch → judge」为准，见 README。）

- [ ] **Step 5: README.md** 记录：目标/判定规则/目录约定/打分命令/新增 bug 步骤/红绿自验方法。

```bash
git add bench/lib bench/agent bench/README.md
git commit -m "bench: add jest judge harness + placeholder agent hook"
```

---

### Task 7: 全量自验 + push
- [ ] **Step 1:** 对每题从 main 出临时工作树，验证「bug 分支 FAIL_TO_PASS 红、套 reference.patch 后 FAIL_TO_PASS 绿、PASS_TO_PASS 全绿」。写进 `bench/README.md` 一张验收表。
- [ ] **Step 2:** 确认 main 基线仍全绿（backend 7/7，frontend 4/4）。
- [ ] **Step 3:** `git checkout main`，push 全部：`git push -u origin main` + 每个 `bug/wc-00N` 分支（`git push -u origin bug/wc-00N`）。
- [ ] **Step 4:** `git push origin docs 等已有分支`（含已提交的 docs 与基线修复）。完成后列出推送的分支清单给用户确认。

---

## Self-Review 备注
- Spec 覆盖：Task1-5=造 5 bug（Spec §6.4），Task6=打分 harness（Spec §5/3），Task7=自验+push（Spec §6.6/7）。基线已在 Task0 完成。
- 无 TBD：每题给出可执行注入 diff、完整测试、reference 语义。
- 类型一致：fail 测试经相对导入 `../../../../../backend/...` 从 `backend/src/service/__tests__/` 反推；若与 judge 注入目录不符，以 judge 实际注入的目录为准（Task 6 Step 1 已统一定义注入目录）。
