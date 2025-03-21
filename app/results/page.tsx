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
    correto: boolean | null; // 🔹 Permite valores nulos para evitar erro ao renderizar
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
            try {
                const { resultados, acertos, erros } = JSON.parse(storedResults);
                setResultados(resultados || []);
                setAcertos(acertos ?? 0);
                setErros(erros ?? 0);
            } catch (error) {
                console.error("Erro ao processar os resultados do quiz:", error);
                router.push(`${FRONTEND_URL}/`); // Redireciona para a home em caso de erro
            }
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
                    {resultados.length > 0 ? (
                        resultados.map((res) => (
                            <div
                            key={res.questionId}
                                className={`p-3 mb-2 rounded-md ${res.respostaEscolhida.toLocaleLowerCase() === res.respostaCorreta.toLowerCase()
                                    ? "bg-green-100 text-green-700"  // ✅ Resposta correta (match exato)
                                    : "bg-red-100 text-red-700"      // ❌ Resposta errada
                                    }`}
                        >
                                <p className="font-medium">{res.explicacao || "Sem explicação disponível."}</p>
                                <p><strong>Sua Resposta:</strong> {res.respostaEscolhida || "Não disponível"}</p>
                                <p><strong>Resposta Correta:</strong> {res.respostaCorreta || "Não disponível"}</p>
                            </div>

                        ))
                    ) : (
                        <p className="text-gray-600">Nenhum resultado disponível.</p>
                    )}

                    <p className="mt-4 text-lg">
                        <strong>Acertos:</strong> {acertos} | <strong>Erros:</strong> {erros}
                    </p>

                    <Button
                        className="w-full mt-6"
                        onClick={() => router.push(localStorage.getItem('role') === 'professor' ? '/dashboard/teacher' : 'dashboard/students')}
                    >
                        Voltar ao Início
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
