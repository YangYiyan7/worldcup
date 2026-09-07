# 设计：worldcup 迷你 SWE-bench 基准（5 个 bug + 本地 jest 打分，推 GitHub）

- 日期：2026-09-07
- 仓库：`github.com/YangYiyan7/worldcup.git`（Next.js 前端 + Midway.js/TypeORM 后端）
- 目标：用 SWE-bench 思路评测"AI coding agent 修这个仓库的 bug"，算出每题 resolved / unresolved；agent 接入后置。

## 1. 背景与目标
用户想"用 SWE-bench 的方式评测 AI agent 修自己仓库 worldcup 的 bug"。已澄清：
- bug 来源：由我们为仓库**造 5 个真实 bug**（3 后端 + 2 前端），每 bug 配"会失败的测试(FAIL_TO_PASS) + 参考修复 + 回归集(PASS_TO_PASS)"。
- agent 接入：**后置**。本次交付 = bug 实例 + 打分脚本；agent 用预留钩子接入。
- 位置：直接在 worldcup 仓库内加 `bench/`；每题一个独立分支 `bug/wc-00N`；push 到用户 GitHub。
- 认证：用户称已配好，直接推。

## 2. 现状（探查结论）
- 后端 `backend/`：Midway.js + TypeORM，单测 `src/service/__tests__/UserService.test.ts` 用 **mock repository、不连库**，jest/ts-jest，可稳定判定。
- 前端 `frontend/`：Next.js + React + RTL/jsdom，现有 `UserList.test.tsx`。
- **已知基线风险**：`UserList.test.tsx` 断言首屏 "Loading users..."，但 `UserList` 是无 loading 态的 async 组件 → 该测试可能本就红。必须在干净 main 上先跑全测试，建立绿基线，坏测试需修（最小合理改法，列清单确认）。
- 环境：Node v24 / npm 11。npm 官方源若慢，切国内 `npmmirror`。

## 3. 交付物（文件布局，均在 worldcup 仓库内）
```
bench/
  README.md                # 用法 + 如何新增 bug
  problems/wc-00N/         # 每题一目录
    problem.md             # 给 agent 的问题描述（不含答案）
    fail_to_pass.tests     # 判定需过的测试（pytest/jest 路径）
    pass_to_pass.tests     # 回归集（通常指向现有全量测试）
    reference.patch        # 参考修复（仅内部自验用，不给 agent）
    meta.json              # instance 元数据（repo、base、涉及文件、判据）
  lib/eval.mjs             # 打分主逻辑（纯 Node，不用 Docker）
  lib/judge.mjs            # 跑 jest，解析 FAIL_TO_PASS / PASS_TO_PASS
  agent/run-agent.example.mjs  # agent 接入钩子（本次占位）
  reports/<run>.json       # 打分汇总输出
```
git 分支：`main` 保持干净可做回归基线；每题一个 `bug/wc-00N` 分支只含该 bug 的快照。

## 4. 每题定义与判定
- 干净基线 = `main` 上现有测试全绿 → 作为回归集来源。
- bug 分支 = main + 注入一处逻辑 bug。
- 每题含 1 条（或几条）FAIL_TO_PASS 测试：bug 分支上红、套参考修复后绿。
- agent 输入 = `problem.md`（现象，不含行级答案）。
- 判定：
  ```
  resolved  = FAIL_TO_PASS 全绿 AND PASS_TO_PASS 全绿
  否则按原因分类 unresolved / infra(编译/环境挂) / error
  ```

## 5. 打分流程（每题一轮）
```
1. 由 bug/<id> 生成干净工作拷贝（只含该 bug 源码快照）
2. 把 problem.md 交给 agent（run-agent 钩子，先占位返回待接入）
3. agent 改代码 → 产出 patch（或改后工作区）
4. 应用 patch → judge 跑 FAIL_TO_PASS + PASS_TO_PASS
5. 写 reports/<run>.json：每题 resolved/unresolved/error + 原因
```

## 6. 落地步骤
1. 在 `~/worldcup-bench`（完整 clone）上工作。
2. `npm install`（backend、frontend；必要时 npmmirror）。
3. **基线审计**：在 main 跑全测试，记录基线；修复任何坏测试（改动列清单交用户确认），保证绿。
4. 造 5 个 bug：为每题建 `bug/wc-00N` 分支、写 FAIL_TO_PASS 测试与 reference.patch、写 problem.md。自验：bug 分支红、套 reference 后绿、回归集仍绿。
5. 实现 `bench/lib/eval.mjs` + `judge.mjs` + agent 占位钩子 + README。
6. push 分支与 `bench/` 到 GitHub（用户已授权直接推）。

## 7. 成功标准
- main 基线测试全绿（回归基线成立）。
- 每题：bug 分支上 FAIL_TO_PASS 红；套 reference.patch 后 FAIL_TO_PASS 绿、回归集仍绿。
- 打分脚本能在给定 agent patch（或改后工作区）时正确判定 resolved/unresolved。
- bug 分支、bench/ 均已 push，README 说明可用。
