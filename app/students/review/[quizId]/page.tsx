'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
                const response = await fetch(`http://localhost:3334/answer/${params.quizId}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Erro ao buscar detalhes do quiz');
                }

                const data: QuizResponse[] = await response.json();
                console.log("🔍 Dados brutos recebidos da API:", JSON.stringify(data, null, 2));

                if (data.length > 0) {
                    setQuizResponse(data[0]);
                }
            } catch (error) {
                console.error('Erro ao carregar quiz:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchQuiz();
    }, [params.quizId]);

    return (
        <div className="container py-10">
            {loading ? (
                <p>Carregando...</p>
            ) : !quizResponse ? (
                <p>Quiz não encontrado.</p>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Revisão: {quizResponse.quiz.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {quizResponse.responsesAnswers.length > 0 ? (
                            quizResponse.responsesAnswers.map((response, index) => (
                                <div key={index} className="border p-4 rounded-lg">
                                    <h3 className="text-lg font-medium">{index + 1}. {response?.question?.pergunta || "Pergunta não disponível"}</h3>

                                    <p className="text-sm text-gray-500">
                                        <span className="font-bold">Sua resposta:</span> {response?.respostaEscolhida || "Não disponível"} {response?.correto || 'verdadeiro' ? '✅' : '❌'}
                                    </p>

                                    <p className="text-sm text-green-600">
                                        <span className="font-bold">Resposta correta:</span> {response?.question?.respostaCorreta || "Não disponível"}
                                    </p>

                                    <p className="text-sm text-gray-600">
                                        <span className="font-bold">Explicação:</span> {response?.question?.explicacao || "Sem explicação"}
                                    </p>

                                    {response?.question?.alternatives && response.question.alternatives.length > 0 && (
                                        <div className="mt-2">
                                            <span className="font-bold">Alternativas:</span>
                                            <ul className="list-disc ml-4">
                                                {response.question.alternatives.map((alt) => (
                                                    <li key={alt.letra} className={`${response.respostaEscolhida === alt.letra ? (response.correto ? 'text-green-600' : 'text-red-600') : ''}`}>
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

                        {/* 🔹 Botão para voltar à página anterior */}
                        <div className="flex justify-center mt-6">
                            <Button variant="outline" onClick={() => router.back()}>
                                Voltar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
