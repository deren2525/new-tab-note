# New Tab Note ✏️

<div align="center">
  <img src="https://user-images.githubusercontent.com/32975158/124477366-ea668e80-ddde-11eb-83bb-c6a98e4757be.png" width="80%">
</div>

<br>
新規タブをメモ代わりにすることができます

[このChrome拡張機能をインストール](https://chrome.google.com/webstore/detail/new-tab-note/ihcgjbnbjnbfepjmoaklafegcehdfihn)

## 📚 特徴 🚀

- 新しいタブをメモ画面として使えます
- マークダウン記法に対応しています
- リロードしても内容は自動で保存されます
- フィルターモードでメモをぼかしてのぞき見を防止できます
- 複数のノートを作成・切り替えできます
- カラーテーマを自由に変更できます
- 同期をオンにしたノートは、同じ Chrome アカウントでログインしている端末間で共有できます

- Use a new tab as your notebook
- Supports Markdown syntax
- Notes are saved automatically, even after reloading
- Filter mode blurs your notes to prevent peeking
- Create and switch between multiple notes
- Customize with different color themes
- Notes with sync enabled are shared across devices signed in with the same Chrome account

## ⚠️ 注意事項

- 同期できる容量は chrome.storage.sync の制限により合計で約 100KB(1 アイテムあたり約 8KB)までです。上限を超えると同期が停止するため、不要なノートを整理してご利用ください

- The sync storage capacity is limited to roughly 100 KB in total (about 8 KB per item) by chrome.storage.sync. If you exceed the quota, syncing stops until you clean up notes.

バグの報告や改善案ご要望など大募集です。[こちら](https://github.com/deren2525/new-tab-note/issues/new/choose)からお願いします！

## Documentation

- [要件定義](docs/requirements.md)
- [同期仕様](docs/sync-specification.md)
- [同期競合ポリシー](docs/decisions/001-sync-conflict-policy.md)

# WXT + Vue 3

This template should help get you started developing with Vue 3 in WXT.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar).
