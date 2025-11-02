import { db } from './db-storage';
import { medicinesTable } from '@shared/schema';

const commonMedicines = [
  // Pain Relief & Fever
  {
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen', 
    manufacturer: 'Generic Pharma',
    composition: 'Acetaminophen 500mg',
    dosageForm: 'tablet' as const,
    strength: '500mg',
    price: 45,
    prescriptionRequired: false
  },
  {
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    manufacturer: 'PainFree Pharma',
    composition: 'Ibuprofen 400mg',
    dosageForm: 'tablet' as const,
    strength: '400mg',
    price: 65,
    prescriptionRequired: false
  },
  {
    name: 'Aspirin 325mg',
    genericName: 'Acetylsalicylic Acid',
    manufacturer: 'CardioMed',
    composition: 'Acetylsalicylic Acid 325mg',
    dosageForm: 'tablet' as const,
    strength: '325mg',
    price: 35,
    prescriptionRequired: false
  },
  {
    name: 'Diclofenac 50mg',
    genericName: 'Diclofenac Sodium',
    manufacturer: 'PainRelief Co',
    composition: 'Diclofenac Sodium 50mg',
    dosageForm: 'tablet' as const,
    strength: '50mg',
    price: 85,
    prescriptionRequired: true
  },

  // Antibiotics
  {
    name: 'Amoxicillin 250mg',
    genericName: 'Amoxicillin',
    manufacturer: 'MediCore',
    composition: 'Amoxicillin 250mg',
    dosageForm: 'capsule' as const,
    strength: '250mg', 
    price: 150,
    prescriptionRequired: true
  },
  {
    name: 'Azithromycin 500mg',
    genericName: 'Azithromycin',
    manufacturer: 'InfectFree',
    composition: 'Azithromycin 500mg',
    dosageForm: 'tablet' as const,
    strength: '500mg',
    price: 200,
    prescriptionRequired: true
  },
  {
    name: 'Ciprofloxacin 500mg',
    genericName: 'Ciprofloxacin',
    manufacturer: 'AntiBac Labs',
    composition: 'Ciprofloxacin HCl 500mg',
    dosageForm: 'tablet' as const,
    strength: '500mg',
    price: 180,
    prescriptionRequired: true
  },
  {
    name: 'Doxycycline 100mg',
    genericName: 'Doxycycline',
    manufacturer: 'TetracyclineCo',
    composition: 'Doxycycline Hyclate 100mg',
    dosageForm: 'capsule' as const,
    strength: '100mg',
    price: 120,
    prescriptionRequired: true
  },

  // Gastrointestinal
  {
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole',
    manufacturer: 'GastroMed',
    composition: 'Omeprazole 20mg',
    dosageForm: 'capsule' as const,
    strength: '20mg',
    price: 180,
    prescriptionRequired: true
  },
  {
    name: 'Ranitidine 150mg',
    genericName: 'Ranitidine',
    manufacturer: 'AcidBlock',
    composition: 'Ranitidine HCl 150mg',
    dosageForm: 'tablet' as const,
    strength: '150mg',
    price: 95,
    prescriptionRequired: false
  },
  {
    name: 'Antacid Suspension',
    genericName: 'Aluminum Hydroxide + Magnesium Hydroxide',
    manufacturer: 'DigestEase',
    composition: 'Al(OH)3 200mg + Mg(OH)2 200mg per 5ml',
    dosageForm: 'syrup' as const,
    strength: '200ml',
    price: 65,
    prescriptionRequired: false
  },
  {
    name: 'Loperamide 2mg',
    genericName: 'Loperamide',
    manufacturer: 'GutHealth',
    composition: 'Loperamide HCl 2mg',
    dosageForm: 'capsule' as const,
    strength: '2mg',
    price: 75,
    prescriptionRequired: false
  },

  // Allergy & Respiratory
  {
    name: 'Cetirizine 10mg',
    genericName: 'Cetirizine HCl',
    manufacturer: 'AllergyFree',
    composition: 'Cetirizine HCl 10mg',
    dosageForm: 'tablet' as const,
    strength: '10mg',
    price: 75,
    prescriptionRequired: false
  },
  {
    name: 'Loratadine 10mg',
    genericName: 'Loratadine',
    manufacturer: 'ClearBreath',
    composition: 'Loratadine 10mg',
    dosageForm: 'tablet' as const,
    strength: '10mg',
    price: 85,
    prescriptionRequired: false
  },
  {
    name: 'Cough Syrup 100ml',
    genericName: 'Dextromethorphan',
    manufacturer: 'CoughCure',
    composition: 'Dextromethorphan HBr 10mg/5ml',
    dosageForm: 'syrup' as const,
    strength: '10mg/5ml',
    price: 85,
    prescriptionRequired: false
  },
  {
    name: 'Salbutamol Inhaler',
    genericName: 'Salbutamol',
    manufacturer: 'RespiCare',
    composition: 'Salbutamol 100mcg per dose',
    dosageForm: 'inhaler' as const,
    strength: '100mcg',
    price: 250,
    prescriptionRequired: true
  },

  // Diabetes & Hormones
  {
    name: 'Metformin 500mg',
    genericName: 'Metformin HCl',
    manufacturer: 'DiabetoCare',
    composition: 'Metformin HCl 500mg',
    dosageForm: 'tablet' as const,
    strength: '500mg',
    price: 120,
    prescriptionRequired: true
  },
  {
    name: 'Glibenclamide 5mg',
    genericName: 'Glibenclamide',
    manufacturer: 'SugarControl',
    composition: 'Glibenclamide 5mg',
    dosageForm: 'tablet' as const,
    strength: '5mg',
    price: 90,
    prescriptionRequired: true
  },
  {
    name: 'Insulin Glargine',
    genericName: 'Insulin Glargine',
    manufacturer: 'DiabCare',
    composition: 'Insulin Glargine 100 IU/ml',
    dosageForm: 'injection' as const,
    strength: '100 IU/ml',
    price: 450,
    prescriptionRequired: true
  },

  // Cardiovascular
  {
    name: 'Atorvastatin 20mg',
    genericName: 'Atorvastatin',
    manufacturer: 'CholesterolFree',
    composition: 'Atorvastatin Calcium 20mg',
    dosageForm: 'tablet' as const,
    strength: '20mg',
    price: 185,
    prescriptionRequired: true
  },
  {
    name: 'Amlodipine 5mg',
    genericName: 'Amlodipine',
    manufacturer: 'BPCare',
    composition: 'Amlodipine Besylate 5mg',
    dosageForm: 'tablet' as const,
    strength: '5mg',
    price: 95,
    prescriptionRequired: true
  },
  {
    name: 'Enalapril 10mg',
    genericName: 'Enalapril',
    manufacturer: 'HeartGuard',
    composition: 'Enalapril Maleate 10mg',
    dosageForm: 'tablet' as const,
    strength: '10mg',
    price: 110,
    prescriptionRequired: true
  },

  // Vitamins & Supplements
  {
    name: 'Vitamin D3 1000 IU',
    genericName: 'Cholecalciferol',
    manufacturer: 'HealthVit',
    composition: 'Cholecalciferol 1000 IU',
    dosageForm: 'capsule' as const,
    strength: '1000 IU',
    price: 160,
    prescriptionRequired: false
  },
  {
    name: 'Vitamin B Complex',
    genericName: 'B Complex',
    manufacturer: 'VitaWell',
    composition: 'B1+B2+B3+B5+B6+B12+Folic Acid',
    dosageForm: 'tablet' as const,
    strength: 'Multi',
    price: 125,
    prescriptionRequired: false
  },
  {
    name: 'Calcium + Vitamin D',
    genericName: 'Calcium Carbonate + Cholecalciferol',
    manufacturer: 'BoneStrong',
    composition: 'Calcium Carbonate 500mg + Vit D3 250 IU',
    dosageForm: 'tablet' as const,
    strength: '500mg+250IU',
    price: 140,
    prescriptionRequired: false
  },
  {
    name: 'Iron Tablets',
    genericName: 'Ferrous Sulfate',
    manufacturer: 'IronHealth',
    composition: 'Ferrous Sulfate 325mg',
    dosageForm: 'tablet' as const,
    strength: '325mg',
    price: 85,
    prescriptionRequired: false
  },

  // Skin & Topical
  {
    name: 'Betamethasone Cream',
    genericName: 'Betamethasone',
    manufacturer: 'SkinCare Labs',
    composition: 'Betamethasone Valerate 0.1%',
    dosageForm: 'cream' as const,
    strength: '0.1%',
    price: 150,
    prescriptionRequired: true
  },
  {
    name: 'Clotrimazole Cream',
    genericName: 'Clotrimazole',
    manufacturer: 'AntiFungal Co',
    composition: 'Clotrimazole 1%',
    dosageForm: 'cream' as const,
    strength: '1%',
    price: 95,
    prescriptionRequired: false
  },
  {
    name: 'Mupirocin Ointment',
    genericName: 'Mupirocin',
    manufacturer: 'WoundHeal',
    composition: 'Mupirocin 2%',
    dosageForm: 'cream' as const,
    strength: '2%',
    price: 120,
    prescriptionRequired: true
  },

  // Eye & Ear Care
  {
    name: 'Chloramphenicol Eye Drops',
    genericName: 'Chloramphenicol',
    manufacturer: 'EyeCare Plus',
    composition: 'Chloramphenicol 0.5%',
    dosageForm: 'drops' as const,
    strength: '0.5%',
    price: 75,
    prescriptionRequired: true
  },
  {
    name: 'Artificial Tears',
    genericName: 'Carboxymethylcellulose',
    manufacturer: 'DryEyeRelief',
    composition: 'Carboxymethylcellulose 0.5%',
    dosageForm: 'drops' as const,
    strength: '0.5%',
    price: 95,
    prescriptionRequired: false
  },

  // Women's Health
  {
    name: 'Folic Acid 5mg',
    genericName: 'Folic Acid',
    manufacturer: 'WomenCare',
    composition: 'Folic Acid 5mg',
    dosageForm: 'tablet' as const,
    strength: '5mg',
    price: 65,
    prescriptionRequired: false
  },
  {
    name: 'Oral Contraceptive',
    genericName: 'Ethinylestradiol + Levonorgestrel',
    manufacturer: 'FamPlan',
    composition: 'Ethinylestradiol 0.03mg + Levonorgestrel 0.15mg',
    dosageForm: 'tablet' as const,
    strength: '0.03+0.15mg',
    price: 185,
    prescriptionRequired: true
  }
];

export async function seedMedicines() {
  try {
    console.log('Seeding medicines...');
    
    // Insert all medicines
    for (const medicine of commonMedicines) {
      try {
        await db.insert(medicinesTable).values(medicine);
        console.log(`Added medicine: ${medicine.name}`);
      } catch (error: any) {
        if (error.message?.includes('duplicate key')) {
          console.log(`Medicine ${medicine.name} already exists, skipping...`);
        } else {
          console.error(`Error adding medicine ${medicine.name}:`, error);
        }
      }
    }
    
    console.log('Medicines seeding completed!');
  } catch (error) {
    console.error('Error seeding medicines:', error);
  }
}

// Run if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedMedicines().then(() => process.exit(0));
}