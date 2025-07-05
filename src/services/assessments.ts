'use server';

import { format } from 'date-fns';

export type BodyMeasures = {
    weight: number; // kg
    height: number; // cm
    bodyFat: number; // %
    muscleMass: number; // kg
    bmi: number;
    chest: number; // cm
    waist: number; // cm
    hips: number; // cm
    rightArm: number; // cm
    leftArm: number; // cm
    rightThigh: number; // cm
    leftThigh: number; // cm
};

export type Assessment = {
    id: string;
    studentId: string;
    studentName: string;
    date: string; // "yyyy-MM-dd"
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
        measures: {
            weight: 65, height: 165, bodyFat: 22.5, muscleMass: 48.0, bmi: 23.9,
            chest: 90, waist: 72, hips: 98, rightArm: 28, leftArm: 28, rightThigh: 55, leftThigh: 55
        },
        notes: 'Foco em emagrecimento e definição.'
    }
];
let nextId = assessments.length + 1;
// -------------------------

export async function getAssessments(): Promise<Assessment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
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
