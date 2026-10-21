// ==UserScript==
// @name         Wi-Fi.HK 自動連線登入 (全港通用版)
// @namespace    http://tampermonkey.net/
// @version      3.0
// @match        *://free-m.wifi.gov.hk/*
// @match        *://free.wifi.gov.hk/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 如果已經在成功頁面則不重複執行
    if (window.location.href.includes('/connected') || window.location.href.includes('success')) {
        return;
    }

    // 情況 A：處理新版系統 (free-m.wifi.gov.hk)
    if (window.location.hostname === 'free-m.wifi.gov.hk') {
        async function autoLoginNew() {
            try {
                await fetch('/ecp/api/event/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: '{}'
                });
                const res = await fetch('/ecp/api/captive-login/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: '{}'
                });
                if (res.ok) {
                    window.location.href = '/ecp/connected/';
                    return;
                }
            } catch (err) {
                console.error('API 登入失敗，轉為點擊模式', err);
            }
        }
        setTimeout(autoLoginNew, 300);
    }

    // 情況 B：通用自動點擊（同時支援 free.wifi.gov.hk 及中英文按鈕）
    const targetTexts = ['同意', 'I Accept', 'Accept', '接受'];
    const timer = setInterval(() => {
        const candidates = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], div.btn, span');
        for (const el of candidates) {
            const text = (el.innerText || el.value || el.textContent || '').trim();
            if (targetTexts.includes(text)) {
                el.click();
                if (el.parentElement) el.parentElement.click();
                clearInterval(timer);
                break;
            }
        }
    }, 300);

    // 10 秒後停止尋找
    setTimeout(() => clearInterval(timer), 10000);
})();
