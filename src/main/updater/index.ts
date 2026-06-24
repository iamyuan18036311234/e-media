/**
 * 更新模块入口
 *
 * 只保留基于 electron-updater 的增量更新。
 * 全量更新代码已移除（每个版本都有完整 setup.exe，增量更新已足够）。
 */

export { initIncrementalUpdater, getCachedUpdateInfo } from './incremental-updater'
