'use server';

export type ExerciseListItem = {
    group: string;
    exercises: string[];
};

const exerciseList: ExerciseListItem[] = [
    {
        group: 'Peito (Chest)',
        exercises: [
            'Supino reto com barra', 'Supino inclinado com barra', 'Supino declinado com barra', 'Supino reto com halteres',
            'Supino inclinado com halteres', 'Supino declinado com halteres', 'Crossover no cabo alto', 'Crossover no cabo médio',
            'Crossover no cabo baixo', 'Peck deck (voador)', 'Flexão de braços tradicional', 'Flexão de braços com pés elevados',
            'Flexão diamante', 'Flexão com palmas', 'Flexão arqueiro',
        ]
    },
    {
        group: 'Costas (Back)',
        exercises: [
            'Puxada frontal na polia alta', 'Remada curvada com barra', 'Remada curvada com halteres', 'Remada unilateral na polia',
            'Remada sentada triângulo', 'Puxada fechada', 'Puxada supinada', 'Barra fixa (pegada pronada)', 'Barra fixa (pegada supinada)',
            'Chin-up leve', 'Pull-over com halter', 'Pull-over na polia', 'Levantamento terra', 'Remada cavalinho', 'Remada baixa com barra',
        ]
    },
    {
        group: 'Ombros (Shoulders)',
        exercises: [
            'Desenvolvimento militar com barra', 'Desenvolvimento com halteres', 'Desenvolvimento Arnold', 'Elevação lateral com halteres',
            'Elevação frontal alternada', 'Elevação frontal com barra', 'Elevação reverse (para posterior)', 'Elevação unilateral inclinada',
            'Remada alta com barra', 'Remada alta na polia', 'Desenvolvimento na máquina sentado', 'Encolhimento de ombros com halteres',
            'Encolhimento com barra', 'Elevação lateral no cabo', 'Crucifixo inverso na máquina',
        ]
    },
    {
        group: 'Bíceps (Biceps)',
        exercises: [
            'Rosca direta com barra', 'Rosca direta com barra W', 'Rosca alternada com halteres', 'Rosca alternada inclinado',
            'Rosca concentrada', 'Rosca martelo', 'Rosca martelo cruzado', 'Rosca Scott (no banco)', 'Rosca Scott (na máquina)',
            'Rosca 21 (três partes)', 'Rosca inversa', 'Rosca no cabo em pé', 'Rosca no cabo banco inclinado', 'Rosca Zottman',
            'Curl isométrico',
        ]
    },
    {
        group: 'Tríceps (Triceps)',
        exercises: [
            'Tríceps testa com barra', 'Tríceps testa com halteres', 'Tríceps na polia alta (barra V)', 'Tríceps na polia alta (corda)',
            'Tríceps na polia alta (barra reta)', 'Tríceps francês sentado', 'Tríceps francês unilateral', 'Mergulho entre bancos',
            'Tríceps banco (bench dip)', 'Tríceps coice com halteres', 'Tríceps coice no cabo', 'Tríceps overhead na polia',
            'Tríceps kickback', 'Tríceps no banco inclinado', 'Tríceps prono com halteres',
        ]
    },
    {
        group: 'Pernas (Quadríceps e glúteos)',
        exercises: [
            'Agachamento livre com barra', 'Agachamento frontal', 'Agachamento sumô', 'Agachamento hack', 'Leg press 45º',
            'Leg press horizontal', 'Avanço (lunge) com barra', 'Avanço com halteres', 'Avanço búlgaro', 'Agachamento com halteres',
            'Agachamento no smith', 'Agachamento com salto', 'Step-up com halter', 'Agachamento pistol (1 perna)', 'Agachamento no TRX',
        ]
    },
    {
        group: 'Pernas (Posteriores e glúteos)',
        exercises: [
            'Stiff com barra', 'Stiff com halteres', 'Good morning (boa-manhã)', 'Peso morto romeno', 'Peso morto com pernas rígidas',
            'Elevação de quadril (hip thrust)', 'Ponte glútea unilateral', 'Glute bridge com barra', 'Mesa flexora',
            'Mesa extensora inversa', 'Peso morto com halteres', 'Peso morto trap bar', 'Agachamento caneleira (circuito)',
            'Kettlebell swing', 'Step-up alternado',
        ]
    },
    {
        group: 'Panturrilhas (Calves)',
        exercises: [
            'Elevação de panturrilha em pé', 'Elevação sentado', 'Panturrilha no leg press', 'Panturrilha com barra no ombro',
            'Panturrilha unipodal em pé', 'Panturrilha unipodal sentado', 'Panturrilha na máquina Smith', 'Panturrilha donkey',
            'Panturrilha no step', 'Panturrilha no hack machine',
        ]
    },
    {
        group: 'Abdômen e Core',
        exercises: [
            'Abdominal crunch tradicional', 'Abdominal crunch invertido', 'Elevação de pernas na barra', 'Elevação de pernas suspensa',
            'Elevação de pernas no solo', 'Abdominal na bola suíça', 'Abdominal bicicleta', 'Abdominal oblíquo lateral',
            'Prancha frontal', 'Prancha lateral', 'Ab wheel', 'Prancha com toque de ombro', 'V-sit', 'Russian twist', 'Hollow hold',
            'Superman', 'Pallof press', 'Abdominal Jackknife', 'Mountain climber', 'Toes to bar',
        ]
    },
    {
        group: 'Cardio e Pliometria',
        exercises: [
            'Corrida na esteira', 'Bicicleta ergométrica', 'Elíptico', 'Remo', 'Stepper', 'Pular corda', 'Sprints no local',
            'Box jump', 'Burpee', 'Saltos laterais (skater jump)', 'Agachamento com salto', 'Lunge com salto',
            'Saltos no banco (bench jump)', 'Saltos no caixote', 'Montanhista com salto',
        ]
    },
];

export async function getExercises(): Promise<ExerciseListItem[]> {
    return Promise.resolve(JSON.parse(JSON.stringify(exerciseList)));
}
