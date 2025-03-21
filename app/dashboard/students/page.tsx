'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '../../services/api';

type Alternative = {
    letra: string;
    texto: string;
};

type Question = {
    id: string;
    pergunta: string;
    respostaCorreta: string;
    explicacao: string;
    alternatives: Alternative[];
};

type ResponseAnswer = {
    respostaEscolhida: string;
    correto: boolean;
    question: Question;
};

type Quiz = {
    id: string;
    titulo: string;
    tema: string;
    nivelDificuldade: string;
    tipoPergunta: string;
    responsesAnswers: ResponseAnswer[];
};

export default function StudentDashboard() {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchQuizzes() {
            try {
                const response = await api.get<Quiz[]>('/quizzes');
                setQuizzes(response.data);
            } catch (error) {
                console.error('Erro ao carregar quizzes:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchQuizzes();
    }, []);

    return (
        <div className="container py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Quizzes Respondidos</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Carregando quizzes...</p>
                    ) : quizzes.length === 0 ? (
                        <p>Nenhum quiz respondido ainda.</p>
                    ) : (
                        <ul className="space-y-4">
                            {quizzes.map((quiz) => (
                                <li key={quiz.id} className="p-4 border rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{quiz.titulo}</p>
                                        <p className="text-sm text-gray-600">{quiz.tema} - {quiz.nivelDificuldade}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => router.push(`/dashboard/students/review/${quiz.id}`)}
                                        >
                                            Revisar
                                        </Button>
                                        <Button
                                            variant="default"
                                            onClick={() => router.push(`/questions/${quiz.id}`)}
                                        >
                                            Refazer
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
