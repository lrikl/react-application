'use strict';

import React, { useState } from 'react';

import "./voting.scss";

export default () => {
    const emojis = ["😒", "😂", "😇", "😎", "🙄"];

    const [emojiCounts, setEmojiCounts] = useState(JSON.parse(localStorage.getItem('emojiCountsYar')) || [0, 0, 0, 0, 0]);
    const [showResults, setShowResults] = useState(false);
    const [flyingEmojis, setFlyingEmojis] = useState([]);

    function emojiClick(index, event) {
        setEmojiCounts((prevCounts) => {
            const newEmojiCounts = [...prevCounts];
            newEmojiCounts[index] += 1;
            localStorage.setItem('emojiCountsYar', JSON.stringify(newEmojiCounts));
            return newEmojiCounts;
        });
        
        setShowResults(false);

        // анімація кліків emoji
        const rect = event.target.getBoundingClientRect();
        const randomOffset = (Math.random() - 0.8) * 40; 
        const x = rect.left + rect.width / 2 + randomOffset;
        const y = rect.top; 

        const emojiId = Date.now();

        setFlyingEmojis((prev) => [...prev, { id: emojiId, emoji: emojis[index], x, y }]);

        setTimeout(() => {
            setFlyingEmojis((prev) => prev.filter((e) => e.id !== emojiId));
        }, 1500);
    };

    function showResultsHandler() {
        setShowResults(true); 
    };

    function getMaxCount() {
        return Math.max(...emojiCounts);
    };

    function getWinningEmojiIndex() {
        const maxCount = getMaxCount();
        return emojiCounts.indexOf(maxCount);
    };

    function clearResults() {
        const clearedEmojiCounts = emojiCounts.map(() => 0);
        localStorage.setItem('emojiCountsYar', JSON.stringify(clearedEmojiCounts));
        setEmojiCounts(clearedEmojiCounts);
        setShowResults(false);
    };

    return (
        <div className="emoji-block">
            <h2>Голосування за найкращий смайлик</h2>

            <ul className="emoji-list">
                {emojis.map((emoji, index) => (
                    <li className="emoji-item" key={index}>
                        <span className="emoji" onClick={(event) => emojiClick(index, event)}>
                            {emoji}
                        </span>
                        {showResults && (
                            <span className="click-counter">
                                {emojiCounts[index]}
                            </span>
                        )}
                    </li>
                ))}
            </ul>

            <div className="btn-wrap">
                <button className="btn btn-show" onClick={showResultsHandler}>Результати</button>
                <button className="btn btn-clear" onClick={clearResults}>Очистити</button>
            </div>

            {showResults && (
                getMaxCount() === 0 ? (
                    <div className='results-block'>
                        <h2>Треба за когось проголосувати</h2>
                    </div>
                ) : (
                    <div className='results-block'>
                        <h2>Результати Голосування</h2>
                        <h3>Переможець:</h3>
                        <div className="emoji-item" key={getWinningEmojiIndex()}>
                            <div className="emoji">
                                {emojis[getWinningEmojiIndex()]}
                            </div>
                            <div className="click-counter">
                                Кількість голосів: {getMaxCount()}
                            </div>
                        </div>
                    </div>
                )
            )}

            {flyingEmojis.map((emoji) => (
                <span
                    key={emoji.id}
                    className="flying-emoji"
                    style={{ left: emoji.x, top: emoji.y }}
                >
                    {emoji.emoji}
                </span>
            ))}
        </div>
    );
};
