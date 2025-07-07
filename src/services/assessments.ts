'use server';

import { format } from 'date-fns';

export type AssessmentType = "Antropometria" | "Bioimpedância";

export type BodyMeasures = {
    weight: number; // kg
    height: number; // cm
    bmi: number;
    // Common fields
    bodyFat?: number; // %
    muscleMass?: number; // kg
    
    // Anthropometry specific
    chest?: number; // cm
    waist?: number; // cm
    hips?: number; // cm
    rightArm?: number; // cm
    leftArm?: number; // cm
    rightThigh?: number; // cm
    leftThigh?: number; // cm

    // Bioimpedance specific
    visceralFat?: number; // level
    metabolicAge?: number; // years
    bodyWater?: number; // %
};

export type Assessment = {
    id: string;
    studentId: string;
    studentName: string;
    date: string; // "yyyy-MM-dd"
    type: AssessmentType;
    measures: BodyMeasures;
    notes?: string;
};

// --- In-Memory Database ---
let assessments: Assessment[] = [
    { 
        id: 'a1', 
        studentId: '1',
        studentName: 'João da Silva',
        date: '2024-05-15',
        type: 'Antropometria',
        measures: {
            weight: 85, height: 180, bodyFat: 15.2, muscleMass: 68.5, bmi: 26.2,
            chest: 102, waist: 85, hips: 100, rightArm: 35, leftArm: 34.5, rightThigh: 60, leftThigh: 59.5
        },
        notes: 'Iniciando programa de hipertrofia.'
    },
    { 
        id: 'a2', 
        studentId: '2',
        studentName: 'Maria Oliveira',
        date: '2024-06-01',
        type: 'Bioimpedância',
        measures: {
            weight: 65, height: 165, bodyFat: 22.5, muscleMass: 48.0, bmi: 23.9,
            visceralFat: 4, metabolicAge: 25, bodyWater: 55.2
        },
        notes: 'Foco em emagrecimento e definição. Hidratação um pouco abaixo do ideal.'
    },
    { 
        id: 'a3', 
        studentId: '1',
        studentName: 'João da Silva',
        date: '2024-07-15',
        type: 'Antropometria',
        measures: {
            weight: 88, height: 180, bodyFat: 14.1, muscleMass: 72.0, bmi: 27.2,
            chest: 105, waist: 84, hips: 101, rightArm: 36, leftArm: 35.5, rightThigh: 62, leftThigh: 61.5
        },
        notes: 'Ótima evolução de hipertrofia. Ajustar cardio.'
    }
];
let nextId = assessments.length + 1;
// -------------------------

export async function getAssessments(studentId?: string): Promise<Assessment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (studentId) {
        const studentAssessments = assessments.filter(a => a.studentId === studentId);
        return Promise.resolve(JSON.parse(JSON.stringify(studentAssessments)));
    }
    return Promise.resolve(JSON.parse(JSON.stringify(assessments)));
}

export async function addAssessment(assessmentData: Omit<Assessment, 'id'>): Promise<string> {
    const newId = `a${nextId++}`;
    const newAssessment: Assessment = {
        id: newId,
        ...assessmentData,
    };
    assessments.unshift(newAssessment);
    return Promise.resolve(newId);
}
