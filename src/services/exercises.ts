'use server';

export type Exercise = {
    name: string;
    imageUrl?: string;
};

export type ExerciseListItem = {
    group: string;
    exercises: Exercise[];
};

const exerciseList: ExerciseListItem[] = [
    {
        group: 'Peito (Chest)',
        exercises: [
            { name: 'Supino reto com barra', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif' },
            { name: 'Supino inclinado com barra', imageUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/09/barbell-incline-bench-press.gif' },
            { name: 'Supino declinado com barra' },
            { name: 'Supino reto com halteres' },
            { name: 'Supino inclinado com halteres' },
            { name: 'Supino declinado com halteres' },
            { name: 'Crossover no cabo alto' },
            { name: 'Crossover no cabo médio' },
            { name: 'Crossover no cabo baixo' },
            { name: 'Peck deck (voador)' },
            { name: 'Flexão de braços tradicional' },
            { name: 'Flexão de braços com pés elevados' },
            { name: 'Flexão diamante' },
            { name: 'Flexão com palmas' },
            { name: 'Flexão arqueiro' },
        ]
    },
    {
        group: 'Costas (Back)',
        exercises: [
            { name: 'Puxada frontal na polia alta' },
            { name: 'Remada curvada com barra' },
            { name: 'Remada curvada com halteres' },
            { name: 'Remada unilateral na polia' },
            { name: 'Remada sentada triângulo' },
            { name: 'Puxada fechada' },
            { name: 'Puxada supinada' },
            { name: 'Barra fixa (pegada pronada)' },
            { name: 'Barra fixa (pegada supinada)' },
            { name: 'Chin-up leve' },
            { name: 'Pull-over com halter' },
            { name: 'Pull-over na polia' },
            { name: 'Levantamento terra' },
            { name: 'Remada cavalinho' },
            { name: 'Remada baixa com barra' },
        ]
    },
    {
        group: 'Ombros (Shoulders)',
        exercises: [
            { name: 'Desenvolvimento militar com barra' },
            { name: 'Desenvolvimento com halteres', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif' },
            { name: 'Desenvolvimento Arnold' },
            { name: 'Elevação lateral com halteres' },
            { name: 'Elevação frontal alternada' },
            { name: 'Elevação frontal com barra' },
            { name: 'Elevação reverse (para posterior)' },
            { name: 'Elevação unilateral inclinada' },
            { name: 'Remada alta com barra' },
            { name: 'Remada alta na polia' },
            { name: 'Desenvolvimento na máquina sentado' },
            { name: 'Encolhimento de ombros com halteres' },
            { name: 'Encolhimento com barra' },
            { name: 'Elevação lateral no cabo' },
            { name: 'Crucifixo inverso na máquina' },
        ]
    },
    {
        group: 'Bíceps (Biceps)',
        exercises: [
            { name: 'Rosca direta com barra' },
            { name: 'Rosca direta com barra W' },
            { name: 'Rosca alternada com halteres' },
            { name: 'Rosca alternada inclinado' },
            { name: 'Rosca concentrada' },
            { name: 'Rosca martelo' },
            { name: 'Rosca martelo cruzado' },
            { name: 'Rosca Scott (no banco)' },
            { name: 'Rosca Scott (na máquina)' },
            { name: 'Rosca 21 (três partes)' },
            { name: 'Rosca inversa' },
            { name: 'Rosca no cabo em pé' },
            { name: 'Rosca no cabo banco inclinado' },
            { name: 'Rosca Zottman' },
            { name: 'Curl isométrico' },
        ]
    },
    {
        group: 'Tríceps (Triceps)',
        exercises: [
            { name: 'Tríceps testa com barra' },
            { name: 'Tríceps testa com halteres' },
            { name: 'Tríceps na polia alta (barra V)' },
            { name: 'Tríceps na polia alta (corda)' },
            { name: 'Tríceps na polia alta (barra reta)', imageUrl: 'https://i.imgur.com/eunA5pE.png' },
            { name: 'Tríceps francês sentado' },
            { name: 'Tríceps francês unilateral' },
            { name: 'Mergulho entre bancos' },
            { name: 'Tríceps banco (bench dip)' },
            { name: 'Tríceps coice com halteres' },
            { name: 'Tríceps coice no cabo' },
            { name: 'Tríceps overhead na polia' },
            { name: 'Tríceps kickback' },
            { name: 'Tríceps no banco inclinado' },
            { name: 'Tríceps prono com halteres' },
        ]
    },
    {
        group: 'Pernas (Quadríceps e glúteos)',
        exercises: [
            { name: 'Agachamento livre com barra' },
            { name: 'Agachamento frontal' },
            { name: 'Agachamento sumô' },
            { name: 'Agachamento hack' },
            { name: 'Leg press 45º' },
            { name: 'Leg press horizontal' },
            { name: 'Avanço (lunge) com barra' },
            { name: 'Avanço com halteres' },
            { name: 'Avanço búlgaro' },
            { name: 'Agachamento com halteres' },
            { name: 'Agachamento no smith' },
            { name: 'Agachamento com salto' },
            { name: 'Step-up com halter' },
            { name: 'Agachamento pistol (1 perna)' },
            { name: 'Agachamento no TRX' },
        ]
    },
    {
        group: 'Pernas (Posteriores e glúteos)',
        exercises: [
            { name: 'Stiff com barra' },
            { name: 'Stiff com halteres' },
            { name: 'Good morning (boa-manhã)' },
            { name: 'Peso morto romeno' },
            { name: 'Peso morto com pernas rígidas' },
            { name: 'Elevação de quadril (hip thrust)' },
            { name: 'Ponte glútea unilateral' },
            { name: 'Glute bridge com barra' },
            { name: 'Mesa flexora' },
            { name: 'Mesa extensora inversa' },
            { name: 'Peso morto com halteres' },
            { name: 'Peso morto trap bar' },
            { name: 'Agachamento caneleira (circuito)' },
            { name: 'Kettlebell swing' },
            { name: 'Step-up alternado' },
        ]
    },
    {
        group: 'Panturrilhas (Calves)',
        exercises: [
            { name: 'Elevação de panturrilha em pé' },
            { name: 'Elevação sentado' },
            { name: 'Panturrilha no leg press' },
            { name: 'Panturrilha com barra no ombro' },
            { name: 'Panturrilha unipodal em pé' },
            { name: 'Panturrilha unipodal sentado' },
            { name: 'Panturrilha na máquina Smith' },
            { name: 'Panturrilha donkey' },
            { name: 'Panturrilha no step' },
            { name: 'Panturrilha no hack machine' },
        ]
    },
    {
        group: 'Abdômen e Core',
        exercises: [
            { name: 'Abdominal crunch tradicional' },
            { name: 'Abdominal crunch invertido' },
            { name: 'Elevação de pernas na barra' },
            { name: 'Elevação de pernas suspensa' },
            { name: 'Elevação de pernas no solo' },
            { name: 'Abdominal na bola suíça' },
            { name: 'Abdominal bicicleta' },
            { name: 'Abdominal oblíquo lateral' },
            { name: 'Prancha frontal' },
            { name: 'Prancha lateral' },
            { name: 'Ab wheel' },
            { name: 'Prancha com toque de ombro' },
            { name: 'V-sit' },
            { name: 'Russian twist' },
            { name: 'Hollow hold' },
            { name: 'Superman' },
            { name: 'Pallof press' },
            { name: 'Abdominal Jackknife' },
            { name: 'Mountain climber' },
            { name: 'Toes to bar' },
        ]
    },
    {
        group: 'Cardio e Pliometria',
        exercises: [
            { name: 'Corrida na esteira' },
            { name: 'Bicicleta ergométrica' },
            { name: 'Elíptico' },
            { name: 'Remo' },
            { name: 'Stepper' },
            { name: 'Pular corda' },
            { name: 'Sprints no local' },
            { name: 'Box jump' },
            { name: 'Burpee' },
            { name: 'Saltos laterais (skater jump)' },
            { name: 'Agachamento com salto' },
            { name: 'Lunge com salto' },
            { name: 'Saltos no banco (bench jump)' },
            { name: 'Saltos no caixote' },
            { name: 'Montanhista com salto' },
        ]
    },
];

export async function getExercises(): Promise<ExerciseListItem[]> {
    return Promise.resolve(JSON.parse(JSON.stringify(exerciseList)));
}
