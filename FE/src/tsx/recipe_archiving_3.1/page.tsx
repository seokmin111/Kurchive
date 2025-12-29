"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import axios from "axios";
import { Link } from "react-router-dom";

export default function MainPage() {
	const [preview, setPreview] = useState<string | null>(null); // 대표 사진
	const [recipes, setRecipes] = useState<{ img: string | null; text: string }[]>([
		{ img: null, text: "" }
	]); // 레시피 배열
	const [recipeCategory,setRecipeCategory] = useState<number[]>([1,1,1])
	const [testData,setTestData] = useState(null)


	// 대표 사진 선택 핸들러
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setPreview(URL.createObjectURL(file));
		}
	};

	// 레시피 이미지 선택 핸들러
	const handleRecipeImageChange = (
		index: number,
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			const url = URL.createObjectURL(file);
			const newRecipes = [...recipes];
			newRecipes[index].img = url;
			setRecipes(newRecipes);
		}
	};

	// 레시피 텍스트 변경 핸들러
	const handleRecipeTextChange = (
		index: number,
		e: React.ChangeEvent<HTMLTextAreaElement>
	) => {
		const newRecipes = [...recipes];
		newRecipes[index].text = e.target.value;
		setRecipes(newRecipes);
	};

	// 레시피 추가 버튼
	const addRecipe = () => {
		setRecipes([...recipes, { img: null, text: "" }]);
	};

	//재료 카테고리 추가 버튼
	const addCategory = () => {
		let copy = [...recipeCategory,1]
		setRecipeCategory(copy)
	}

	
	
	return (

		<main className={styles.main}>
			<div>{testData}</div>
			<form action="#" method="get" className={`${styles.form} recipes-form`}>
				<div className={styles.btnCarrier}>
				{/*돌아가기 버튼*/}
				<Link to="/recipe" className={styles.returnBtn}>&lt;</Link>

				{/* 완료 버튼 */}
				<button type="submit" className={styles.submitButton}>완료</button>
				</div>

				{/* 음식 이름 */}
				<div className={styles.center}>
					<input type = "text" className = {styles.nameBox} placeholder = "음식 이름을 입력해주세요"/>
				</div>

				{/* 대표 사진 업로드 */}
				<div className={styles.container}>
					<div className = {styles.uploadContainer}>
						<input
							id = 'leadImage'
							type="file"
							accept="image/*"
							onChange={handleImageChange}
							style = {{display: 'none'}}
						/>
						<label htmlFor="leadImage" className={styles.uploadLabel}>
							대표 사진<br/>+
						</label>
						{preview && (
							<Image 
								src={preview}
								alt="대표 사진 미리보기"
								className={styles.preview}
								width = {0}
								height = {0}
								sizes = "100vw" 
							/>
						)}
					</div>
					<textarea
					placeholder="음식 설명을 입력해주세요."
					className={styles.description}
					/>
				</div>
				
				{/* 재료 카테고리명 입력 */}
				<div className={styles.category_container}>
					<h4>재료 카테고리명 입력</h4>
					<div className={styles.underbar}></div>
					<div className={styles.underbar}></div>
					{
						recipeCategory.map(()=>{
							return(
								<div className={styles.category}>
									<input type="text" placeholder="재료 입력/선택" className={styles.category__item}></input>
									<input type="text" placeholder="숫자 입력" className={styles.category__item}></input>
									<select className={styles.category__item}>
										<option>단위</option>
										<option>g</option>
										<option>kg</option>
										<option>ml</option>
										<option>L</option>
									</select>
								</div>
							)
						})
					}
					<div className={styles.underbar}></div>
					<button className={styles.categoryPlus} type="button" onClick={addCategory}>+</button>
					<div className={styles.underbar}></div>
					<div className={styles.underbar}></div>
				</div>

				<h4>{testData}</h4>

				{/* 레시피 입력 영역 */}
				<div className={styles.recipeBlock}> 
					{recipes.map((recipe, index) => (
						<div key={index} className={styles.recipeContainer}>
							<div className={styles.recipeNum}><span>{index+1}</span></div>
							<div className={styles.recipeLabel}>
							<input
								type="file"
								accept="image/*"
								onChange={(e) => handleRecipeImageChange(index, e)}
								className={styles.recipeImg}
								id="file"
							/>
							<label for="file">사진 업로드</label>
							<div>+</div>
							</div>
							{recipe.img && (
								<Image
									src={recipe.img}
									alt={`레시피 ${index + 1} 미리보기`}
									className={styles.preview}
								/>
							)}
							<textarea
								value={recipe.text}
								onChange={(e) => handleRecipeTextChange(index, e)}
								placeholder="레시피 입력:"
								className={styles.recipeDescription}
							/>
						</div>
					))}
				</div>
				<button
						type="button"
						onClick={addRecipe}
						className={styles.categoryPlus}
					>
						+
					</button>
			</form>
		</main>
	);
}
