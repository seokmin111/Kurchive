'use client';

import { useState } from 'react';
import styles from './page.module.css';

// 타입 정의
interface Restaurant {
  id: number;
  name: string;
  location: string;
  rating: number;
  memo?: string;
  hasImage: boolean;
  imageUrl?: string;
  photoCount?: number;
}

// 샘플 데이터
const sampleRestaurants: Restaurant[] = [
  {
    id: 1,
    name: '식당 이름',
    location: '한 줄 설명 ...........',
    rating: 5,
    memo: '나중에 가볼 것 :)',
    hasImage: false,
  },
  {
    id: 2,
    name: '식당 이름',
    location: '한 줄 설명 ...........',
    rating: 4,
    hasImage: false,
  },
  {
    id: 3,
    name: '식당 이름',
    location: '한 줄 설명 ...........',
    rating: 3,
    hasImage: true,
    photoCount: 2,
  },
];

// 별점 컴포넌트
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? styles.star : styles.starEmpty}
        >
          ★
        </span>
      ))}
    </div>
  );
};

// 식당 카드 컴포넌트
const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  return (
    <div className={styles.restaurantCard}>
      <div className={styles.cardContent}>
        <h3 className={styles.restaurantName}>{restaurant.name}</h3>
        <p className={styles.restaurantLocation}>{restaurant.location}</p>
        <StarRating rating={restaurant.rating} />
        {restaurant.memo && (
          <div className={styles.memoContainer}>
            <span className={styles.memoIcon}>📝</span>
            <span className={styles.memoText}>{restaurant.memo}</span>
          </div>
        )}
      </div>
      <div
        className={`${styles.cardImage} ${restaurant.hasImage ? styles.cardImageWithPhoto : ''}`}
        style={restaurant.imageUrl ? { backgroundImage: `url(${restaurant.imageUrl})` } : {}}
      >
        <button className={styles.deleteButton}>✕</button>
        {!restaurant.hasImage && (
          <div className={styles.imagePlaceholder}>
            <span className={styles.imageIcon}>🖼</span>
          </div>
        )}
        {restaurant.hasImage && restaurant.photoCount && (
          <span className={styles.imageOverlay}>포토리뷰 +{restaurant.photoCount}개</span>
        )}
      </div>
    </div>
  );
};

export default function RestaurantArchivePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const username = '나래원';

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton}>{'<'}</button>
          <div className={styles.logoSection}>
            <span className={styles.logoSubtitle}>우리만의 미식 지도</span>
            <span className={styles.logo}>커카이브</span>
          </div>
        </div>
        <button className={styles.myPageButton}>마이페이지</button>
      </header>

      {/* 페이지 제목 */}
      <div className={styles.pageTitle}>
        <span className={styles.username}>{username}</span> 의 식당 아카이브
      </div>

      {/* 검색바 */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="즐겨찾기 내 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      </div>

      {/* 필터 */}
      <div className={styles.filterSection}>
        <span className={styles.filterLabel}>
          식당 아카이브에서<br />빨리 찾아보기!
        </span>
        <button className={styles.filterDropdown}>
          지역 <span>▼</span>
        </button>
        <button className={styles.filterDropdown}>
          음식 종류 <span>▼</span>
        </button>
      </div>

      {/* 식당 리스트 */}
      <div className={styles.restaurantList}>
        {sampleRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}