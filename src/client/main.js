// ============================
// DOM Elements
// ============================
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messages');
const chatContainer = document.getElementById('chatContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const newChatBtn = document.getElementById('newChatBtn');
const themeToggle = document.getElementById('themeToggle');
const statusIndicator = document.getElementById('statusIndicator');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileOverlay = document.getElementById('mobileOverlay');
const sidebar = document.querySelector('.sidebar');
const suggestionChips = document.querySelectorAll('.chip');

// ============================
// State
// ============================
let userId = generateUserId();
let isProcessing = false;

// ============================
// Utilities
// ============================
function generateUserId() {
  const stored = localStorage.getItem('dify_user_id');
  if (stored) return stored;
  
  const newId = 'user_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('dify_user_id', newId);
  return newId;
}

function formatTime(date) {
  return date.toLocaleTimeString('ja-JP', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatMessage(text) {
  // コードブロックを変換
  let formatted = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
  });
  
  // インラインコードを変換
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 改行を<br>に変換
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
}

// ============================
// UI Functions
// ============================
function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showWelcomeScreen() {
  welcomeScreen.classList.remove('hidden');
  messagesContainer.innerHTML = '';
}

function hideWelcomeScreen() {
  welcomeScreen.classList.add('hidden');
}

function addMessage(content, type) {
  hideWelcomeScreen();
  
  const message = document.createElement('div');
  message.className = `message ${type}`;
  
  const avatar = type === 'assistant' 
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
      </svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>`;
  
  message.innerHTML = `
    <div class="message-avatar">
      ${avatar}
    </div>
    <div class="message-content">
      <div class="message-bubble">
        ${type === 'assistant' ? formatMessage(content) : escapeHtml(content)}
      </div>
      <div class="message-time">${formatTime(new Date())}</div>
    </div>
  `;
  
  messagesContainer.appendChild(message);
  scrollToBottom();
  
  return message;
}

function addTypingIndicator() {
  const message = document.createElement('div');
  message.className = 'message assistant';
  message.id = 'typingIndicator';
  
  message.innerHTML = `
    <div class="message-avatar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
      </svg>
    </div>
    <div class="message-content">
      <div class="message-bubble">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  `;
  
  messagesContainer.appendChild(message);
  scrollToBottom();
  
  return message;
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.remove();
  }
}

function addErrorMessage(error) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
    <span>${escapeHtml(error)}</span>
  `;
  messagesContainer.appendChild(errorDiv);
  scrollToBottom();
}

function updateStatus(status, message) {
  const dot = statusIndicator.querySelector('.status-dot');
  const text = statusIndicator.querySelector('.status-text');
  
  dot.classList.remove('connected', 'error');
  
  if (status === 'connected') {
    dot.classList.add('connected');
  } else if (status === 'error') {
    dot.classList.add('error');
  }
  
  text.textContent = message;
}

// ============================
// API Functions
// ============================
async function checkHealth() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    
    if (data.status === 'ok' && data.apiConfigured) {
      updateStatus('connected', '接続済み');
    } else if (data.status === 'ok' && !data.apiConfigured) {
      updateStatus('error', 'APIキー未設定');
    } else {
      updateStatus('error', '接続エラー');
    }
  } catch (error) {
    updateStatus('error', 'サーバーに接続できません');
  }
}

async function sendMessage(message) {
  if (isProcessing || !message.trim()) return;
  
  isProcessing = true;
  sendBtn.disabled = true;
  
  // ユーザーメッセージを追加
  addMessage(message, 'user');
  
  // 入力をクリア
  messageInput.value = '';
  autoResize();
  
  // タイピングインジケーターを表示
  addTypingIndicator();
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        userId: userId,
      }),
    });
    
    removeTypingIndicator();
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'APIエラーが発生しました');
    }
    
    const data = await response.json();
    addMessage(data.answer, 'assistant');
    
  } catch (error) {
    removeTypingIndicator();
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    addErrorMessage(errorMessage);
  } finally {
    isProcessing = false;
    updateSendButton();
  }
}

async function resetConversation() {
  try {
    await fetch('/api/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    showWelcomeScreen();
  } catch (error) {
    console.error('Reset error:', error);
  }
}

// ============================
// Event Handlers
// ============================
function autoResize() {
  messageInput.style.height = 'auto';
  messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
}

function updateSendButton() {
  sendBtn.disabled = !messageInput.value.trim() || isProcessing;
}

function handleSubmit(e) {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    sendMessage(message);
  }
}

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSubmit(e);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

function toggleMobileMenu() {
  sidebar.classList.toggle('open');
  mobileOverlay.classList.toggle('active');
}

function closeMobileMenu() {
  sidebar.classList.remove('open');
  mobileOverlay.classList.remove('active');
}

// ============================
// Initialization
// ============================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function init() {
  initTheme();
  
  // イベントリスナーを設定
  chatForm.addEventListener('submit', handleSubmit);
  messageInput.addEventListener('input', () => {
    autoResize();
    updateSendButton();
  });
  messageInput.addEventListener('keydown', handleKeyDown);
  
  newChatBtn.addEventListener('click', resetConversation);
  themeToggle.addEventListener('click', toggleTheme);
  
  mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  mobileOverlay.addEventListener('click', closeMobileMenu);
  
  // サジェスチョンチップのイベント
  suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const message = chip.getAttribute('data-message');
      if (message) {
        sendMessage(message);
      }
    });
  });
  
  // ヘルスチェック
  checkHealth();
  
  // 定期的なヘルスチェック
  setInterval(checkHealth, 30000);
  
  // 初期フォーカス
  messageInput.focus();
}

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', init);

