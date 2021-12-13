import React from 'react';
import { UserType } from '../pages/lobby';

interface UserProps {
  user: UserType; // 부모컴포넌트에서 import 해온 타입을 재사용 해 줍시다.
  myself;
}

const Chat = ({ user, myself }: UserProps) => {
  return (
    <div
      key={user.id}
      className={
        user.from === myself ? 'chat-container-item own' : 'chat-container-item'
      }
    >
      <div className="chat-container-item__author">{user.name}</div>
      <div
        className={
          user.from === myself
            ? 'chat-container-item__text me'
            : 'chat-container-item__text friend'
        }
      >
        {user.inputText}
      </div>
    </div>
  );
};

export default Chat;
