"use client";
import { useState, useEffect } from "react";
import styles from './page.module.css';
import { getFoodParents, getFoodChildren } from "../../api/tags";
import { getRegionParents, getRegionChildren } from "../../api/regions";

export default function RestaurantFormPage() {

  // 🔵 1) 여기에 상태 선언
  const [foodParents, setFoodParents] = useState([]);
  const [foodChildren, setFoodChildren] = useState({});
  const [openedFood, setOpenedFood] = useState(null);

  const [regionParents, setRegionParents] = useState([]);
  const [regionChildren, setRegionChildren] = useState({});
  const [openedRegion, setOpenedRegion] = useState(null);

  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // 🔵 2) 여기에 API 호출 (useEffect)
  useEffect(() => {
    getFoodParents().then(res => setFoodParents(res.data));
    getRegionParents().then(res => setRegionParents(res.data));
  }, []);

  useEffect(()=>{console.log(foodParents)},[foodParents])

  // 🔵 3) 👉 여기 handleFoodParentClick (4번 내용)
  const handleFoodParentClick = async (parentId: number) => {
    if (openedFood === parentId) {
      setOpenedFood(null);
      return;
    }

    setOpenedFood(parentId);

    if (!foodChildren[parentId]) {
      const res = await getFoodChildren(parentId);
      setFoodChildren(prev => ({ ...prev, [parentId]: res.data }));
    }
  };

  const handleRegionParentClick = async (parentId: number) => {
    if (openedRegion === parentId) {
      setOpenedRegion(null);
      return;
    }

    setOpenedRegion(parentId);

    if (!regionChildren[parentId]) {
      const res = await getRegionChildren(parentId);
      setRegionChildren(prev => ({ ...prev, [parentId]: res.data }));
    }
  };

  const toggleTag = (id: number) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 🔵 4) return 안에서 👉 음식/지역 렌더링 (5번 내용)
  return (
    <div className={styles.page}>

      {/* 음식 태그 렌더링 */}
      <section>
        <h3>음식 종류</h3>

        {foodParents.map(parent => (
          <div key={parent.id}>
            <button onClick={() => handleFoodParentClick(parent.id)}>
              {parent.name}
            </button>

            {openedFood === parent.id && (
              <div className={styles.childGrid}>
                {(foodChildren[parent.id] || []).map(child => (
                  <button
                    key={child.id}
                    onClick={() => toggleTag(child.id)}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* 지역 태그 렌더링 */}
      <section>
        <h3>지역</h3>

        {regionParents.map(parent => (
          <div key={parent.id}>
            <button onClick={() => handleRegionParentClick(parent.id)}>
              {parent.name}
            </button>

            {openedRegion === parent.id && (
              <div className={styles.childGrid}>
                {(regionChildren[parent.id] || []).map(child => (
                  <button
                    key={child.id}
                    onClick={() => toggleTag(child.id)}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

    </div>
  );
}
