import React, { useContext } from 'react';
import { Context } from '../context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../utils/firebase';
import { setDoc, doc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';

function SignUp() {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    setLoading,
  } = useContext(Context);
  const router = useRouter();
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (name.length === 0 || email.length === 0 || password.length === 0) {
      setLoading(false);
      return alert('이름,이메일,비빌번호를 다시 입력해주세요');
    }
    try {
      // 새롭게 이메일 인증 권한을 생성한다
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      //users테이블에 값을 저장
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        name,
        email,
        createAt: Timestamp.fromDate(new Date()),
        isOnline: true,
      });
      setLoading(false);
      router.push('/home');
    } catch (error) {
      if (error.message === 'Firebase: Error (auth/email-already-in-use).') {
        setLoading(false);
        alert('존재하는 이메일입니다.');
      }
      if (
        error.message ===
        'Firebase: Password should be at least 6 characters (auth/weak-password).'
      ) {
        setLoading(false);
        alert('비밀번호가 6글자 이상이여야 합니다.');
      }
    }
  };

  const loginPage = () => {
    router.push('/home');
  };

  return (
    <div className="background">
      <div className="auth-container sign">
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-title">SignUp</div>

          <div className="input-container">
            <input
              placeholder="Name"
              className="text-input"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
              placeholder="password는 6글자이상"
              className="text-input"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-button">
            {loading ? 'Sign Up...' : 'Sign Up'}
          </button>
          <div className="login-text" onClick={loginPage}>
            Go to Login
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
