import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.utils.class_weight import compute_sample_weight
import joblib

def ml_ready_data(clin_file, mut_file, cna_file):
    print("--- 1. PROCESSING CLINICAL BASELINE ---")
    clinical = pd.read_csv(clin_file, sep='\t', comment='#')
    
    target_cols = [
        'Patient ID', 'Sample ID', 'Cancer Type', 'Fraction Genome Altered', 
        'Mutation Count', 'Sex', 'Sample Type'
    ]
    # Dropping 'Smoking History' to prevent data leak
    clinical = clinical[target_cols].dropna()
    clinical['Sex'] = clinical['Sex'].map({'Female': 0, 'Male': 1})
    clinical['Sample Type'] = clinical['Sample Type'].map({'Primary': 0, 'Metastasis': 1})
    clinical = clinical.dropna()
    
    le = LabelEncoder()
    clinical['Cancer Type Target'] = le.fit_transform(clinical['Cancer Type'])
    joblib.dump(le, 'cancer_type_encoder.joblib')
    clinical.set_index('Sample ID', inplace=True)

    print("--- 2. PROCESSING GENOMIC FEATURES ---")
    # Mutations (Binary)
    mutations = pd.read_csv(mut_file, sep='\t', low_memory=False, comment='#')
    mut_matrix = pd.crosstab(mutations['Tumor_Sample_Barcode'], mutations['Hugo_Symbol'])
    mut_matrix = (mut_matrix > 0).astype(int)
    mut_matrix.columns = [f"{gene}_MUT" for gene in mut_matrix.columns]
    
    cna = pd.read_csv(cna_file, sep='\t', low_memory=False)
    cna_matrix = cna.set_index('Hugo_Symbol').T
    cna_matrix.columns = [f"{gene}_CNA" for gene in cna_matrix.columns]

    # Merge Genomic & Apply 2% Variance Filter
    genomic_features = mut_matrix.join(cna_matrix, how='outer').fillna(0)
    min_samples = int(len(genomic_features) * 0.02)
    frequent_muts = mut_matrix.columns[mut_matrix.sum() >= min_samples]
    final_genomic_df = genomic_features[list(frequent_muts) + list(cna_matrix.columns)]
    
    print("--- 3. MASTER MERGE ---")
    master_df = clinical.join(final_genomic_df, how='inner')
    
    groups = master_df['Patient ID']
    X = master_df.drop(columns=['Patient ID', 'Cancer Type', 'Cancer Type Target'])
    y = master_df['Cancer Type Target']

    print("--- 4. STRATIFIED PATIENT-LEVEL SPLIT ---")
    # Handles both patient grouping and class stratification
    stratified_group = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
    train_idx, test_idx = next(stratified_group.split(X, y, groups=groups))
    
    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

    print("--- 5. SCALING & WEIGHTING ---")
    # Scale features so Logistic Regression doesn't fail
    scaler = StandardScaler()
    X_train_scaled = pd.DataFrame(scaler.fit_transform(X_train), columns=X_train.columns, index=X_train.index)
    X_test_scaled = pd.DataFrame(scaler.transform(X_test), columns=X_test.columns, index=X_test.index)
    joblib.dump(scaler, 'feature_scaler.joblib')

    # Calculate sample weights to handle rare cancer types
    sample_weights = compute_sample_weight(class_weight='balanced', y=y_train)

    print("[SUCCESS] Data is now ML-Ready.")
    return X_train_scaled, X_test_scaled, y_train, y_test, sample_weights, le

if __name__ == "__main__":
    X_train, X_test, y_train, y_test, weights, encoder = ml_ready_data(
        'datafiles/msk_impact_2017_clinical_data.tsv',
        'datafiles/data_mutations.txt',
        'datafiles/data_cna.txt'
    )