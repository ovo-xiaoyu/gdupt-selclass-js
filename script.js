// ==UserScript==
// @name         GDUPT抢课脚本
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  自动抢课脚本
// @author       ovo-xiaoyu
// @match        https://jwxt.gdupt.edu.cn/xsxklist!xsmhxsxk.action
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener('load', function() {
        // 确保脚本在页面完全加载后运行
        var container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.right = '10px';
        container.style.zIndex = '1000';
        container.style.backgroundColor = '#f9f9f9';
        container.style.padding = '15px';
        container.style.border = '1px solid #ccc';
        container.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        container.style.fontFamily = 'Arial, sans-serif';
        document.body.appendChild(container);

        // 添加提示文字
        var infoText = document.createElement('div');
        infoText.innerHTML = '<center>gdupt-selclass-js</center><br>开源脚本 若您通过付费获得 那么就是被骗了！ <a href="https://github.com/ovo-xiaoyu/gdupt-selclass-js" target="_blank">Github</a>';
        infoText.style.marginBottom = '10px';
        infoText.style.color = '#000';
        container.appendChild(infoText);

        // 创建下拉框和按钮
        var select = document.createElement('select');
        select.style.marginBottom = '10px';
        select.style.padding = '5px';
        container.appendChild(select);

        var courseIdDiv = document.createElement('div');
        courseIdDiv.style.marginBottom = '10px';
        container.appendChild(courseIdDiv);

        var startButton = document.createElement('button');
        startButton.innerHTML = '开始抢课';
        startButton.style.marginRight = '10px';
        startButton.style.padding = '5px 10px';
        startButton.style.backgroundColor = '#4CAF50';
        startButton.style.color = 'white';
        startButton.style.border = 'none';
        startButton.style.cursor = 'pointer';
        container.appendChild(startButton);

        var stopButton = document.createElement('button');
        stopButton.innerHTML = '结束抢课';
        stopButton.style.padding = '5px 10px';
        stopButton.style.backgroundColor = '#f44336';
        stopButton.style.color = 'white';
        stopButton.style.border = 'none';
        stopButton.style.cursor = 'pointer';
        container.appendChild(stopButton);

        var resultDiv = document.createElement('div');
        resultDiv.style.marginTop = '10px';
        container.appendChild(resultDiv);

        var interval;

        // 获取课程列表
        fetch('https://jwxt.gdupt.edu.cn/xsxklist!getDataList.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'page=1&rows=80&sort=kcrwdm&order=asc'
        })
        .then(response => response.json())
        .then(data => {
            data.rows.forEach(course => {
                var option = document.createElement('option');
                option.value = course.kcrwdm;
                option.text = `${course.kcmc} (${course.xmmc})`;
                select.appendChild(option);
            });

            // 默认显示第一个课程的ID
            if (select.options.length > 0) {
                var firstOption = select.options[0];
                courseIdDiv.innerHTML = `课程ID: ${firstOption.value}`;
            }

            // 显示选中课程的ID
            select.addEventListener('change', function() {
                var selectedOption = select.options[select.selectedIndex];
                courseIdDiv.innerHTML = `课程ID: ${selectedOption.value}`;
            });
        })
        .catch(error => {
            resultDiv.innerHTML = '获取课程列表失败：' + error;
        });

        startButton.addEventListener('click', function() {
            var selectedOption = select.options[select.selectedIndex];
            var courseId = selectedOption.value;
            var courseName = selectedOption.text.split(' ')[0]; // 提取课程名称
            fetch('https://jwxt.gdupt.edu.cn/xsxklist!getAdd.action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `kcrwdm=${courseId}&kcmc=${courseName}`
            })
            .then(response => response.text())
            .then(data => {
                var now = new Date();
                var timeString = now.toLocaleTimeString();
                resultDiv.innerHTML = `${timeString} - ${data}`;
            })
            .catch(error => {
                var now = new Date();
                var timeString = now.toLocaleTimeString();
                resultDiv.innerHTML = `${timeString} - 抢课失败：${error}`;
            });

            interval = setInterval(function() {
                fetch('https://jwxt.gdupt.edu.cn/xsxklist!getAdd.action', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `kcrwdm=${courseId}&kcmc=${courseName}`
                })
                .then(response => response.text())
                .then(data => {
                    var now = new Date();
                    var timeString = now.toLocaleTimeString();
                    resultDiv.innerHTML = `${timeString} - ${data}`;
                })
                .catch(error => {
                    var now = new Date();
                    var timeString = now.toLocaleTimeString();
                    resultDiv.innerHTML = `${timeString} - 抢课失败：${error}`;
                });
            }, 1000); // 每秒尝试一次
        });

        stopButton.addEventListener('click', function() {
            clearInterval(interval);
            resultDiv.innerHTML = '抢课已停止';
        });
    });
})();
