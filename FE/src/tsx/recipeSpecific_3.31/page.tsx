"use client";

import { useState,useEffect } from "react";
import style from "./page.module.css";
import logo from "../../assets/logo.png"
import axios from "axios";

export default function RecipeSpecific() {
  
    const [breadRecipe,setBreadRecipe] = useState({
  "id": 1,
  "title": "맛있는빵",
  "base_serving": 2,
  "uploader_id": 1,
  "created_at": "2025-11-25T10:28:09",
  "thumbnail_url": "",
  "steps": [
    {
      "step_order": 3,
      "description": "string",
      "image_urls": []
    }
  ],
  "ingredients": [
    {
      "ingredient_id": 2,
      "name": "굴소스",
      "quantity": 3.5,
      "unit_name": "개"
    }
  ]
})

    return (
      
      <div className={style.container}>
        <div className={style.banner}>
          <img src="../../public/backstep_white_background.png" className={style.backstep}></img>
          <button className={style.modifyBtn}>수정하기</button>
        </div>
        <div className={style.foodTitle}>{breadRecipe.title}</div>
        <div className={style.foodDescription}>음식 설명</div>
        <div className={style.portionBody}>
          <div>기준 인분: {breadRecipe.base_serving}인분</div>
          <button>변경하기</button>
        </div>

        <div className={style.line}></div>
        <div className={style.line}></div>

        <div className={style.ingredientBody}>
          <div className={style.ingredientTitle}>재료</div>
          <table className={style.table}>
            <thead>
              <tr>
                <th>재료</th>
                <th>숫자</th>
                <th>단위</th>
              </tr>
            </thead>
            <tbody>
              {
                breadRecipe.ingredients.map((item)=>{
                  return(
                    <tr>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unit_name}</td>
                    </tr>
                  )
                })
              }
            </tbody>
        </table>
      </div>


        <div className={style.line}></div>
        <div className={style.line}></div>
        <div className={style.recipeTitle}>레시피</div>

        {/*레시피*/}
        <div className={style.recipeBody}>
          {
            [1,2,3,4].map((item)=>{
              return(
                <div className={style.recipeItem}>
                  <div className={style.photoBox}>
                    <div className={style.number}>{item}</div>
                  </div>
                  <div className={style.textBox}></div>
                </div>
              )
            })
            
          }
        </div>

        <div className={style.line}></div>
        <div className={style.line}></div>
        <button className={style.recipeDelete}>레시피 삭제하기</button>
      </div>
    )
  
  
  
}
