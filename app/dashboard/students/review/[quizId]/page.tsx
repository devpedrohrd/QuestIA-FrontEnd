'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/app/utils/utils';
import api from '@/app/services/api';

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

type QuizResponse = {
    quiz: {
        id: string;
        titulo: string;
        tema: string;
        nivelDificuldade: string;
        tipoPergunta: string;
    };
    responsesAnswers: ResponseAnswer[];
};

export default function ReviewPage({ params }: { params: { quizId: string } }) {
    const router = useRouter();
    const [quizResponse, setQuizResponse] = useState<QuizResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchQuiz() {
            try {
                const response = await api.get(`/answer/best/${params.quizId}`);
                const data = response.data;

                if (Array.isArray(data) && data.length > 0) {
                    setQuizResponse(data[0]); // Caso a API retorne um array
                } else {
                    setQuizResponse(data); // Caso retorne um objeto direto
                }
            } catch (error) {
                console.error('Erro ao carregar quiz:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchQuiz();
    }, [params.quizId]);

    if (loading) {
        return <p className="text-center">Carregando...</p>;
    }

    if (!quizResponse || !quizResponse.quiz) {
        return <p className="text-center text-gray-500">Quiz não encontrado.</p>;
    }

    return (
        <div className="container py-10">
            {loading ? (
                <p className="text-center">Carregando...</p>
            ) : !quizResponse || !quizResponse.quiz ? (
                <p className="text-center text-gray-500">Quiz não encontrado.</p>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Revisão: {quizResponse.quiz?.titulo ?? 'Título Indisponível'}</CardTitle>
                        <p className="text-sm text-gray-500">
                            {quizResponse.quiz?.tema ?? 'Tema Indisponível'} - {quizResponse.quiz?.nivelDificuldade ?? 'Dificuldade Indisponível'}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {quizResponse.responsesAnswers.length > 0 ? (
                            quizResponse.responsesAnswers.map((response, index) => (
                                <div
                                    key={response.question.id}
                                    className={`p-4 border rounded-lg ${response.correto === true ? "bg-green-100" : "bg-red-100"}`}
                                >
                                    <h3 className="text-lg font-medium">
                                        {index + 1}. {response.question?.pergunta ?? "Pergunta não disponível"}
                                    </h3>

                                    <p className="text-sm">
                                        <strong>Sua resposta:</strong>{' '}
                                        <span className={response.correto === true ? "text-green-600" : "text-red-600"}>
                                            {response.respostaEscolhida ?? "Não disponível"} {response.correto === true ? '✅' : '❌'}
                                        </span>
                                    </p>

                                    <p className="text-sm text-gray-600">
                                        <strong>Resposta correta:</strong> {response.question?.respostaCorreta ?? "Não disponível"}
                                    </p>

                                    <p className="text-sm text-gray-700 mt-2">
                                        <strong>Explicação:</strong> {response.question?.explicacao ?? "Sem explicação"}
                                    </p>

                                    {response.question?.alternatives?.length > 0 && (
                                        <div className="mt-2">
                                            <span className="font-bold">Alternativas:</span>
                                            <ul className="list-disc ml-4">
                                                {response.question.alternatives.map((alt) => (
                                                    <li
                                                        key={alt.letra}
                                                        className={`text-sm ${response.respostaEscolhida === alt.letra
                                                            ? response.correto === true
                                                                ? "text-green-600 font-semibold"
                                                                : "text-red-600 font-semibold"
                                                            : ""
                                                            }`}
                                                    >
                                                        {alt.letra}) {alt.texto}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">Nenhuma resposta encontrada para este quiz.</p>
                        )}

                        {/* 🔹 Botões de ação */}
                        <div className="flex justify-between mt-6">
                            <Button variant="outline" onClick={() => router.back()}>
                                Voltar
                            </Button>
                            <Button onClick={() => router.push(`/questions/${quizResponse.quiz.id}`)}>
                                Refazer Quiz
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );


}
