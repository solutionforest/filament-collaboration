<?php

declare(strict_types=1);

return [
    'someone' => '某位同事',
    'busy' => '有同事正在儲存此記錄，請稍後再試。',
    'foreign_upload' => '有圖片尚待上載者儲存，請先由該同事儲存。',

    'modes' => [
        'browsing' => '瀏覽中',
        'creating' => '建立中',
        'viewing' => '檢視中',
        'editing' => '編輯中',
    ],

    'values' => [
        'empty' => '（空白）',
        'yes' => '是',
        'no' => '否',
    ],

    'column' => [
        'label' => '在線同事',
        'empty' => '沒有其他人',
    ],

    'pull' => [
        'title' => '表單已更新',
        'taken' => '已更新：:fields',
        'conflicts' => '儲存時需要選擇版本：:fields',
    ],

    'conflict' => [
        'heading' => '處理與 :name 的修改衝突',
        'description' => '{1} 你和 :name 修改了同一欄位。|[2,*] 你和 :name 修改了相同的欄位。',
        'modal' => ':name 已儲存不同內容。再按儲存會保留你的版本，取消則保留對方的版本。',
        'mine' => '保留我的版本',
        'theirs' => '使用 :name 的版本',
        'submit' => '按選擇儲存',
        'stale' => '記錄再次被修改，請關閉視窗後重新儲存。',
    ],

    'discard' => [
        'heading' => '捨棄共享草稿？',
        'description' => '你可編輯欄位中所有人尚未儲存的修改，都會還原至上次儲存的版本。',
        'action' => '捨棄草稿',
    ],

    'debug' => [
        'label' => '協作檢查器',
        'heading' => '協作檢查器',
        'description' => '顯示此分頁的同步狀態，不會顯示欄位內容。',
        'close' => '關閉',
    ],

    'client' => [
        'connecting' => '連線中…',
        'synced' => '所有修改已共享',
        'syncing' => '共享中…',
        'unsaved' => '草稿未儲存',
        'offline' => '離線，正在重試',
        'stopped' => '即時編輯已停止，修改會在儲存時合併',
        'denied' => '你已沒有存取權限',
        'saved' => ':name 已儲存',
        'not_recovered' => '重新載入前部分未傳送的修改無法復原',
        'pull' => '取得修改',
        'discard' => '捨棄共享草稿',
        'people' => '在線同事',
        'alone' => '沒有其他人',
        'you' => '你（另一分頁）',
        'idle' => '暫時離開',
        'in_field' => '位於「:field」',
        'more' => '另外 :count 人',
        'jump' => '前往 :name',
    ],
];
