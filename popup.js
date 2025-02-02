document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ 확장 프로그램 팝업 실행됨!");

    chrome.storage.local.get(["emojiData"], function (result) {
        const emojiList = document.getElementById("emoji-list");
        
        if (result.emojiData && result.emojiData.length > 0) {
            emojiList.innerHTML = "";
            result.emojiData.forEach((emoji) => {
                const div = document.createElement("div");
                div.innerHTML = `<img src="${emoji.src}" width="30"> - ${emoji.type}`;
                emojiList.appendChild(div);
            });
        } else {
            console.log("⚠️ 저장된 이모티콘이 없습니다!");
        }
    });
});