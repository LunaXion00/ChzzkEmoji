// 채팅창을 찾는 함수
function getChatContainer() {
    return document.querySelector("#aside-chatting [class*='live_chatting_list_wrapper__']");
}

// 채팅창에서 이모티콘 클릭 감지 
function handleEmojiClick(event) {
    const clickedElement = event.target;
    const isChatEmoji = clickedElement.closest('.live_chatting_message_text__DyleH img');
    // 이모티콘인지 확인 (클래스명 또는 태그로 체크)
    if (clickedElement.tagName === "IMG" && isChatEmoji) {
        const emojiInfo = getEmojiInfo(clickedElement);

        // 이모티콘 정보를 표시하는 툴팁 생성 및 치지직 기본 팝업 표시 X
        event.stopPropagation();
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

const channelCache = new Map();

// 채널 정보 가져오기 함수
async function fetchChannelInfo(channelId) {
    if (channelCache.has(channelId)) {
        return channelCache.get(channelId);
    }

    try {
        const response = await fetch(`https://api.chzzk.naver.com/service/v1/channels/${channelId}`);
        const data = await response.json();
        
        if (data.code === 200) {
            const channelInfo = {
                name: data.content.channelName,
                image: data.content.channelImageUrl,
                verified: data.content.verifiedMark
            };
            channelCache.set(channelId, channelInfo);
            return channelInfo;
        }
    } catch (error) {
        console.error('채널 정보 조회 실패:', error);
        return null;
    }
}

// 툴팁 표시 함수 수정
async function showEmojiTooltip(event, emojiInfo) {
    document.querySelectorAll(".emoji-tooltip").forEach(el => el.remove());

    const tooltip = document.createElement("div");
    tooltip.classList.add("emoji-tooltip");
    
    // 기본 스타일 유지
    tooltip.style.position = "fixed";
    tooltip.style.background = "#2a2a2a";
    tooltip.style.color = "white";
    tooltip.style.padding = "12px";
    tooltip.style.borderRadius = "8px";
    tooltip.style.zIndex = "10000";
    tooltip.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    tooltip.style.display = "flex";
    tooltip.style.gap = "10px";
    tooltip.style.alignItems = "center";
    tooltip.style.maxWidth = "300px";
    tooltip.style.maxHeight = "150px";
    tooltip.style.overflowY = "auto";
    // 뷰포트 경계 계산
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const mouseX = event.clientX;
    mouseY = event.clientY;

    // 기본 위치: 마우스 오른쪽 아래
    let top = mouseY + 15;
    let left = mouseX + 15;

    // 수직 위치 조정 (아래 공간 부족 시 위로)
    if (top + 150 > viewportHeight) {
        top = mouseY - 165; // 툴팁 높이(150) + 여백(15)
    }

    // 수평 위치 조정 (오른쪽 공간 부족 시 왼쪽으로)
    if (left + 300 > viewportWidth) {
        left = mouseX - 315; // 툴팁 너비(300) + 여백(15)
    }

    tooltip.style.top = `${Math.max(10, top)}px`; // 최소 10px 여유
    tooltip.style.left = `${Math.max(10, left)}px`;
    
    // 로딩 상태 표시
    tooltip.innerHTML = `
        <div class="loading-spinner"></div>
        <span style="margin-left:8px;">채널 정보 불러오는 중...</span>
    `;
    // 툴팁 컨텐츠 컨테이너
    const contentContainer = document.createElement("div");
    contentContainer.style.display = 'flex';
    contentContainer.style.gap = '10px';
    contentContainer.style.alignItems = 'center';

    // 닫기 버튼 생성
    const closeButton = document.createElement("div");
    closeButton.innerHTML = "×";
    closeButton.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        cursor: pointer;
        font-size: 18px;
        color: #fff;
        padding: 2px 8px;
        border-radius: 50%;
        transition: background 0.2s;
    `;
    
    // 닫기 버튼 호버 효과
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'rgba(255,255,255,0.1)';
    });
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'transparent';
    });

    // 닫기 버튼 클릭 핸들러
    const removeTooltip = () => {
        tooltip.remove();
    };
    closeButton.addEventListener('click', removeTooltip);


    try {
        const channelInfo = await fetchChannelInfo(emojiInfo.channelId);
        
        if (emojiInfo.type === "chzzk-emoji") {
            tooltip.innerHTML = `
                <img src="${emojiInfo.src}" 
                     style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                <div>
                    <div style="font-size:0.9em; color:#ccc; margin-top:4px;">
                        치지직 공식 이모티콘
                    </div>
                </div>
            `;
        } else {
            tooltip.innerHTML = `
                ${channelInfo?.image ? `
                    <img src="${channelInfo.image}" 
                         style="width:40px; height:40px; border-radius:50%; object-fit:cover;">`
                    : '<div style="width:40px; height:40px; background:#555; border-radius:50%;"></div>'}
                <div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span style="font-weight:600;">${channelInfo?.name}</span>
                    </div>
                    <div style="font-size:0.9em; color:#ccc; margin-top:4px;">
                        ${'구독자 전용 이모티콘'}
                    </div>
                </div>
            `;
        }
    } catch (error) {
        tooltip.innerHTML = '⚠️ 채널 정보를 불러올 수 없습니다';
    }
    tooltip.prepend(closeButton);
    tooltip.appendChild(closeButton);
    tooltip.appendChild(contentContainer);
    document.body.appendChild(tooltip);
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
        newContainer.addEventListener("click", handleEmojiClick, true);
        currentChatContainer = newContainer;
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