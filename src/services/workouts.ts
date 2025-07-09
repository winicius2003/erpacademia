'use server';

export type Exercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes?: string;
  imageUrl?: string;
};

export type WorkoutDay = {
  id: string;
  name: string; // e.g., "Treino A: Peito, Ombros e Tríceps"
  exercises: Exercise[];
};

export type WorkoutPlan = {
  id: string;
  name: string;
  goal: "Hipertrofia" | "Emagrecimento" | "Resistência";
  level: "Iniciante" | "Intermediário" | "Avançado";
  workouts: WorkoutDay[];
};

let nextPlanId = 3;
let nextDayId = 5;
let nextExerciseId = 14;

let workoutPlans: WorkoutPlan[] = [
  {
    id: '1',
    name: 'Hipertrofia Total - Iniciante',
    goal: 'Hipertrofia',
    level: 'Iniciante',
    workouts: [
      {
        id: 'd1',
        name: 'Treino A: Superiores (Foco em Peito)',
        exercises: [
          { id: 'e1', name: 'Supino Reto com Barra', sets: '3', reps: '8-12', rest: '60s', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif' },
          { id: 'e2', name: 'Desenvolvimento com Halteres', sets: '3', reps: '8-12', rest: '60s' },
          { id: 'e3', name: 'Tríceps na Polia', sets: '3', reps: '10-15', rest: '45s' },
        ],
      },
      {
        id: 'd2',
        name: 'Treino B: Superiores (Foco em Costas)',
        exercises: [
          { id: 'e4', name: 'Puxada Frontal', sets: '3', reps: '8-12', rest: '60s' },
          { id: 'e5', name: 'Remada Curvada', sets: '3', reps: '8-12', rest: '60s' },
          { id: 'e6', name: 'Rosca Direta com Barra', sets: '3', reps: '10-15', rest: '45s' },
        ],
      },
       {
        id: 'd3',
        name: 'Treino C: Inferiores',
        exercises: [
          { id: 'e7', name: 'Agachamento Livre', sets: '3', reps: '8-12', rest: '90s' },
          { id: 'e8', name: 'Leg Press 45', sets: '3', reps: '10-15', rest: '60s' },
          { id: 'e9', name: 'Cadeira Extensora', sets: '3', reps: '12-15', rest: '45s' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Circuito de Emagrecimento',
    goal: 'Emagrecimento',
    level: 'Intermediário',
    workouts: [
      {
        id: 'd4',
        name: 'Circuito Full Body',
        exercises: [
          { id: 'e10', name: 'Agachamento com Salto', sets: '4', reps: '20', rest: '30s' },
          { id: 'e11', name: 'Flexão de Braço', sets: '4', reps: 'Até a falha', rest: '30s' },
          { id: 'e12', name: 'Burpees', sets: '4', reps: '15', rest: '30s' },
          { id: 'e13', name: 'Prancha Abdominal', sets: '4', reps: '45s', rest: '30s' },
        ],
      },
    ],
  },
];

export async function getWorkoutPlans(): Promise<WorkoutPlan[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Promise.resolve(JSON.parse(JSON.stringify(workoutPlans)));
}

export async function addWorkoutPlan(planData: Omit<WorkoutPlan, 'id'>): Promise<string> {
    const newPlan: WorkoutPlan = {
        id: (nextPlanId++).toString(),
        ...planData,
        workouts: planData.workouts.map(day => ({
            ...day,
            id: (nextDayId++).toString(),
            exercises: day.exercises.map(ex => ({
                ...ex,
                id: (nextExerciseId++).toString()
            }))
        }))
    };
    workoutPlans.push(newPlan);
    return Promise.resolve(newPlan.id);
}

export async function updateWorkoutPlan(id: string, planData: Partial<Omit<WorkoutPlan, 'id'>>): Promise<void> {
    const planIndex = workoutPlans.findIndex(p => p.id === id);
    if (planIndex !== -1) {
        const updatedWorkouts = planData.workouts?.map(day => ({
            ...day,
            id: day.id || (nextDayId++).toString(),
            exercises: day.exercises.map(ex => ({
                ...ex,
                id: ex.id || (nextExerciseId++).toString()
            }))
        })) || workoutPlans[planIndex].workouts;

        workoutPlans[planIndex] = { 
            ...workoutPlans[planIndex], 
            ...planData,
            workouts: updatedWorkouts
        };
    }
    return Promise.resolve();
}

export async function deleteWorkoutPlan(id: string): Promise<void> {
    workoutPlans = workoutPlans.filter(p => p.id !== id);
    return Promise.resolve();
}

export async function getWorkoutPlanById(id: string): Promise<WorkoutPlan | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const plan = workoutPlans.find(p => p.id === id);
    return Promise.resolve(plan ? JSON.parse(JSON.stringify(plan)) : null);
}
