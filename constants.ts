
export const NORMALIZATION_MAP: { [key: string]: string } = {
    "hemoglobina": "Hemoglobina",
    "hematocrito": "Hematocrito",
    "proteina c reactiva": "PCR",
    "recuento leucocitos": "Leucocitos",
    "recuento de plaquetas": "Plaquetas",
    "plaquetas": "Plaquetas",
    "nitrogeno ureico": "BUN",
    "v.h.s.": "V.H.S.",
    "segmentados": "Segmentados",
    "linfocitos": "Linfocitos",
    "asat/got": "GOT",
    "alat/gpt": "GPT",
    "fosfatasa alcalina": "FA",
    "rel. proteinuria/creatininuria": "Rel Proteinuria/Creatinuria",
    "relacion albumina/creatinuri": "Rel Albumina/Creatinuria",
    "sodio": "Sodio",
    "potasio": "Potasio",
    "cloro": "Cloro",
    "hco3 actual": "HCO3",
    "ck total": "CK",
    "bilirrubina total": "Bilirrubina Total",
    "bilirrubina directa": "Bilirrubina Directa",
    "psa total": "PSA"
};

export const WHITELIST: string[] = [
    'Hemoglobina', 'Hematocrito', 'Leucocitos', 'Segmentados (%)', 'Linfocitos (%)', 'Plaquetas', 'V.H.S.', 'PCR', 
    'Sodio', 'Potasio', 'Cloro', 'Calcio', 'Fosforo', 'HCO3', 'Creatinina', 'BUN', 'Trigliceridos', 'Lactato', 
    'CK', 'LDH', 'Albumina', 'INR', 'TTPK', 'FA', 'GGT', 'Bilirrubina Total', 'Bilirrubina Directa', 
    'GOT', 'GPT', 'TSH', 'PSA', 'RPR', 'Rel Proteinuria/Creatinuria', 'Rel Albumina/Creatinuria'
];

export const BLACKLIST_TERMS: string[] = [
    'Uremia', 'p02', 'pCO2', 'CO2 TOTAL', 'ph', 'Basofilos', 'Eosinofilos', 'Monocitos', 'Baciliformes', 
    'Blastos', 'Promielocitos', 'Juveniles', 'Mielocitos', 'VCM', 'HCM', 'RDW', 'Urocultivo', 'Sedimento urinario', 
    'Veloc. Filtr. Glomer.', 'BEecf', 's02c', 'Hb. Corp. Media HCM', 'Vol. Corp. Medio VCM', 'Conc.Hb.Corp. Media CHCM'
];

export const TABLE_ROW_GROUPS = [
    { label: 'Hemoglobina / HTO', tests: ['Hemoglobina', 'Hematocrito'], separator: ' / ' },
    { label: 'Leucocitos / Seg% / Linf%', tests: ['Leucocitos', 'Segmentados (%)', 'Linfocitos (%)'], separator: ' / ' },
    { label: 'Plaquetas', tests: ['Plaquetas'], separator: '' },
    { label: 'V.H.S.', tests: ['V.H.S.'], separator: '' },
    { label: 'PCR', tests: ['PCR'], separator: '' },
    { label: 'Sodio', tests: ['Sodio'], separator: '' },
    { label: 'Potasio', tests: ['Potasio'], separator: '' },
    { label: 'Cloro', tests: ['Cloro'], separator: '' },
    { label: 'Calcio', tests: ['Calcio'], separator: '' },
    { label: 'Fosforo', tests: ['Fosforo'], separator: '' },
    { label: 'HCO3', tests: ['HCO3'], separator: '' },
    { label: 'Creatinina', tests: ['Creatinina'], separator: '' },
    { label: 'BUN', tests: ['BUN'], separator: '' },
    { label: 'Trigliceridos', tests: ['Trigliceridos'], separator: '' },
    { label: 'Lactato', tests: ['Lactato'], separator: '' },
    { label: 'CK', tests: ['CK'], separator: '' },
    { label: 'LDH', tests: ['LDH'], separator: '' },
    { label: 'Albumina', tests: ['Albumina'], separator: '' },
    { label: 'INR', tests: ['INR'], separator: '' },
    { label: 'TTPK', tests: ['TTPK'], separator: '' },
    { label: 'FA', tests: ['FA'], separator: '' },
    { label: 'GGT', tests: ['GGT'], separator: '' },
    { label: 'Bilirrubina Total / Directa', tests: ['Bilirrubina Total', 'Bilirrubina Directa'], separator: ' / ' },
    { label: 'GOT / GPT', tests: ['GOT', 'GPT'], separator: ' / ' },
    { label: 'TSH', tests: ['TSH'], separator: '' },
    { label: 'PSA', tests: ['PSA'], separator: '' },
    { label: 'RPR', tests: ['RPR'], separator: '' },
    { label: 'Rel Proteinuria/Creatinuria', tests: ['Rel Proteinuria/Creatinuria'], separator: '' },
    { label: 'Rel Albumina/Creatinuria', tests: ['Rel Albumina/Creatinuria'], separator: '' }
];
