'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('로그인 시도:', { email, password });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        width: '100%',
        gap: '35.95px',
      }}
    >
      {/* 1. 상단 로고 & 타이틀 영역 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '100%',
          marginTop: '10px',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            marginBottom: '16px',
          }}
        >
          <Image
            src="/icons/logo.svg"
            alt="MixMate 로고"
            width={80}
            height={80}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            priority
          />
        </div>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: '700',
            lineHeight: '1.3',
            color: '#18181B',
            margin: '0 0 8px 0',
          }}
        >
          MixMate
        </h1>
        <p
          style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#52525B',
            margin: 0,
          }}
        >
          술자리 조 편성 서비스
        </p>
      </div>

      {/* 2. 입력 폼 영역 */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: '24px',
        }}
      >
        {/* 이메일 인풋 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label
            htmlFor="email"
            style={{
              fontSize: '15px',
              fontWeight: '500',
              color: '#52525B',
              paddingLeft: '4px',
            }}
          >
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" "
            required
            style={{
              width: '100%',
              height: '56px',
              padding: '0 24px',
              fontSize: '16px',
              color: '#18181B',
              backgroundColor: '#F7F9FC',
              borderStyle: 'solid',
              borderColor: '#B8C6D8',
              borderTopWidth: '2.57px',
              borderRightWidth: '2.57px',
              borderBottomWidth: '2.57px',
              borderLeftWidth: '7.7px',
              borderRadius: '25.68px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 비밀번호 인풋 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label
            htmlFor="password"
            style={{
              fontSize: '15px',
              fontWeight: '500',
              color: '#52525B',
              paddingLeft: '4px',
            }}
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=""
            required
            style={{
              width: '100%',
              height: '56px',
              padding: '0 24px',
              fontSize: '16px',
              color: '#18181B',
              backgroundColor: '#FBF8FC',
              borderStyle: 'solid',
              borderColor: '#C8BDD6',
              borderTopWidth: '2.57px',
              borderRightWidth: '2.57px',
              borderBottomWidth: '2.57px',
              borderLeftWidth: '7.7px',
              borderRadius: '25.68px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 로그인 버튼 */}
        <button
          type="submit"
          style={{
            width: '100%',
            height: '56px',
            backgroundColor: '#256AD3',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          로그인
        </button>

        {/* 구분선 */}
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: '#E4E4E7',
            margin: '8px 0',
          }}
        />

        {/* 회원가입 영역 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            width: '100%',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#52525B' }}>
            계정이 없나요?
          </span>

          <Link
            href="/signup"
            style={{
              width: '100%',
              height: '54px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFFFFF',
              color: '#3B82C4',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '16px',
              border: '1px solid #E4E4E7',
              textDecoration: 'none',
              boxSizing: 'border-box',
            }}
          >
            회원가입
          </Link>
        </div>
      </form>
    </div>
  );
}