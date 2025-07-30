import sqlite3
import pandas as pd
import argparse
import os
import csv

def preprocess(input_path, db_path, output_path):

    UNIT_METRIC_MAP = {
        '개': 'count', '쪽': 'count', '톨': 'count', '구': 'count', '접': 'count',
        '포기': 'count', '뿌리': 'count', '대': 'count', '잎': 'count',
        'g': 'mass', 
        '꼬집': 'misc', '주먹': 'misc', '단': 'misc', 
        'ml': 'volume', 'tbsp': 'volume', 'tsp': 'volume', 'cup': 'volume'
    }

    # 기본단위 목록 
    DEFAULT_UNITS = {'개', 'g', 'ml', 'tbsp', 'tsp', 'cup'}

    # 모든 단위 목록
    ALL_UNITS = {'개', '쪽', '톨', '구', '접','포기', '뿌리', '대', '잎',
        'g', '꼬집', '주먹', '단', 'ml', 'tbsp', 'tsp', 'cup'}
    
        # 재료 타입별로 기본단위 다르게 (야채는 ml를 안 쓸테니...)
    BASE_UNITS_BY_TYPE = {
        'vegetable': {'개', 'g'}, 
        'liquid': {'g', 'ml', 'tbsp', 'tsp', 'cup'},
        'powder': {'g', 'ml', 'tbsp', 'tsp', 'cup'} 
    }

    master_unit_rows = []
    for unit_name in sorted(list(ALL_UNITS)):
        master_unit_rows.append({
            'ingredient_id': '', 
            'unit_name': unit_name,
            'is_default': 1 if unit_name in DEFAULT_UNITS else 0,
            'unit_type': UNIT_METRIC_MAP.get(unit_name, 'misc')
        })
    master_df = pd.DataFrame(master_unit_rows)

    conn = sqlite3.connect(db_path)
    ingredients_df = pd.read_sql_query("SELECT id, name, unit_type FROM ingredients", conn)
    ingredients_map = ingredients_df.set_index('name').to_dict('index')
    conn.close()

    try:
        input_df = pd.read_csv(input_path)
    except FileNotFoundError:
        print(f"입력 파일 없음: '{input_path}'")
        return

    processed_units = []

    for _, row in input_df.iterrows():
        ingredient_name = row['name']
        specific_units_str = row['unit']

        if ingredient_name not in ingredients_map:
            print(f"'{ingredient_name}' 재료를 ingredients 테이블에서 찾지 못함. 건너뜁니다.")
            continue

        ingredient_info = ingredients_map[ingredient_name]
        ingredient_id = ingredient_info['id']
        ingredient_type = ingredient_info['unit_type']

        units_to_add = set()

        if ingredient_type in BASE_UNITS_BY_TYPE:
            units_to_add.update(BASE_UNITS_BY_TYPE[ingredient_type])

        # csv 아래에 명시된 특정 단위 추가(쪽, 구 등등...)
        if pd.notna(specific_units_str):
            specific_units = [unit.strip() for unit in specific_units_str.split(',')]
            units_to_add.update(specific_units)

        for unit_name in units_to_add:
            if not unit_name: continue

            processed_units.append({
                'ingredient_id': ingredient_id,
                'unit_name': unit_name,
                'is_default': 1 if unit_name in DEFAULT_UNITS else 0,
                'unit_type': UNIT_METRIC_MAP.get(unit_name, 'misc') # 맵에 없으면 misc
            })
    
    specific_units_df = pd.DataFrame(processed_units)
    final_df = pd.concat([master_df, specific_units_df], ignore_index=True)
    final_df = final_df[['ingredient_id', 'unit_name', 'unit_type', 'is_default']]
    final_df.to_csv(output_path, index=False, encoding='utf-8-sig')
    print(f"전처리 결과가 '{output_path}' 파일로 저장됨.")



if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(description="재료 단위 정보를 읽어 DB 규칙에 맞게 전처리하고 CSV 파일로 저장")
    
    # 입력 CSV 파일 경로
    parser.add_argument("input_csv")
    
    # DB 파일 경로
    parser.add_argument("--db", default="Data.db")
    
    # 출력 파일 경로
    parser.add_argument("--out", default="ingredient_units_processed.csv")

    args = parser.parse_args()

    preprocess(args.input_csv, args.db, args.out)