// ==UserScript==
// @name         import json
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  云端json段落，支持按钮和键盘切换、进度保存,文本框滚动
// @author       ikun
// @match        https://web.jisupdf.com/*
// @icon         https://testingcf.jsdelivr.net/gh/Tomkmonkey/tjOnlineFile@main/icon/TJ-icon.png
// ==/UserScript==

(function() {
    'use strict';
    let showParagraphflag = 1;
    let timer = null;
    let textView = null;

    function setShowParagraphflag(value) {
        showParagraphflag = value;
        if (textView) {
            textView.style.display = showParagraphflag === 1 ? 'block' : 'none';
        }
        if (value === 1) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                showParagraphflag = 0;
                timer = null;
                if (textView){
                    textView.style.display = 'block';
                    textView.textContent='29101×29388厘米';
                }
            }, 10000);
        } else {
            clearTimeout(timer);
            timer = null;
        }
    }

    let noveljson = null;
    let currentIndex = 0;
    const savedProgress = localStorage.getItem('novelProgress');
    console.log('当前进度:', savedProgress);
    if (savedProgress !== null) currentIndex = parseInt(savedProgress, 10) || 0;
    const noveljsonurl = 'https://testingcf.jsdelivr.net/gh/Tomkmonkey/EpubReading@main/epubFile/json/test.json';
    function fetchJsonFile(){
        try {
            fetch(noveljsonurl)
            .then(response => response.json())
            .then(json => {
                noveljson = json;
                console.log('JSON 数据:', json);
                updateParagraph();
            })
            .catch(error => console.error('获取 JSON 数据时出错:', error));
        } catch (error) {
            console.error('获取 JSON 数据时出错:', error);
        }
    }
    function initTextView() {
        textView = document.createElement('div');
        Object.assign(textView.style, {
            fontSize: `10px`,
            color: '#6d6d6dff',
            position: 'fixed',
            left: '1px',
            bottom: '3px',
            width: '1530px',
            display: 'inline-block',
            maxHeight: '16px',
            padding: '2px',
            background: 'rgba(252, 252, 252, 1)',
            borderRadius: '3px',
            boxSizing: 'border-box',
            overflowY: 'auto',
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            zIndex: '999',
        });
        textView.textContent = '初始化中...';
        document.body.appendChild(textView);
        textView.addEventListener('mouseenter', () => {
            document.body.style.overflow = 'hidden';
        });

        textView.addEventListener('mouseleave', () => {
            document.body.style.overflow = '';
        });

        textView.addEventListener('wheel', (e) => {
            e.stopPropagation();
        });
        setShowParagraphflag(1);
    }

    function initButtonControls() {
        const btnPrev = document.createElement('button');
        btnPrev.textContent = '<';

        btnPrev.style.position = 'fixed';
        btnPrev.style.bottom = '65px';
        btnPrev.style.right = '10px';
        btnPrev.style.width = '40px';
        btnPrev.style.height = '40px';
        btnPrev.style.color = 'rgba(76, 76, 76, 1)';
        btnPrev.style.opacity = '0.8';
        btnPrev.style.border = 'none';
        btnPrev.style.outline = 'none';
        btnPrev.style.zIndex = '999';

        btnPrev.onclick = () => {
            navigateParagraph(-1);
        };


        const btnNext = document.createElement('button');
        btnNext.textContent = '>';

        btnNext.style.position = 'fixed';
        btnNext.style.bottom = '20px';
        btnNext.style.right = '10px';
        btnNext.style.width = '40px';
        btnNext.style.height = '40px';
        btnNext.style.color = 'rgba(76, 76, 76, 1)';
        btnNext.style.opacity = '0.8';
        btnNext.style.border = 'none';
        btnNext.style.outline = 'none';
        btnNext.style.zIndex = '999';

        btnNext.onclick = () => {
            navigateParagraph(1);
        };

        document.body.appendChild(btnPrev);
        document.body.appendChild(btnNext);
    }


    function navigateParagraph(direction) {
        if (!noveljson?.paragraphs || noveljson.paragraphs.length === 0) {
            textView.textContent = '无段落数据';
            setShowParagraphflag(1);
            return;
        }
        const newIndex = Math.max(0, Math.min(currentIndex + direction, noveljson.paragraphs.length - 1));
        if (newIndex === currentIndex) {
            textView.textContent = direction > 0 ? '已到最后一段' : '已到第一段';
            setShowParagraphflag(1);
            return;
        }
        currentIndex = newIndex;
        updateParagraph();
        saveProgress();
    }

    function updateParagraph() {
        if (!textView) return;
        if (!noveljson?.paragraphs || noveljson.paragraphs.length === 0) {
            textView.textContent = '未解析到段落';
        } else {
            textView.textContent = noveljson.paragraphs[currentIndex]?.text || '段落为空';
        }
        setShowParagraphflag(1);
    }

    function saveProgress() {
        localStorage.setItem('novelProgress', currentIndex);
    }

    initTextView();
    initButtonControls();
    fetchJsonFile();
})();