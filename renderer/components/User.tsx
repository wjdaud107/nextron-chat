import React, { useEffect, useState } from 'react';
import { UserType } from '../pages/lobby';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';

interface UserProps {
  user: UserType; // 부모컴포넌트에서 import 해온 타입을 재사용 해 줍시다.
  selectUser: (UserType) => void;
  user1;
  chat;
}

const User = ({ user, selectUser, user1, chat }: UserProps) => {
  const user2 = user?.uid;
  const [data, setData] = useState<any>('');

  useEffect(() => {
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
    let unsub = onSnapshot(doc(db, 'lastMsg', id), (doc) => {
      setData(doc.data());
    });
    return () => unsub();
  }, []);

  return (
    <div
      className="room-container"
      onClick={() => selectUser(user)}
      draggable={true}
    >
      <div key={user.id} className="room-container-item">
        <div className="room-container-item__title">
          {user.name}
          {data?.from !== user1 && data?.unread && (
            <small className="unread">New</small>
          )}
        </div>
        <div
          className={
            user.isOnline
              ? 'room-container-item-online'
              : 'room-container-item-offline'
          }
        ></div>
      </div>
      {data.unread && (
        <p className="truncate">
          <strong>{data.from === user1 ? 'Me:' : null}</strong>
          <small>{data.inputText}</small>
        </p>
      )}
    </div>
  );
};

export default User;
