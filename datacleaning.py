import pandas as pd
import joblib
import os

def build_dengue_pipeline(doh_filepath):
    current_dir = os.getcwd()
    file_path = os.path.join(current_dir, doh_filepath)

    if not os.path.exists(file_path):
        print(f"[ERROR] Could not find '{file_path}'")
        return None

    try:
        df = pd.read_csv(file_path, skiprows = [1])
        print(f"Successfully loaded {doh_filepath} data.")
    except FileNotFoundError:
        print(f"Error: Could not find {doh_filepath}.")
    except Exception as e:
        print(f"Failed to read the CSV file. Details: {e}.")
        return None

    required_columns = ['Region', 'Location','Date', 'Cases']
    missing_cols = [col for col in required_columns if col not in df.columns]

    if missing_cols:
        print(f"[ERROR] Missing required columns: {missing_cols}")
        return None

    original_row_count = df.shape[0]

    df = df.dropna(subset=['Region', 'Location', 'Date', 'Cases'])
    dropped_rows = original_row_count - df.shape[0]
    print(f"[INFO] Data Lost: Dropped {dropped_rows} rows due to missing Region, Date, Location, or Cases.")

    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values(by='Date')
    df_grouped = df.groupby([pd.Grouper(key='Date', freq='W'), 'Region', 'Location'])['Cases'].sum().reset_index()
    grouped_row_count = df_grouped.shape[0]

    min_date = df_grouped['Date'].min()
    max_date = df_grouped['Date'].max()
    all_weeks = pd.date_range(start=min_date, end=max_date, freq='W')
    all_locs_regions_pairs = df[['Region', 'Location']].drop_duplicates()

    weeks_df = pd.DataFrame({'Date': all_weeks})
    grid_df = weeks_df.merge(all_locs_regions_pairs, how='cross')
    data_grid = pd.MultiIndex.from_frame(grid_df[['Date', 'Region', 'Location']])

    df_clean = (
        df_grouped.set_index(['Date', 'Region', 'Location'])
        .reindex(data_grid, fill_value=0)
        .reset_index()
        .sort_values(by=['Date','Region', 'Location'])
        .reset_index(drop=True)
    )

    df_clean.index = range(1, len(df_clean) + 1)
    added_rows = df_clean.shape[0] - grouped_row_count   
    print(f"[INFO] Data Gained: Injected {added_rows} missing weeks with 0 cases to fix the timeline.")
    print(f"[SUCCESS] Final ML-ready row count: {df_clean.shape[0]}")

    output_folder = 'csvfiles'
    os.makedirs(output_folder, exist_ok=True)
    csv_path = os.path.join(output_folder, 'cleaned_dengue_data.csv')
    joblib_path = os.path.join(output_folder, 'cleaned_dengue_data.joblib')

    df_clean.to_csv(csv_path, index=False)
    joblib.dump(df_clean, joblib_path)
    print("Pipeline complete. Saved as 'cleaned_dengue_data.csv'")
    
    return df_clean

if __name__ == "__main__":
    clean_data = build_dengue_pipeline('csvfiles/doh-epi-dengue-data-2016-2021.csv')
    if clean_data is not None:
        print("\nEarliest 2016 Records:")
        print(clean_data.head(10))
        print("\nLatest 2021 Records:")
        print(clean_data.tail(10))
        