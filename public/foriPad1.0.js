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
    const novelUrl = 'https://testingcf.jsdelivr.net/gh/Tomkmonkey/EpubReading@main/epubFile/json/5.json';


    let backgroundPicUrl = 'https://testingcf.jsdelivr.net/gh/Tomkmonkey/tjOnlineFile@main/dianlutu/IMG_202511229021_1920x1080.png';
    let backgroundPic = backgroundPicUrl; //

    // 清除页面内容
    function clearPage() {
        document.body.innerHTML = '';
        document.body.style.cssText = 'margin: 0; padding: 0; font-family: Arial, sans-serif;';
    }


    // 创建背景图片
    function createBackground() {
        const img = document.createElement('img');
        Object.assign(img, {
            src: backgroundPic,
            alt: '页面图片',
            onerror: () => {
                console.log('图片加载失败，将仅显示文本内容');
                img.style.display = 'none';
                document.body.style.backgroundColor = '#ffffff';
            }
        });

        Object.assign(img.style, {
            width: '100%',
            height: '100vh',
            objectFit: 'contain',
            backgroundColor: '#ffffff',
            position: 'absolute',
            zIndex: '1'
        });

        document.body.appendChild(img);
    }


    // 核心变量（精简缩写，保留语义）
    let showFlag = 1, timer = null, txtView = null;
    let novelData = null, currIdx = 0;
    // 读取保存的进度
    const savedIdx = localStorage.getItem('novelProgress');
    if (savedIdx !== null) currIdx = parseInt(savedIdx, 10) || 0;

    // 控制显示状态与计时
    const setShowFlag = (val) => {
        showFlag = val;
        if (txtView) txtView.style.display = val === 1 ? 'block' : 'none';
        if (val === 1) {
            timer && clearTimeout(timer);
            timer = setTimeout(() => {
                showFlag = 0;
                timer = null;
                if (txtView) {
                    txtView.style.display = 'block';
                    txtView.textContent = '29101×29388厘米';
                }
            }, 10000);
        } else {
            clearTimeout(timer);
            timer = null;
        }
    };

    // 获取JSON数据
    const fetchNovelData = () => {
        try {
            fetch(novelUrl)
                .then(res => res.json())
                .then(json => {
                    novelData = json;
                    console.log('JSON 数据:', json);
                    updateTxt();
                })
                .catch(err => console.error('获取JSON出错:', err));
        } catch (err) {
            console.error('获取JSON出错:', err);
        }
    };

    // 初始化文本显示容器
    const initTxtView = () => {
        txtView = document.createElement('div');
        Object.assign(txtView.style, {
            fontSize: '10px', color: '#6d6d6dff', position: 'fixed',
            left: '1px', bottom: '3px', width: '1530px', display: 'inline-block',
            maxHeight: '16px', padding: '2px', background: 'rgba(252,252,252,1)',
            borderRadius: '3px', boxSizing: 'border-box', overflowY: 'auto',
            wordWrap: 'break-word', whiteSpace: 'normal', zIndex: '999'
        });
        txtView.textContent = '初始化中...';
        document.body.appendChild(txtView);

        // 滚动权限控制
        txtView.addEventListener('mouseenter', () => document.body.style.overflow = 'hidden');
        txtView.addEventListener('mouseleave', () => document.body.style.overflow = '');
        txtView.addEventListener('wheel', e => e.stopPropagation());
        
        setShowFlag(1);
    };

    // 初始化切换按钮
    const initButtons = () => {
        // 创建按钮公共函数
        const createBtn = (text, bottom, dir) => {
            const btn = document.createElement('button');
            btn.textContent = text;
            Object.assign(btn.style, {
                position: 'fixed', bottom: bottom, right: '10px',
                width: '40px', height: '40px', color: 'rgba(76,76,76,1)',
                opacity: '0.8', border: 'none', outline: 'none', zIndex: '999'
            });
            btn.onclick = () => navParagraph(dir);
            return btn;
        };

        // 添加上下段按钮
        document.body.appendChild(createBtn('<', '65px', -1));
        document.body.appendChild(createBtn('>', '20px', 1));
    };

    // 段落导航（上一段/下一段）
    const navParagraph = (dir) => {
        if (!novelData?.paragraphs || novelData.paragraphs.length === 0) {
            txtView.textContent = '无段落数据';
            setShowFlag(1);
            return;
        }
        const newIdx = Math.max(0, Math.min(currIdx + dir, novelData.paragraphs.length - 1));
        if (newIdx === currIdx) {
            txtView.textContent = dir > 0 ? '已到最后一段' : '已到第一段';
            setShowFlag(1);
            return;
        }
        currIdx = newIdx;
        updateTxt();
        localStorage.setItem('novelProgress', currIdx);
    };

    // 更新文本显示
    const updateTxt = () => {
        if (!txtView) return;
        txtView.textContent = novelData?.paragraphs && novelData.paragraphs.length
            ? novelData.paragraphs[currIdx]?.text || '段落为空'
            : '未解析到段落';
        setShowFlag(1);
    };

    // 初始化流程    
    clearPage()
    createBackground()
    initTxtView();
    initButtons();
    fetchNovelData();


})();