'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import api from '@/app/services/api';

type StudentRanking = {
    alunoId: string;
    nome: string;
    email: string;
    acertos: number;
    tentativas: number;
    desempenho: string; // Exemplo: "100.00%"
};

export default function RankingPage({ params }: { params: { quizId: string } }) {
    const router = useRouter();
    const [ranking, setRanking] = useState<StudentRanking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRanking() {
            try {
                const response = await api.get<StudentRanking[]>(`/answer/ranking/${params.quizId}`);
                setRanking(response.data);
            } catch (error) {
                console.error('Erro ao carregar ranking:', error);
                toast.error('Erro ao carregar o ranking.');
            } finally {
                setLoading(false);
            }
        }

        fetchRanking();
    }, [params.quizId]);

    return (
        <div className="container py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Ranking do Quiz</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Carregando ranking...</p>
                    ) : ranking.length === 0 ? (
                        <p>Nenhum aluno respondeu a este quiz.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Aluno</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Acertos</TableHead>
                                    <TableHead>Total de Tentativas</TableHead>
                                    <TableHead>Desempenho (%)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ranking.map((student) => (
                                    <TableRow key={student.alunoId}>
                                        <TableCell>{student.nome}</TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell className="font-bold text-green-600">
                                            {student.acertos}
                                        </TableCell>
                                        <TableCell>{student.tentativas}</TableCell>
                                        <TableCell className="font-bold text-blue-600">
                                            {student.desempenho}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                <div className="p-4 flex justify-end">
                    <Button variant="outline" onClick={() => router.back()}>
                        Voltar
                    </Button>
                </div>
            </Card>
        </div>
    );
}
