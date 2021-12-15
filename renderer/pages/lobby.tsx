import React, {
  useEffect,
  useContext,
  useState,
  RefObject,
  useRef,
} from 'react';
import { Context } from '../context';
import { auth, db } from '../utils/firebase';
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
import Chat from '../components/Chat';

function Lobby() {
  const router = useRouter();
  const { setEmail, setPassword } = useContext(Context);

  const [user, setUser] = useState<any>({}); //로그인한 유저 정보

  const [users, setUsers] = useState<any[]>([]); //유저 목록(로그인한 유저를 제외한)
  const [chat, setChat] = useState<any>(''); // 유저 목록에서 선택한 유저 정보
  const [inputText, setInputText] = useState<any>(''); // 현재 작성중인 텍스트 공간
  const [msgs, setMsgs] = useState<any[]>([]); // 메신저

  const contents: RefObject<HTMLDivElement> = useRef();

  useEffect(() => {
    setEmail('');
    setPassword('');

    if (!auth.currentUser) {
      router.push('/home'); //권한이 없는 유저일경우 로그인창으로 이동
    } else {
      //초기화 후 유저 유저 목록 리스트 onSnapshot을 이용하여 실시간으로 가져온다
      init();
      // 나를 제외한 모든 유저 정보 가져오기
      const userRef = collection(db, 'users');
      const userInfo = query(
        userRef,
        where('uid', 'not-in', [auth.currentUser.uid])
      );
      //onSnapshot 실시간 데이터베이스 접근
      const unsub = onSnapshot(userInfo, (querySnapshot) => {
        let users = [];
        querySnapshot.forEach((doc) => {
          users.push(doc.data());
        });
        setUsers(users);
      });
      // 함수로 리턴한 이유는 onSnapshot은 DB데이터들을 계속 찾는데 onSnapshot반환값이 멈춰 주는 함수를 반환하기에
      // 함수로 리턴하였습니다.
      return () => unsub();
    }
  }, []);

  useEffect(() => {
    //msgs값이 변동이 있을때마다 스크롤 이동효과
    contents.current &&
      contents.current.scrollTo({
        top: contents.current.scrollHeight,
        behavior: 'smooth',
      });
  }, [msgs]);

  const selectUser = async (user) => {
    setChat(user);

    const myself = auth.currentUser.uid; //로그인한 나의 uid
    const partner = user.uid; // 선택한 유저의 uid

    //상대방과 채팅하기위한 고유 id를 지정하여 방을 생성
    const id = myself > partner ? `${myself + partner}` : `${partner + myself}`;

    //DB의 messages 생성 필드 id에 대한 chat을 생성
    const msgRef = collection(db, 'messages', id, 'chat');
    const dateQuery = query(msgRef, orderBy('createdAt', 'asc')); //최신 메시지 오름차순 정렬

    //오름차순으로 정렬된 msgs를 DB의 msgs상태관리에 저장
    onSnapshot(dateQuery, (querySnapshot) => {
      let msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push(doc.data());
      });
      setMsgs(msgs);
    });

    //마지막 메시지를 보내 읽었는지 안 읽었는지 확인하여 선택했을때 읽음 으로 표시
    const docSnap = await getDoc(doc(db, 'lastMsg', id));

    if (docSnap.data() === undefined) return; //신규 유저일 경우 lastMsg 테이블에 값이 없기때문에 빠져나오는 곳
    if (docSnap.data().from !== myself) {
      await updateDoc(doc(db, 'lastMsg', id), { unread: false });
    }
  };

  const sendChatMessage = async () => {
    //아무런 입력값이 없는 빈 내용일때
    if (!inputText.trim()) {
      alert('내용을 입력하세요');
      setInputText('');
      return;
    }
    const myself = auth.currentUser.uid; //로그인한 유저
    const partner = chat.uid; //선택한 유저
    const id = myself > partner ? `${myself + partner}` : `${partner + myself}`; //고유 id값 부여

    //chat 테이블에 데이터 생성
    await addDoc(collection(db, 'messages', id, 'chat'), {
      inputText,
      from: myself,
      name: user.get('name'),
      to: partner,
      createdAt: Timestamp.fromDate(new Date()),
    });
    //lastMsg 테이블에 데이터 생성
    await setDoc(doc(db, 'lastMsg', id), {
      inputText,
      from: myself,
      name: user.get('name'),
      to: partner,
      createdAt: Timestamp.fromDate(new Date()),
      unread: true,
    });

    await setInputText('');
  };

  //isOnline 상태값 변경과 signOut함수를 이용하여 권한 제거 후 페이지이동
  const handleSignout = async () => {
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      isOnline: false,
    });
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
                  myself={auth.currentUser.uid}
                  chat={chat}
                />
              ))}
            </div>

            <div className="chat-container">
              <div ref={contents} className="chat-contents">
                {msgs.map((user, i) => (
                  <Chat key={i} user={user} myself={auth.currentUser.uid} />
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
  myself: any;
  from: string;
  inputText: string;
};

export default Lobby;
