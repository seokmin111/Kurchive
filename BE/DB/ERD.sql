Table users {
  id int [pk, increment] // 시스템 ID
  userid varchar(50) [unique, not null] // 로그인 때 사용하는 ID
  password varchar(100)
  name varchar(20) // 이름
  nickname varchar(20)
  role enum('member', 'staff', 'admin') [default: 'member']
  created_at datetime
}

// 기능 단위 정리 테이블
Table permissions {
  id int [pk, increment]
  name varchar(50) [unique]
  description text // 권한 설명
}

// 각 역할(role) 에게 어떤 권한을 기본적으로 주는지 설정
Table role_permissions {
  id int [pk, increment]
  role enum('member', 'staff', 'admin')
  permission_id int [ref: > permissions.id]
  is_enabled boolean
}

//특정 사용자가 특정 권한을 가졌는지 여부를 명시적으로 기록한 테이블
Table user_permissions {
  id int [pk, increment] // 권한 id
  user_id int [ref: > users.id]
  permission_id int [ref: > permissions.id]
  is_enabled boolean
}

//커손연 코드
Table signup_code {
  id int [pk, increment]
  code varchar(20) [not null]         // 현재 사용 중인 코드
  is_active boolean [default: true]   // 현재 활성화된 코드인지 여부
  changed_by int [ref: > users.id]    // 변경한 관리자
  changed_at datetime                 // 변경 시각
}

// 식당 정보
Table restaurants {
  id int [pk, increment] // 식당에 부여되는 백엔드 자체 ID
  name varchar(50) // 식당 이름
  address varchar(100) // 지도 링크에서 추출한 주소
  location_link text // 지도 링크
  latitude decimal(10, 7) // 위도 (예: 37.1234567)
  longitude decimal(10, 7) // 경도 (예: 127.1234567)
  location_tag_id int [ref: > location_tags.id]  // 지역 태그
  uploaded_by int [ref: > users.id] // 업로더 사용자 ID
  rating float // 추천 정도
  summary varchar(150) // 한줄평
  description text // 후기, 긴 거
  price_min int // 최소 가격대
  price_max int // 최대 가격대
  created_at datetime
}

// 지역 태그
Table location_tags {
  id int [pk, increment]
  name varchar(50) [not null, unique]  // 예: "홍대/합정/마포"
  city varchar(20)                     // 대분류 예: "서울", "경기"
  sort_order int                      // UI 정렬용 (선택)
}


// 식당 태그
Table restaurant_tags {
  id int [pk, increment]
  restaurant_id int [ref: > restaurants.id]
  tag_type enum('category', 'mood', 'feature', 'custom')
  tag_value varchar(50)
}

// ------------------------------------------------------------
//레시피

// 재료 테이블
Table ingredients {
  id int [pk, increment]
  name varchar(100)                       //-- 예: 다진 마늘, 쪽파, 대파
  density float                           //-- g/ml (liquid, powder용), NULL 가능
  average_weight float                    //-- 개당 무게(g), count 단위용, NULL 가능
  unit_type enum('liquid', 'powder', 'vegetable', 'etc')
  // 주의: density와 average_weight 중 적어도 하나는 NULL이 아니어야 함
  category_id int [ref: > ingredient_categories.id, null]
}

// 부피 단위 테이블
Table volume_units {
  id int [pk, increment]
  name varchar(20) [unique, not null]   // "tsp", "tbsp", "cup", "ml"
  ml_per_unit float [not null]          // ex: tsp = 5.0
}

// 재료-단위 연결 테이블 (가능한 단위)
Table ingredient_units {
  id int [pk, increment]
  ingredient_id int [ref: > ingredients.id]    // 어떤 재료인지
  unit_name varchar(20) [not null]             // "개", "단", "g", "컵" 등
  unit_type enum('count', 'mass', 'volume', 'misc')  // 단위 분류
  is_default boolean [default: false]          // 기본 표기 단위인지
}
//만약 한 재료에 여러 단위가 가능하면 같은 ingredient_id에 해당하는 unit이 다른 객체가 여러 개 있음


// 레시피 테이블
Table recipes {
  id int [pk, increment]
  title varchar(100) [not null]
  description text //이 음식에 대한 간략한 설명
  uploader_id int [ref: > users.id]
  base_serving int [not null]             // 기준 인분
  thumbnail_url  text // 대표 이미지. 선택
  created_at datetime
}

// 레시피 내용 테이블
Table recipe_steps {
  id             int      [pk, increment]
  recipe_id      int      [ref: > recipes.id]
  step_order     int      // 순서 번호 (1, 2, 3, ...)
  description    text     // 해당 단계 설명
  image_url      text     // 선택적으로 업로드
}

// 레시피 입력 재료 테이블
Table recipe_ingredients {
  id int [pk, increment]
  recipe_id int [ref: > recipes.id]
  ingredient_id int [ref: > ingredients.id]
  quantity float [not null]
  unit_name varchar(20) [not null]  // ingredient_units의 unit_name 중 하나
}

// 재료 카테고리 테이블 추가
Table ingredient_categories {
  id int [pk, increment]
  name varchar(50) [not null]
  is_custom boolean [default: false]  // 사용자가 만든 경우 true
  created_by int [ref: > users.id, null] // 사용자가 만든 경우에만 저장
}


//--------------------------------------------------------
// 나중에 좋아요 기능 추가시 활용
Table favorites {
  id int [pk, increment]
  user_id int [ref: > users.id]
  restaurant_id int [ref: > restaurants.id]
  created_at datetime
}

// 나중에 코멘트 기능시 활용
Table comments {
  id int [pk, increment]
  user_id int [ref: > users.id]
  restaurant_id int [ref: > restaurants.id]
  content text
  created_at datetime
}

// 관리자 로그
Table admin_logs {
  id int [pk, increment]
  admin_id int [ref: > users.id]
  action_type varchar(50)
  target_user int [ref: > users.id]
  detail text
  created_at datetime
}
