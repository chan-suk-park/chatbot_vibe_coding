// 페이지가 로드될 때 오늘의 명언을 웰컴 메시지로 출력
document.addEventListener('DOMContentLoaded', function() {
    const quotes = [
        '성공은 준비와 기회의 만남이다. - Bobby Unser',
        '포기하지 마라. 오늘의 어려움은 내일의 힘이 된다.',
        '노력은 배신하지 않는다.',
        '작은 성취도 소중히 여기자.',
        '실패는 성공의 어머니이다.',
        '할 수 있다고 믿는 순간, 이미 반은 이룬 것이다. - Theodore Roosevelt',
        '시작이 반이다.',
        '오늘 걷지 않으면 내일은 뛰어야 한다.',
        '꿈을 꾸는 자만이 미래를 본다.',
        '행동이 모든 성공의 근본이다.'
    ];
    const today = new Date();
    const idx = today.getDate() % quotes.length;
    appendMessage('오늘의 명언\n"' + quotes[idx] + '"', 'bot-message');
});
document.getElementById('user-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendMessage();
});


// 아래에 본인의 OpenAI API 키를 입력하세요 (예: sk-...)
// 실제 서비스에서는 절대 소스코드에 키를 직접 입력하지 마세요!
const OPENAI_API_KEY = 'API 키 입력 해야하는 칸'; // <-- 여기에 API 키 입력

document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const input = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const userText = input.value.trim();
    if (!userText) return;
    appendMessage(userText, 'user-message');
    input.value = '';
    appendMessage('답변을 생성 중입니다...', 'bot-message');
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const botReply = await getGPTReply(userText);
        // 마지막 "답변을 생성 중입니다..." 메시지 제거
        const botMsgs = chatBox.getElementsByClassName('bot-message');
        if (botMsgs.length > 0) chatBox.removeChild(botMsgs[botMsgs.length - 1]);
        appendMessage(botReply, 'bot-message');
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (e) {
        const botMsgs = chatBox.getElementsByClassName('bot-message');
        if (botMsgs.length > 0) chatBox.removeChild(botMsgs[botMsgs.length - 1]);
        appendMessage('API 호출 오류: ' + e.message, 'bot-message');
    }
}

function appendMessage(text, className) {
    const chatBox = document.getElementById('chat-box');
    const msgDiv = document.createElement('div');
    msgDiv.className = className;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    msgDiv.appendChild(bubble);
    chatBox.appendChild(msgDiv);
}


async function getGPTReply(userText) {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === '여기에_본인_API_KEY_입력') {
        return 'OpenAI API 키가 필요합니다. script.js의 OPENAI_API_KEY를 입력하세요.';
    }
    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_API_KEY
    };
    const body = JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: '당신은 친절한 한국어 챗봇입니다.' },
            { role: 'user', content: userText }
        ],
        max_tokens: 256,
        temperature: 0.7
    });
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body
    });
    if (!response.ok) throw new Error('OpenAI API 오류 (' + response.status + ')');
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '답변을 생성하지 못했습니다.';
}
