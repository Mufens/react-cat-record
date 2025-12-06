import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, Avatar, Input, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { MessageItem } from '@/components/cardList';
import { useAppSelector } from '@/store/hooks';
import './CardDetail.scss';

interface CardDetailProps {
  visible: boolean;
  item: MessageItem | null;
  onClose: () => void;
  onUpdate?: (item: MessageItem) => void;
}

const CardDetail: React.FC<CardDetailProps> = ({ visible, item, onUpdate, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [showButtons, setShowButtons] = useState(false);
  const [replyTarget, setReplyTarget] = useState<{
    commentIndex?: number;
    replyIndex?: number;
    replyUser?: string;
    replyContent?: string;
    isReplyToReply?: boolean;
  } | null>(null);
  const commentInputRef = useRef<any>(null);
  const { user } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!visible) {
      setCurrentImageIndex(0);
      setCommentInput('');
      setShowButtons(false);
      setReplyTarget(null);
    }
  }, [visible]);

  const dialogHeight = useMemo(() => {
    if (!item?.ratio) return '380px';
    const [w, h] = item.ratio.split('/').map(Number);
    return w / h === 3 / 4 ? '500px' : w / h === 1 ? '400px' : `${Math.min(600, (400 * h) / w)}px`;
  }, [item?.ratio]);

  const images = useMemo(() => {
    if (!item) return [];
    return Array.isArray(item.pictures) ? item.pictures : [item.pictures];
  }, [item]);

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const nextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const totalComments = useMemo(() => {
    if (!item?.comment || item.comment.length === 0) return 0;
    return item.comment.reduce((acc, comment) => {
      return acc + 1 + (comment.replies?.length || 0);
    }, 0);
  }, [item?.comment]);

  const sendComment = () => {
    if (!commentInput.trim() || !item) return;

    const newComment = {
      id: Date.now(),
      avatar: user?.avatar || '',
      user: user?.name || '匿名用户',
      content: commentInput.trim(),
      time: new Date().toISOString().split('T')[0] + ' ',
    };

    if (replyTarget) {
      const updatedComments = [...(item.comment || [])];
      const targetComment = updatedComments[replyTarget.commentIndex!];
      if (targetComment) {
        const contentPrefix = replyTarget.isReplyToReply ? `回复 @${replyTarget.replyUser}：` : '';
        const newReply = {
          ...newComment,
          content: contentPrefix + commentInput.trim(),
        };
        targetComment.replies = [...(targetComment.replies || []), newReply];
        const updatedItem = { ...item, comment: updatedComments };
        onUpdate?.(updatedItem);
      }
    } else {
      const updatedItem = { ...item, comment: [newComment, ...(item.comment || [])] };
      onUpdate?.(updatedItem);
    }

    setCommentInput('');
    setReplyTarget(null);
    setShowButtons(false);
  };

  const handleInputFocus = () => {
    setShowButtons(true);
  };

  const cancelComment = () => {
    setCommentInput('');
    setReplyTarget(null);
    setShowButtons(false);
  };

  const handleReply = (commentIndex: number, replyUser: string, replyContent: string, isReplyToReply: boolean) => {
    setReplyTarget({
      commentIndex,
      replyUser,
      replyContent,
      isReplyToReply,
    });
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 0);
  };

  if (!item) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={820}
      className="card-detail-modal"
      closable={false}
      maskClosable
    >
      <div className="dialog" style={{ height: dialogHeight }}>
        <div className="left">
          <div className="image-container">
            <img
              src={images[currentImageIndex]}
              style={{ aspectRatio: item.ratio || '1' }}
              className="preview-image"
              alt={item.title}
            />
            {images.length > 1 && (
              <div className="change">
                {currentImageIndex > 0 && (
                  <div onClick={(e) => { e.stopPropagation(); prevImage(); }} className="change prev">
                    <LeftOutlined />
                  </div>
                )}
                {currentImageIndex < images.length - 1 && (
                  <div onClick={(e) => { e.stopPropagation(); nextImage(); }} className="change next">
                    <RightOutlined />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="right">
          <div className="right-inner">
            <div className="header">
              <Avatar src={item.avatar} size={45} />
              <span className="username">{item.author}</span>
            </div>

            <div className="comments-container">
              <div className="content-container">
                <div className="title">{item.title}</div>
                <div className="content">{item.content}</div>
                {item.time && <div className="time">{item.time}</div>}
              </div>
              <div className="comments-list">
                {totalComments > 0 ? (
                  <p className="judge">共{totalComments}条评论</p>
                ) : (
                  <div className="empty-comments">暂无评论，快来抢沙发~</div>
                )}

                {item.comment?.map((comment, index) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="avatar">
                        <Avatar src={comment.avatar} size={38} />
                      </div>
                      <div className="userinfo">
                        <span className="user">{comment.user}</span>
                        <p className="comment-content">{comment.content}</p>
                        <div className="huifu">
                          <div className="ctime">{comment.time}</div>
                          <div
                            className="rp"
                            onClick={() => handleReply(index, comment.user, comment.content, false)}
                          >
                            回复
                          </div>
                        </div>
                      </div>
                    </div>

                    {comment.replies?.map((reply, rIndex) => (
                      <div key={rIndex} className="reply-item">
                        <Avatar src={reply.avatar} size={26} />
                        <div className="reply-content">
                          <span className="replyUser">{reply.user}</span>
                          <p className="rc">{reply.content}</p>
                          <div className="huifu">
                            <div className="ctime">{reply.time}</div>
                            <div
                              className="rp"
                              onClick={() => handleReply(index, reply.user, reply.content, true)}
                            >
                              回复
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="comment-input">
              {replyTarget && (
                <div className="reply-prompt">
                  {replyTarget.isReplyToReply ? (
                    <>
                      回复<span className="reply-user">@{replyTarget.replyUser}</span>
                      <div className="reply-content">{replyTarget.replyContent}</div>
                    </>
                  ) : (
                    <>
                      回复 <span className="reply-user">@{replyTarget.replyUser}</span>
                      <div className="reply-content">{replyTarget.replyContent}</div>
                    </>
                  )}
                </div>
              )}
              <div className="custom-input-wrapper">
                <Input
                  ref={commentInputRef}
                  className="custom-input"
                  onFocus={handleInputFocus}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="说点什么..."
                  onPressEnter={sendComment}
                  onBlur={() => {
                    if (!commentInput.trim()) {
                      setShowButtons(false);
                    }
                  }}
                />
                {(showButtons || commentInput.trim()) && (
                  <div className="button-group">
                    <Button onClick={cancelComment}>取消</Button>
                    <Button
                      className="send-btn"
                      type="primary"
                      onClick={sendComment}
                      disabled={!commentInput.trim()}
                    >
                      {replyTarget ? '回复' : '发送'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CardDetail;
