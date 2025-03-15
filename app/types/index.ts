export type Role = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  questionType: 'multiple-choice' | 'true-false';
  createdBy: string;
  shareLink?: string;
}

export interface QuizResponse {
  id: string;
  quizId: string;
  userId: string;
  answers: {
    questionId: string;
    selectedAnswer: string;
  }[];
  score: number;
  submittedAt: string;
}