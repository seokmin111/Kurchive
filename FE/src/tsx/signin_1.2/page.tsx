"use client";

import { useState,useEffect } from "react";
import style from "./page.module.css";
import logo from "../../assets/logo.png"
import axios from "axios";

export default function SignIn() {

  const [name,setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [pw2,setPw2] = useState(""); //비밀번호 재확인
  const [pwAlert,setPwAlert] = useState("");
  const [code,setCode] = useState("");
  const [signupData,setSignupData] = useState({
    userid: "",
    pw: "",
    pwConfirm: "",
    nickname: "",
    name: "",
    code: ""
  })

  //비밀번호 재검 함수
  const HandlePwDif = () => {
    if (pw!="" && pw2!=""){
      if(pw != pw2){
        setPwAlert("비밀번호가 일치하지 않습니다")
        setSignupData(prev => ({
          ...prev,
          pw: "",
          pwConfirm: ""
        }))
      }
      else{
        setPwAlert("비밀번호가 일치합니다")
        setSignupData(prev => ({
          ...prev,
          pw: pw,
          pwConfirm: pw
        }))}
    }
  }

  //닉네임 중복 검사 함수
  const HandleNicknameDuplicate = () => {
    
    axios.get(`http://152.69.228.114:8000/api/check_nickname?nickname=${nickname}`)
    .then((res)=>{
      const duplicate = res.data.isDuplicate;
      if(duplicate == false){
      setSignupData(prev => ({
      ...prev,
      nickname: nickname
    }));
    } 
      else{
        alert("이미 사용중인 닉네임입니다.")
      }
    })
  }

  //아이디 중복 검사 함수
  const HandleIdDuplicate = () => {

    axios.get(`http://152.69.228.114:8000/api/signup/check_id?userid=${id}`)
    .then((res) =>{
      const duplicate = res.data.isDuplicate;
      if(duplicate == false){
      setSignupData(prev => ({
      ...prev,
      userid: id
    }));
    } 
      else{
        alert("이미 사용중인 아이디입니다.")
      }
    })
  }

  //회원코드 검사함수
  const HandleCode = () =>{
    axios.post("http://152.69.228.114:8000/api/validate_code",{code:code})
    .then((res)=>{
      if(res.data.status == "valid"){
        setSignupData(prev => ({
        ...prev,
        code: code
    }))}
    else{
      alert("부적절한 코드입니다.")
    }
    })
  }
  
  //submit 함수
  const HandleSubmit = (e) => {
  e.preventDefault(); 
  
  if (!signupData.userid || !signupData.pw || !signupData.code) {
    alert("모든 중복 확인 및 코드 검증을 완료해주세요.");
    return;
  }

  axios.post("http://152.69.228.114:8000/api/signup", signupData)
    .then(res => alert("회원가입 성공!"))
    .catch(err => alert("회원가입 실패: " + err.response?.data?.message));
  };


  useEffect(()=>{HandlePwDif()},[pw2])
  useEffect(()=>{HandlePwDif()},[pw])
  useEffect(()=>{console.log(signupData),[signupData]})
    
    return (
      
      <div className={style.container}>
        <header className={style.header}>베너 이미지</header>
        <main className={style.main}>
          <div className={style.logoGroup}>
            <img className={style.logo} src={logo} alt="logo" />
             <div className={style.brandName}>커카이브</div>
             <div className={style.pageTitle}>회원가입</div>
          </div>
        <form className={style.loginForm}>

                  <div className={style.inputGroup}>
                    <label htmlFor="이름">Name</label>
                    <input
                      type="text"
                      id="Name"
                      name="Name"
                      placeholder="이름 입력"
                      required
                      onChange={(e)=>{setSignupData(
                        prev => ({
                        ...prev,
                        name: e.target.value
                      })
                      )}}
                    />
                  </div>

                  <div className={style.inputGroup}>
                    <label htmlFor="닉네임">Nickname</label>
                    <input
                      type="text"
                      id="nickname"
                      name="nickname"
                      placeholder="닉네임 입력"
                      required
                      onChange={(e)=>{setNickname(e.target.value)}}
                    />
                  <button type="button" onClick={HandleNicknameDuplicate}>닉네임 중복 확인</button>
                  </div>

                  <div className={style.inputGroup}>
                    <label htmlFor="id">ID</label>
                    <input
                      type="text"
                      id="id"
                      name="id"
                      placeholder="ID 입력"
                      required
                      value={id}
                      onChange={(e) => {setId(e.target.value)
                                        
                      }}
                    />
                  <button type="button" onClick={HandleIdDuplicate}>ID 중복 확인</button>
                  </div>
        
                  <div className={style.inputGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="비밀번호 입력"
                      required
                      value={pw}
                      onChange={(e) => {setPw(e.target.value)
                                        }
                                } 
                    />
                  </div>
                  <div className={`${style.inputGroup} ${style.lastGroup}`}>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="비밀번호 재입력"
                      required
                      onChange={(e) => setPw2(e.target.value)}
                    />
                    <div className={style.pw_alert}>{pwAlert}</div>
                  </div>
                  <div className={style.codeTitle}>커손연 회원코드 입력하기</div>
                  <input type="text" className={style.codeBox} required onChange={(e)=>{setCode(e.target.value)}}></input>
                  <button type="button" className={style.codeCheck} onClick={HandleCode}>회원코드 확인</button>
                  <button type="submit" className={style.submit} onClick={HandleSubmit}>회원가입</button>
                </form>
        </main>

      </div>
    )
  
  
  
}
