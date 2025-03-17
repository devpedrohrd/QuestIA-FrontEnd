'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FRONTEND_URL } from '../utils/utils';

type QuizResult = {
    questionId: string;
    respostaEscolhida: string;
    respostaCorreta: string;
    explicacao: string;
    correto: boolean;
};

export default function ResultsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [resultados, setResultados] = useState<QuizResult[]>([]);
    const [acertos, setAcertos] = useState<number | null>(null);
    const [erros, setErros] = useState<number | null>(null);

    useEffect(() => {
        // 🔹 Recupera os dados armazenados na sessão
        const storedResults = sessionStorage.getItem('quizResults');
        if (storedResults) {
            const { resultados, acertos, erros } = JSON.parse(storedResults);
            setResultados(resultados);
            setAcertos(acertos);
            setErros(erros);
        } else {
            router.push(`${FRONTEND_URL}/`); // Redireciona para a home se não houver dados
        }
    }, [router]);

    return (
        <div className="container py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Resultados do Quiz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {resultados.map((res) => (
                        <div
                            key={res.questionId}
                            className={`p-3 mb-2 rounded-md ${res.correto ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}
                        >
                            <p className="font-medium">{res.explicacao}</p>
                            <p><strong>Sua Resposta:</strong> {res.respostaEscolhida}</p>
                            <p><strong>Resposta Correta:</strong> {res.respostaCorreta}</p>
                        </div>
                    ))}

                    <p className="mt-4 text-lg">
                        <strong>Acertos:</strong> {acertos} | <strong>Erros:</strong> {erros}
                    </p>

                    <Button
                        className="w-full mt-6"
                        onClick={() => router.push('/teacher')}
                    >
                        Voltar ao Início
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
