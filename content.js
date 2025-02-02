// 채팅창을 찾는 함수
function getChatContainer() {
    return document.querySelector("#aside-chatting [class*='live_chatting_list_wrapper__']");
}

// 채팅창에서 이모티콘 클릭 감지 (이벤트 위임 사용)
function handleEmojiClick(event) {
    const clickedElement = event.target;

    // 이모티콘인지 확인 (클래스명 또는 태그로 체크)
    if (clickedElement.tagName === "IMG") {
        const emojiInfo = getEmojiInfo(clickedElement);
        if(emojiInfo.type !=="unknown")
            console.log("이모티콘 정보:", emojiInfo);

        // 이모티콘 정보를 표시하는 툴팁 생성
        showEmojiTooltip(event, emojiInfo);
    }
}

// 이미지 링크에 따른 이모티콘 분석.
function getEmojiInfo(imgElement){
    const emojiSrc = imgElement.src;
    if(emojiSrc.includes("https://nng-phinf.pstatic.net/glive/subscription/emoji/")){
        const match = emojiSrc.match(/emoji\/([^\/]+)\//);
        const channelId = match ? match[1]:"unknown";
        return{
            type:"subscription-emoji",
            channelId: channelId,
            src : emojiSrc
        };
    }else if(emojiSrc.includes("https://ssl.pstatic.net/static/nng/glive/icon/")){
        return{
            type:"chzzk-emoji",
            src : emojiSrc
        };
    } else{
        return {
            type: "unknown",
            src: emojiSrc
        }
    }
}

// 툴팁 표시 함수  
function showEmojiTooltip(event, emojiInfo) {
    // 기존 툴팁이 있으면 제거
    document.querySelectorAll(".emoji-tooltip").forEach(el => el.remove());

    const tooltip = document.createElement("div");
    tooltip.classList.add("emoji-tooltip");
    tooltip.style.position = "absolute";
    tooltip.style.background = "black";
    tooltip.style.color = "white";
    tooltip.style.padding = "6px 10px";
    tooltip.style.borderRadius = "5px";
    tooltip.style.top = `${event.clientY}px`;
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.zIndex = "10000";
    tooltip.style.boxShadow = "0px 2px 5px rgba(0, 0, 0, 0.3)";

    if (emojiInfo.type === "subscription-emoji") {
        tooltip.innerHTML = `<b>🎉 스트리머 구독 이모티콘</b><br>채널 ID: ${emojiInfo.channelId}<br><img src="${emojiInfo.src}" width="40">`;
    } else if (emojiInfo.type === "chzzk-emoji") {
        tooltip.innerHTML = `<b>✅ 네이버 기본 이모티콘</b><br><img src="${emojiInfo.src}" width="40">`;
    } else {
        tooltip.innerHTML = `<b>❓ 알 수 없는 이모티콘</b><br><img src="${emojiInfo.src}" width="40">`;
    }

    document.body.appendChild(tooltip);

    setTimeout(() => {
        tooltip.remove();
    }, 3000);
}
let mainObserver = null;
let currentChatContainer = null;

// 채팅 컨테이너 감지 및 이벤트 바인딩
function initChatContainer() {
    const newContainer = getChatContainer();
    if (!newContainer) return;

    // 새 컨테이너 발견 시 이벤트 리스너 등록
    if (newContainer !== currentChatContainer) {
        if (currentChatContainer) {
            currentChatContainer.removeEventListener("click", handleEmojiClick);
        }
        newContainer.addEventListener("click", handleEmojiClick);
        currentChatContainer = newContainer;
        console.log("✅ 새 채팅 컨테이너 연결 완료");
    }
}

// DOM 변화 감지 로직
function setupObservers() {
    // 메인 Observer: 전체 DOM 변화 감시
    mainObserver = new MutationObserver((mutations) => {
        // 채팅 컨테이너 존재 여부 확인
        if (!getChatContainer()) {
            console.log("⚠️ 채팅 컨테이너 사라짐, 재탐색 시작");
            currentChatContainer = null;
        }
        initChatContainer();
    });

    mainObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });

    // History API 감지 로직
    const historyHandler = () => {
        console.log("🔄 페이지 변경 감지, 강제 재탐색");
        currentChatContainer = null;
        initChatContainer();
    };

    const originalPushState = history.pushState;
    history.pushState = function(...args) {
        originalPushState.apply(this, args);
        historyHandler();
    };

    window.addEventListener("popstate", historyHandler);
}

// 초기화
function initialize() {
    setupObservers();
    initChatContainer();
}

initialize();