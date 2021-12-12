import React, {
  useEffect,
  useContext,
  useState,
  RefObject,
  useRef,
} from 'react';
import { Context } from '../context';
import { auth, db } from '../utils/firebase';
import { signOut } from 'firebase/auth';
import {
  updateDoc,
  collection,
  doc,
  where,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
  addDoc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import User from '../components/User';

function Lobby() {
  const router = useRouter();
  const { setEmail, setPassword } = useContext(Context);

  const [user, setUser] = useState<any>({});

  const [users, setUsers] = useState<any[]>([]);
  const [chat, setChat] = useState<any>('');
  const [inputText, setInputText] = useState<any>('');
  const [msgs, setMsgs] = useState<any[]>([]);

  const contents: RefObject<HTMLDivElement> = useRef();

  useEffect(() => {
    setEmail('');
    setPassword('');
    console.log(auth.currentUser);
    if (!auth.currentUser) {
      router.push('/home');
    } else {
      init();

      const userRef = collection(db, 'users');
      const q = query(userRef, where('uid', 'not-in', [auth.currentUser.uid]));
      const unsub = onSnapshot(q, (querySnapshot) => {
        let users = [];
        querySnapshot.forEach((doc) => {
          users.push(doc.data());
        });
        setUsers(users);
      });
      return () => unsub();
    }
    console.log('user', user);
  }, []);

  useEffect(() => {
    contents.current &&
      contents.current.scrollTo({
        top: contents.current.scrollHeight,
        behavior: 'smooth',
      });
  }, [msgs]);

  const selectUser = async (user) => {
    setChat(user);
    console.log(user);

    const user1 = auth.currentUser.uid;
    const user2 = user.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    const msgRef = collection(db, 'messages', id, 'chat');
    const q = query(msgRef, orderBy('createdAt', 'asc'));

    onSnapshot(q, (querySnapshot) => {
      let msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push(doc.data());
      });
      setMsgs(msgs);
    });
    const docSnap = await getDoc(doc(db, 'lastMsg', id));
    // if (docSnap.data().from !== user1) {
    await updateDoc(doc(db, 'lastMsg', id), { unread: false });
    // }
  };

  console.log(msgs);

  const sendChatMessage = async () => {
    const user1 = auth.currentUser.uid;
    const user2 = chat.uid;
    // messages => id => chat => add doc
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
    await addDoc(collection(db, 'messages', id, 'chat'), {
      inputText,
      from: user1,
      name: user.get('name'),
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
    });

    await setDoc(doc(db, 'lastMsg', id), {
      inputText,
      from: user1,
      name: user.get('name'),
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      unread: true,
    });
    await setInputText('');

    if (!inputText.trim()) {
      alert('내용을 입력하세요');
      setInputText('');
      return;
    }
  };

  const handleSignout = async () => {
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      isOnline: false,
    });
    await signOut(auth);
    router.push('/home');
  };

  // 로비 초기화
  const init = async () => {
    setUser(await getLoggedInUser());
  };

  // 로그인 사용자 정보 가져오기
  const getLoggedInUser = async () => {
    return await getDoc(doc(db, 'users', auth.currentUser.uid));
  };

  return (
    <div className="background">
      <div className="lobby-head">
        <h1>chats - {chat?.name || '채팅방을 선택해주세요'}</h1>
        <button className="btn" onClick={handleSignout}>
          Logout
        </button>
      </div>

      {auth.currentUser ? (
        <React.Fragment>
          <div className="lobby-container">
            <div className="user-container">
              {users.map((user, i) => (
                <User
                  key={i}
                  user={user}
                  selectUser={selectUser}
                  user1={auth.currentUser.uid}
                  chat={chat}
                />
              ))}
            </div>

            <div className="chat-container">
              <div ref={contents} className="chat-contents">
                {msgs.map((x, i) => (
                  <div
                    key={i}
                    className={
                      x.from === auth.currentUser.uid
                        ? 'chat-container-item own'
                        : 'chat-container-item'
                    }
                  >
                    <div className="chat-container-item__author">{x.name}</div>
                    <div
                      className={
                        x.from === auth.currentUser.uid
                          ? 'chat-container-item__text me'
                          : 'chat-container-item__text friend'
                      }
                    >
                      {x.inputText}
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <input
                  value={inputText}
                  placeholder="Enter Message"
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyUp={(e) => {
                    if (e.keyCode === 13) {
                      sendChatMessage();
                    }
                  }}
                />
                <button onClick={sendChatMessage}>Send</button>
              </div>
            </div>
          </div>
        </React.Fragment>
      ) : (
        <p>유효한 사용자가 아닙니다.</p>
      )}
    </div>
  );
}
export type UserType = {
  uid: string;
  id: number;
  name: string;
  isOnline: boolean;
  user1: any;
};

export default Lobby;
