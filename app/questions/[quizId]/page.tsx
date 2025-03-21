'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/app/services/api';

type Alternative = {
  letra: string;
  texto: string;
};

type Question = {
  id: string;
  quizId: string;
  pergunta: string;
  tipo: string;
  alternatives: Alternative[];
};

type ResponseFormDTO = {
  questionId: string;
  respostaEscolhida: string;
};

export default function QuizPage({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 🔹 Verificação de login antes de buscar as questões
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      // Se não estiver logado, redireciona para login com o redirect
      router.push(`/`);
      return;
    }

    async function fetchQuestions() {
      try {
        const response = await api.get<Question[]>(`/questions/${params.quizId}`);
        setQuestions(response.data);
      } catch (error) {
        console.error('Erro ao carregar as questões:', error);
        toast.error('Erro ao carregar as questões. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [router, params.quizId]);

  // 🔹 Atualiza a resposta selecionada pelo usuário
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // 🔹 Envia as respostas para o backend
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    // 🔹 Verifica se o usuário está logado antes de enviar respostas
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      toast.error('Sua sessão expirou. Faça login novamente.');
      router.push(`/login?redirect=/questions/${params.quizId}`);
      return;
    }

    try {
      const responseFormDTO: ResponseFormDTO[] = Object.entries(answers).map(([questionId, respostaEscolhida]) => ({
        questionId,
        respostaEscolhida,
      }));

      const response = await api.post(`/questions/${params.quizId}/responses`, responseFormDTO);
      const result = response.data;

      toast.success('Respostas enviadas com sucesso!');
      // 🔹 Armazena os resultados no sessionStorage antes de redirecionar
      sessionStorage.setItem('quizResults', JSON.stringify({
        resultados: result.resultados,
        acertos: result.acertos,
        erros: result.erros,
      }));

      // 🔹 Redireciona para a tela de resultados
      router.push('/results');
    } catch (error) {
      console.error('Erro ao enviar as respostas:', error);
      toast.error('Erro ao enviar as respostas. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 Exibe um spinner de carregamento enquanto busca as questões
  if (loading) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-4">
              <h3 className="text-lg font-medium">
                {index + 1}. {question.pergunta}
              </h3>

              {/* Verifica se a questão é de múltipla escolha ou verdadeiro/falso */}
              {question.tipo === "multipla_escolha" ? (
                <RadioGroup
                  value={answers[question.id] || ''}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                >
                  {question.alternatives.map((alt) => (
                    <div key={alt.letra} className="flex items-center space-x-2">
                      <RadioGroupItem value={alt.letra} id={`${question.id}-${alt.letra}`} />
                      <Label htmlFor={`${question.id}-${alt.letra}`}>{alt.letra}) {alt.texto}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <RadioGroup
                  value={answers[question.id] || ''}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="verdadeiro" id={`${question.id}-verdadeiro`} />
                    <Label htmlFor={`${question.id}-verdadeiro`}>Verdadeiro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="falso" id={`${question.id}-falso`} />
                    <Label htmlFor={`${question.id}-falso`}>Falso</Label>
                  </div>
                </RadioGroup>
              )}
            </div>
          ))}

          <Button
            className="w-full mt-6"
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length !== questions.length}
          >
            {submitting ? "Enviando..." : "Submit Answers"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
