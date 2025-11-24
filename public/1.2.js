// ==UserScript==
// @name         import json
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Cloud JSON paragraphs, supporting button and keyboard switching, progress saving, and text box scrolling
// @author       ikun
// @match        https://web.jisupdf.com/*
// @icon         https://testingcf.jsdelivr.net/gh/Tomkmonkey/tjOnlineFile@main/icon/TJ-icon.png
// ==/UserScript==

(function() {
    'use strict';
    const novelUrl = 'https://testingcf.jsdelivr.net/gh/Tomkmonkey/EpubReading@main/epubFile/json/5.json';

    let backgroundPicUrl = 'https://testingcf.jsdelivr.net/gh/Tomkmonkey/tjOnlineFile@main/dianlutu/IMG_202511229021_1920x1080.png';
    let backgroundPic = backgroundPicUrl; 

    function clearPage() {
        document.body.innerHTML = '';
        document.body.style.cssText = 'margin: 0; padding: 0; font-family: Arial, sans-serif;';
    }


    function createBackground() {
        const img = document.createElement('img');
        Object.assign(img, {
            src: backgroundPic,
            alt: 'Page background',
            onerror: () => {
                console.log('Image loading failed, only text content will be displayed');
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


    let showFlag = 1, timer = null, txtView = null;
    let novelData = null, currIdx = 0;

    let savedIdx;
    //savedIdx = localStorage.getItem('novelProgress');
    if (savedIdx !== null) currIdx = parseInt(savedIdx, 10) || 0;


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
                    txtView.textContent = '29101×29388 cm';
                }
            }, 10000);
        } else {
            clearTimeout(timer);
            timer = null;
        }
    };


    const fetchNovelData = () => {
        try {
            fetch(novelUrl)
                .then(res => res.json())
                .then(json => {
                    novelData = json;
                    console.log('JSON Data:', json);
                    updateTxt();
                })
                .catch(err => console.error('Failed to fetch JSON:', err));
        } catch (err) {
            console.error('Failed to fetch JSON:', err);
        }
    };

    const initTxtView = () => {
        txtView = document.createElement('div');
        Object.assign(txtView.style, {
            fontSize: '10px', color: '#6d6d6dff', position: 'fixed',
            left: '1px', bottom: '3px', width: '1530px', display: 'inline-block',
            maxHeight: '16px', padding: '2px', background: 'rgba(252,252,252,1)',
            borderRadius: '3px', boxSizing: 'border-box', overflowY: 'auto',
            wordWrap: 'break-word', whiteSpace: 'normal', zIndex: '999'
        });
        txtView.textContent = 'Initializing...';
        document.body.appendChild(txtView);


        txtView.addEventListener('mouseenter', () => document.body.style.overflow = 'hidden');
        txtView.addEventListener('mouseleave', () => document.body.style.overflow = '');
        txtView.addEventListener('wheel', e => e.stopPropagation());
        
        setShowFlag(1);
    };

    const initButtons = () => {

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


        document.body.appendChild(createBtn('<', '65px', -1));
        document.body.appendChild(createBtn('>', '20px', 1));
    };


    const navParagraph = (dir) => {
        if (!novelData?.paragraphs || novelData.paragraphs.length === 0) {
            txtView.textContent = 'No paragraph data';
            setShowFlag(1);
            return;
        }
        const newIdx = Math.max(0, Math.min(currIdx + dir, novelData.paragraphs.length - 1));
        if (newIdx === currIdx) {
            txtView.textContent = dir > 0 ? 'Already at the last paragraph' : 'Already at the first paragraph';
            setShowFlag(1);
            return;
        }
        currIdx = newIdx;
        updateTxt();
        localStorage.setItem('novelProgress', currIdx);
    };


    const updateTxt = () => {
        if (!txtView) return;
        txtView.textContent = novelData?.paragraphs && novelData.paragraphs.length
            ? novelData.paragraphs[currIdx]?.text || 'Empty paragraph'
            : 'No paragraphs parsed';
        setShowFlag(1);
    };


    clearPage();
    createBackground();
    initTxtView();
    initButtons();
    fetchNovelData();

})();