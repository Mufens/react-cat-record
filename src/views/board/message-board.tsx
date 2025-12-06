import React, { useState, useEffect, useRef } from 'react';
import { Button, Input } from 'antd';
import bgImage from '@/assets/images/bg3.png';
import './message-board.scss';

interface Danmu {
  content: string;
  color: string;
  id: number;
  top: number;
  left: number;
}

const MessageBoard: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [speed, setSpeed] = useState(180);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);
  const [danmuList, setDanmuList] = useState<Danmu[]>([]);
  const inputRef = useRef<any>(null);
  const baberrageRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastDanmu = useRef({ content: '', time: 0 });

  const minSpeed = 1;
  const maxSpeed = 250;
  const colors = ['#e73c7e', '#23a6d5', '#23d5ab', '#ee7752', '#FCD337', '#C1651A'];

  const initialDanmus: Omit<Danmu, 'id' | 'top' | 'left'>[] = [
    { content: '欢迎来到留言板！', color: '#e73c7e' },
    { content: '试试发送一条弹幕吧～', color: '#23a6d5' },
    { content: '弹幕速度可以调节哦！', color: '#23d5ab' },
    { content: '你也可以使用不同的颜色！', color: '#ee7752' },
    { content: '祝你玩得开心！', color: '#e73c7e' },
    { content: '我爱猫猫', color: '#23a6d5' },
  ];

  useEffect(() => {
    const initial: Danmu[] = initialDanmus.map((dm, idx) => ({
      ...dm,
      id: idx,
      top: Math.random() * 300,
      left: 100,
    }));
    setDanmuList(initial);
  }, []);

  useEffect(() => {
    if (!isVisible || isPaused) return;

    const animate = () => {
      setDanmuList((prev) =>
        prev.map((dm) => ({
          ...dm,
          left: dm.left - (speed / 60),
        })).filter((dm) => dm.left > -200)
      );
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, isPaused, speed]);

  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const sendDanmu = () => {
    const content = message.trim().slice(0, 25);
    if (!content) return;

    const now = Date.now();
    const newDanmu: Danmu = {
      content: escapeHtml(content),
      color: colors[Math.floor(Math.random() * colors.length)],
      id: Date.now(),
      top: Math.random() * 300,
      left: 100,
    };

    setDanmuList((prev) => [...prev, newDanmu]);
    setMessage('');
    inputRef.current?.focus();
    lastDanmu.current = { content, time: now };
  };

  const increaseSpeed = () => {
    setSpeed((prev) => Math.min(prev + 20, maxSpeed));
  };

  const decreaseSpeed = () => {
    setSpeed((prev) => Math.max(prev - 20, minSpeed));
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
    setForceUpdateKey((prev) => prev + 1);
  };

  return (
    <div
      className="board"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <div className="message-form">
        <div className="message-form__content">
          <Input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={25}
            autoComplete="off"
            placeholder="留下点什么吧，最多25个字～"
            onPressEnter={sendDanmu}
            style={{
              padding: '8px 12px',
              border: '1px solid transparent',
              borderRadius: '20px',
              marginRight: '10px',
              width: '300px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
            }}
          />
          <Button type="primary" onClick={sendDanmu} disabled={!message.trim()}>
            发射
          </Button>
        </div>
        <div className="control">
          <div className="control">
            <Button type="primary" onClick={togglePause}>
              {isPaused ? '继续' : '暂停'}
            </Button>
            <Button type="primary" onClick={increaseSpeed} disabled={speed >= maxSpeed}>
              加速
            </Button>
            <Button type="primary" onClick={decreaseSpeed} disabled={speed <= minSpeed}>
              减速
            </Button>
            <Button type="primary" onClick={toggleVisibility}>
              {isVisible ? '隐藏' : '显示'}
            </Button>
          </div>
        </div>
      </div>
      {isVisible && (
        <div className="baberrage" ref={baberrageRef} key={forceUpdateKey}>
          <div className="danmaku">
            {danmuList.map((danmu) => (
              <div
                key={danmu.id}
                className="danmaku-item"
                style={{
                  position: 'absolute',
                  top: `${danmu.top}px`,
                  left: `${danmu.left}%`,
                  color: danmu.color,
                }}
              >
                <span className="bullet-item" style={{ color: danmu.color }}>
                  {danmu.content}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBoard;
