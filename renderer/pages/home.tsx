import React, { useContext } from 'react';
import { Context } from '../context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../utils/firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/router';

function Home() {
  const { email, setEmail, password, setPassword, loading, setLoading } =
    useContext(Context);

  const router = useRouter();
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (email.length === 0 || password.length === 0) {
      setLoading(false);
      return alert('이메일,비빌번호를 다시 입력해주세요');
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await updateDoc(doc(db, 'users', result.user.uid), {
        isOnline: true,
      });
      setLoading(false);
      router.push('/lobby');
    } catch (error) {
      setLoading(false);

      if (error.message === 'Firebase: Error (auth/wrong-password).') {
        return alert('비빌번호가 틀렸습니다.');
      }
      router.push('/signup');
    }
  };

  return (
    <div className="background">
      <div className="auth-container">
        <form className="auth-form" onSubmit={(e) => onSubmit(e)}>
          <div className="auth-title">Nextron Chat</div>

          <div className="input-container">
            <input
              placeholder="Email"
              className="text-input"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-container">
            <input
              type="password"
              placeholder="Password"
              className="text-input"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-button">
            {loading ? 'Logging in..' : 'Login / Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
