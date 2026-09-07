# worldcup mini SWE-bench

5 个由 AI 注入的 bug（3 后端 + 2 前端），用来评测 coding agent 在真实仓库上的 bug 修复能力。判定 = 真实跑 jest：修复须让 FAIL_TO_PASS 通过且不破坏回归(PASS_TO_PASS)。

## 判定规则
```
resolved = (FAIL_TO_PASS 全绿) AND (PASS_TO_PASS 全绿)
```
- FAIL_TO_PASS：每题专门写的一条能抓住该 bug 的测试（在 bug 代码上为红，修好后为绿）。
- PASS_TO_PASS：该题所在包的既有测试（backend=UserService.test.ts，frontend=UserList.test.tsx）。

## 目录
```
bench/
  problems/wc-00N/           每道题
    problem.md               给 agent 的问题描述（不含答案）
    meta.json                判据/注入目录/回归集
    reference.patch          参考修复（内部自验用）
    tests/                   FAIL_TO_PASS 测试源码（打分时注入，不进 agent 视野）
  lib/judge.mjs              打分核心（注入 FAIL 测试 → 跑 jest）
  lib/eval.mjs               单题打分 CLI
  agent/run-agent.example.mjs  agent 接入占位钩子
```
git 分支：`main` = 干净基线(全绿)。每题源码缺陷在分支 `bug/wc-00N`（= main + 该 bug）。

## 用 agent 生成补丁
对某题，把 `bench/problems/<id>/problem.md` 交给 agent，让它基于该题的 bug 分支改仓库源码，产出候选补丁 `fix.patch`。例如题 wc-001 对应分支 `bug/wc-001`。

## 打分一条候选补丁
```bash
node bench/lib/eval.mjs wc-001 /path/to/fix.patch
# => {"id":"wc-001","resolved":true/false,"reason":...}
```
不带补丁即测"空修复"基线（应 unresolved）：
```bash
node bench/lib/eval.mjs wc-001
```

## 批量打分
循环即可：`for id in wc-00{1..5}; do node bench/lib/eval.mjs $id <patchDir>/$id.patch; done`

## 加新题
1. 从 main 建分支 `bug/wc-00N`，只注入一处源码缺陷。
2. 在 `bench/problems/wc-00N/` 写 problem.md、meta.json、tests/<FAIL 测试>、reference.patch。
3. 自验：bug 分支上 FAIL 测试红、回归绿；套 reference 修复后 FAIL 绿、回归仍绿。

## 内部自验记录（红→绿）
| 题 | 缺陷 | 红(修复前) | 绿(修复后) | 回归 |
|---|---|---|---|---|
| wc-001 | update() 邮箱唯一性失效 | FAIL | PASS | 7/7 |
| wc-002 | update() 找不到用户不抛错 | FAIL | PASS | 7/7 |
| wc-003 | findAll() 空返回 null | FAIL | PASS | 7/7 |
| wc-004 | fetchUsers() 忽略 success=false | FAIL | PASS | 4/4 |
| wc-005 | useApi.execute 吞异常不 rethrow | FAIL | PASS | 4/4 |
