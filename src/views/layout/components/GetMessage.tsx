import React, { useState, useEffect, useRef } from 'react';
import { Tabs, Badge, Avatar } from 'antd';
import avatar4 from '@/assets/images/avatar/avatar4.jpg';
import avatar2 from '@/assets/images/avatar/avatar2.jpg';
import avatar3 from '@/assets/images/avatar/avatar3.jpg';
import './GetMessage.scss';

interface Message {
  user: string;
  content: string;
  time: string;
  avatar: string;
}

interface Notification {
  title: string;
  content: string;
  time: string;
}

interface Todo {
  task: string;
  status: string;
  time: string;
}

const GetMessage: React.FC = () => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isdot, setIsdot] = useState(true);
  const [messagesRead, setMessagesRead] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [todosRead, setTodosRead] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const messageData = {
    messages: [
      {
        user: '豚鼠',
        content: '早上好，这是今天的工作安排：中午十二点去E教诱捕让大宝乖乖的去医院',
        time: '今天8:57:06',
        avatar: avatar4,
      },
      {
        user: '豚鼠',
        content: '今天的工作辛苦了><',
        time: '昨天22:33:59',
        avatar: avatar4,
      },
      {
        user: 'xxbb 的回复',
        content: '绝育安排到周六',
        time: '昨天12:30:01',
        avatar: avatar2,
      },
      {
        user: '潇洒 的评论',
        content: '怎么会有这么可爱的小猫咪,没有小猫咪世界都不能转,就让我狠狠rua一下吧(暴风吸入)',
        time: '昨天 12:20:01',
        avatar: avatar3,
      },
    ] as Message[],
    notifications: [
      { title: '系统维护通知', content: '本周六凌晨进行系统升级维护', time: '今天 09:00:00' },
      { title: '权限变更通知', content: '您的账号权限已更新', time: '昨天 18:30:00' },
    ] as Notification[],
    todos: [{ task: '报销审批', status: '待处理', time: '今天 10:00:00' }] as Todo[],
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dialogVisible &&
      panelRef.current &&
      !panelRef.current.contains(event.target as Node) &&
      !iconRef.current?.contains(event.target as Node)
    ) {
      setDialogVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dialogVisible]);

  const markAllAsRead = () => {
    setIsdot(false);
    setMessagesRead(true);
    setNotificationsRead(true);
    setTodosRead(true);
    setDialogVisible(false);
  };

  const items = [
    {
      key: 'messages',
      label: messagesRead ? '消息' : `消息(${messageData.messages.length})`,
      children: (
        <div className="message-list">
          {messageData.messages.map((msg, index) => (
            <div key={index} className="message-item">
              <div className="avater">
                <Avatar src={msg.avatar} size={35} />
              </div>
              <div className="userinfo">
                <div className="user">{msg.user}</div>
                <div className="content">{msg.content}</div>
                <div className="time">{msg.time}</div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'notifications',
      label: notificationsRead ? '通知' : `通知(${messageData.notifications.length})`,
      children: (
        <div className="message-list">
          {messageData.notifications.map((noti, index) => (
            <div key={index} className="message-item">
              <div className="notinfo">
                <div className="title">【{noti.title}】</div>
                <div className="content">{noti.content}</div>
                <div className="time">{noti.time}</div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'todos',
      label: todosRead ? '待办' : `待办(${messageData.todos.length})`,
      children: (
        <div className="message-list">
          {messageData.todos.map((todo, index) => (
            <div key={index} className="message-item">
              <div className="task">{todo.task}</div>
              <div className="status">{todo.status}</div>
              <div className="time">{todo.time}</div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="message-container">
      <div
        className="message-icon"
        ref={iconRef}
        onClick={(e) => {
          e.stopPropagation();
          setDialogVisible(!dialogVisible);
        }}
      >
        {isdot ? (
          <Badge dot offset={[-5, 1]}>
            <i className="iconfont icon-xiaoxi1"></i>
          </Badge>
        ) : (
          <i className="iconfont icon-xiaoxi1"></i>
        )}
      </div>

      {dialogVisible && (
        <div
          className="message-panel"
          ref={panelRef}
          onClick={(e) => e.stopPropagation()}
        >
          <Tabs type="card" items={items} className="message-tabs" />
          <div className="panel-footer">
            <div className="read" onClick={markAllAsRead}>
              全部已读
            </div>
            <div className="more">查看更多</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetMessage;

