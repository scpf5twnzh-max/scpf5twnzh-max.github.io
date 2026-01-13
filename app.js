// DOM元素
const noteInput = document.getElementById('noteInput');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const notesList = document.getElementById('notesList');

// 初始化渲染笔记
window.addEventListener('load', renderNotes);

// 保存笔记
saveBtn.addEventListener('click', () => {
    const content = noteInput.value.trim();
    if (!content) return alert('请输入笔记内容！');
    
    // 生成唯一键值（时间戳）
    const key = `note_${Date.now()}`;
    // 笔记数据（含内容和时间）
    const noteData = {
        content: content,
        time: new Date().toLocaleString()
    };
    // 存入本地存储
    localStorage.setItem(key, JSON.stringify(noteData));
    // 清空输入框
    noteInput.value = '';
    // 重新渲染
    renderNotes();
});

// 清空全部笔记
clearBtn.addEventListener('click', () => {
    if (confirm('确定要清空所有笔记吗？')) {
        localStorage.clear();
        renderNotes();
    }
});

// 渲染笔记列表
function renderNotes() {
    notesList.innerHTML = '';
    const notes = getNotesFromStorage();
    
    if (notes.length === 0) {
        notesList.innerHTML = '<div style="text-align:center;color:#718096;">暂无笔记</div>';
        return;
    }
    
    // 按时间倒序排列（最新在前）
    notes.sort((a, b) => b.timestamp - a.timestamp);
    
    notes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        noteItem.innerHTML = `
            <div class="note-time">${note.data.time}</div>
            <div>${note.data.content}</div>
            <button class="note-delete" data-key="${note.key}">删除</button>
        `;
        notesList.appendChild(noteItem);
    });
    
    // 绑定删除事件
    document.querySelectorAll('.note-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const key = e.target.dataset.key;
            localStorage.removeItem(key);
            renderNotes();
        });
    });
}

// 从本地存储获取所有笔记
function getNotesFromStorage() {
    const notes = [];
    // 遍历本地存储
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // 筛选笔记数据
        if (key.startsWith('note_')) {
            const data = JSON.parse(localStorage.getItem(key));
            const timestamp = parseInt(key.split('_')[1]);
            notes.push({ key, data, timestamp });
        }
    }
    return notes;
}

// 注册Service Worker（实现离线功能）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('Service Worker注册成功'))
            .catch(err => console.log('Service Worker注册失败:', err));
    });
}

// 自动保存草稿（每3秒）
setInterval(() => {
    const content = noteInput.value.trim();
    if (content) {
        localStorage.setItem('draft', content);
    }
}, 3000);

// 加载草稿
window.addEventListener('load', () => {
    const draft = localStorage.getItem('draft');
    if (draft) noteInput.value = draft;
});